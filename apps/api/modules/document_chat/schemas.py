import uuid

from sqlmodel import SQLModel

from api.models import ChatMessage, ChatMessageCreate, Document


class DocumentChatMessageCreate(ChatMessageCreate):
    knowledge_base_id: uuid.UUID


class Citation(SQLModel):
    point_id: int | str
    score: float
    document: Document
    page_number: int
    chuck: str


class ChatMessageWithCitations(SQLModel):
    chat_message: ChatMessage
    citations: list[Citation] = []
