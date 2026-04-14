from datetime import datetime

from pydantic import BaseModel, Field


class KnowledgeDocumentCreate(BaseModel):
    title: str = Field(min_length=3, max_length=200)
    source: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=50)
    tags: list[str] = Field(default_factory=list)
    roles: list[str] = Field(default_factory=list)


class KnowledgeSource(BaseModel):
    document_id: str
    title: str
    source: str
    snippet: str
    score: float
    tags: list[str] = Field(default_factory=list)
    roles: list[str] = Field(default_factory=list)


class KnowledgeDocumentSummary(BaseModel):
    id: str
    title: str
    source: str
    tags: list[str] = Field(default_factory=list)
    roles: list[str] = Field(default_factory=list)
    chunk_count: int = 0
    created_at: datetime


class KnowledgeDocumentListResponse(BaseModel):
    documents: list[KnowledgeDocumentSummary]


class KnowledgeSearchRequest(BaseModel):
    query: str = Field(min_length=3)
    role: str | None = None
    tags: list[str] = Field(default_factory=list)
    top_k: int = Field(default=5, ge=1, le=10)


class KnowledgeSearchResponse(BaseModel):
    query: str
    sources: list[KnowledgeSource]
