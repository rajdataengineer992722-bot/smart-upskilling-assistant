import re
from datetime import UTC, datetime

from rank_bm25 import BM25Okapi

from app.db.mongodb import get_database
from app.schemas.knowledge import (
    KnowledgeDocumentCreate,
    KnowledgeDocumentListResponse,
    KnowledgeDocumentSummary,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
    KnowledgeSource,
)

TOKEN_PATTERN = re.compile(r"[a-zA-Z0-9_+#.-]+")


def _normalize_list(values: list[str]) -> list[str]:
    seen: set[str] = set()
    normalized: list[str] = []
    for value in values:
        cleaned = value.strip()
        lowered = cleaned.lower()
        if cleaned and lowered not in seen:
            seen.add(lowered)
            normalized.append(cleaned)
    return normalized


def _tokenize(text: str) -> list[str]:
    return [token.lower() for token in TOKEN_PATTERN.findall(text)]


def _chunk_text(content: str, chunk_size: int = 900, overlap: int = 180) -> list[str]:
    cleaned = re.sub(r"\s+", " ", content).strip()
    if len(cleaned) <= chunk_size:
        return [cleaned]

    chunks: list[str] = []
    start = 0
    while start < len(cleaned):
        end = min(start + chunk_size, len(cleaned))
        if end < len(cleaned):
            split_at = cleaned.rfind(". ", start, end)
            if split_at > start + 200:
                end = split_at + 1
        chunk = cleaned[start:end].strip()
        if chunk:
            chunks.append(chunk)
        if end == len(cleaned):
            break
        start = max(end - overlap, 0)
    return chunks


async def create_knowledge_document(payload: KnowledgeDocumentCreate) -> KnowledgeDocumentSummary:
    database = get_database()
    roles = _normalize_list(payload.roles)
    tags = _normalize_list(payload.tags)
    now = datetime.now(UTC)

    document = {
        "title": payload.title.strip(),
        "source": payload.source.strip(),
        "content": payload.content.strip(),
        "roles": roles,
        "tags": tags,
        "created_at": now,
    }

    insert_result = await database.knowledge_documents.insert_one(document)
    document_id = insert_result.inserted_id

    chunks = _chunk_text(payload.content)
    chunk_documents = [
        {
            "document_id": document_id,
            "title": payload.title.strip(),
            "source": payload.source.strip(),
            "content": chunk,
            "roles": roles,
            "tags": tags,
            "created_at": now,
        }
        for chunk in chunks
    ]
    if chunk_documents:
        await database.knowledge_chunks.insert_many(chunk_documents)

    return KnowledgeDocumentSummary(
        id=str(document_id),
        title=document["title"],
        source=document["source"],
        tags=tags,
        roles=roles,
        chunk_count=len(chunk_documents),
        created_at=now,
    )


async def list_knowledge_documents() -> KnowledgeDocumentListResponse:
    database = get_database()
    documents = await database.knowledge_documents.find().sort("created_at", -1).to_list(length=100)
    summaries: list[KnowledgeDocumentSummary] = []
    for document in documents:
        chunk_count = await database.knowledge_chunks.count_documents({"document_id": document["_id"]})
        summaries.append(
            KnowledgeDocumentSummary(
                id=str(document["_id"]),
                title=document["title"],
                source=document["source"],
                tags=document.get("tags", []),
                roles=document.get("roles", []),
                chunk_count=chunk_count,
                created_at=document["created_at"],
            )
        )
    return KnowledgeDocumentListResponse(documents=summaries)


def _score_chunk(chunk: dict, query_tokens: list[str], bm25_score: float, role: str | None, tags: list[str]) -> float:
    score = max(float(bm25_score), 0.0)
    score += min(len(set(query_tokens) & set(_tokenize(chunk["content"]))) * 0.12, 1.2)

    if role and role in chunk.get("roles", []):
        score += 1.2
    elif not chunk.get("roles"):
        score += 0.3

    if tags:
        overlap = len({tag.lower() for tag in tags} & {tag.lower() for tag in chunk.get("tags", [])})
        score += overlap * 0.5

    return round(score, 4)


async def search_knowledge_sources(
    query: str,
    role: str | None = None,
    tags: list[str] | None = None,
    top_k: int = 5,
) -> list[KnowledgeSource]:
    database = get_database()
    filters: dict = {}
    normalized_tags = _normalize_list(tags or [])
    if role:
        filters["$or"] = [{"roles": role}, {"roles": {"$size": 0}}]
    if normalized_tags:
        tag_filter = {"tags": {"$in": normalized_tags}}
        if filters:
            filters = {"$and": [filters, tag_filter]}
        else:
            filters = tag_filter

    chunks = await database.knowledge_chunks.find(filters).to_list(length=500)
    if not chunks:
        chunks = await database.knowledge_chunks.find().to_list(length=500)
    if not chunks:
        return []

    corpus = [_tokenize(chunk["content"]) for chunk in chunks]
    query_tokens = _tokenize(query)
    if not query_tokens:
        return []

    bm25 = BM25Okapi(corpus)
    scores = bm25.get_scores(query_tokens)

    ranked = []
    for chunk, score in zip(chunks, scores):
        final_score = _score_chunk(chunk, query_tokens, score, role, normalized_tags)
        if final_score <= 0:
            continue
        ranked.append((chunk, final_score))

    ranked.sort(key=lambda item: item[1], reverse=True)
    top_chunks = ranked[:top_k]
    return [
        KnowledgeSource(
            document_id=str(chunk["document_id"]),
            title=chunk["title"],
            source=chunk["source"],
            snippet=chunk["content"][:280] + ("..." if len(chunk["content"]) > 280 else ""),
            score=score,
            tags=chunk.get("tags", []),
            roles=chunk.get("roles", []),
        )
        for chunk, score in top_chunks
    ]


async def search_knowledge(payload: KnowledgeSearchRequest) -> KnowledgeSearchResponse:
    sources = await search_knowledge_sources(
        query=payload.query,
        role=payload.role,
        tags=payload.tags,
        top_k=payload.top_k,
    )
    return KnowledgeSearchResponse(query=payload.query, sources=sources)
