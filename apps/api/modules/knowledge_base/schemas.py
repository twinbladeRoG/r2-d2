from sqlmodel import Field, SQLModel

from api.models import Document, KnowledgeBaseBase


class KnowledgeBaseCreate(SQLModel):
    name: str
    documents: list[str] = Field(..., min_length=1, max_length=255)


class KnowledgeBaseWithDocuments(KnowledgeBaseBase):
    documents: list[Document]


class KnowledgeBaseAddDocumentsRequest(SQLModel):
    document_ids: list[str] = Field(..., min_length=1, max_length=255)
