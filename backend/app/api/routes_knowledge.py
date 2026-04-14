from fastapi import APIRouter

from app.core.deps import CurrentUser
from app.schemas.knowledge import (
    KnowledgeDocumentCreate,
    KnowledgeDocumentListResponse,
    KnowledgeDocumentSummary,
    KnowledgeSearchRequest,
    KnowledgeSearchResponse,
)
from app.services.knowledge_service import (
    create_knowledge_document,
    list_knowledge_documents,
    search_knowledge,
)

router = APIRouter(prefix="/knowledge")


@router.get("/documents", response_model=KnowledgeDocumentListResponse)
async def get_knowledge_documents(_: CurrentUser) -> KnowledgeDocumentListResponse:
    return await list_knowledge_documents()


@router.post("/documents", response_model=KnowledgeDocumentSummary)
async def add_knowledge_document(
    payload: KnowledgeDocumentCreate,
    _: CurrentUser,
) -> KnowledgeDocumentSummary:
    return await create_knowledge_document(payload)


@router.post("/search", response_model=KnowledgeSearchResponse)
async def search_knowledge_base(
    payload: KnowledgeSearchRequest,
    _: CurrentUser,
) -> KnowledgeSearchResponse:
    return await search_knowledge(payload)
