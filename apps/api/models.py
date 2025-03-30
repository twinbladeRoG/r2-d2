import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import EmailStr, field_validator
from sqlmodel import Column, DateTime, Field, Relationship, SQLModel

from api.core.security import get_password_hash


def utcnow():
    return datetime.now(timezone.utc)


class Pagination(SQLModel):
    page: int
    limit: int
    total_pages: int
    total_count: int
    has_next: bool
    has_previous: bool


class UserBase(SQLModel):
    username: str = Field(unique=True, min_items=1, max_length=255)
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    first_name: str = Field(default=None, max_length=255)
    last_name: Optional[str] = Field(default=None, max_length=255)


class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)


class UserPublic(UserBase):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, nullable=False), default=None
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, onupdate=utcnow), default=None
    )


class UsersPublic(SQLModel):
    data: list[UserPublic]
    pagination: Pagination


class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, nullable=False), default=None
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, onupdate=utcnow), default=None
    )

    password: str

    documents: list["Document"] = Relationship(back_populates="owner")
    conversations: list["Conversation"] = Relationship(back_populates="user")

    @field_validator("password", mode="after")
    @classmethod
    def generate_hashed_password(cls, value: str) -> str:
        return get_password_hash(password=value)

    def __repr__(self) -> str:
        return f"{self.id}: {self.username}, {self.email}"


class TokenPayload(SQLModel):
    sub: str | None = None


class AccessToken(SQLModel):
    access_token: str
    token_type: str = "bearer"


class Token(AccessToken):
    refresh_token: str


class DocumentBase(SQLModel):
    filename: str = Field(min_length=1, max_length=255)
    original_filename: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=255)
    content_length: int = Field(ge=0)


class Document(DocumentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, nullable=False), default=None
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, onupdate=utcnow), default=None
    )

    owner_id: uuid.UUID = Field(foreign_key="user.id")
    owner: User = Relationship(back_populates="documents")


class ChatMessageBase(SQLModel):
    message: str = Field(min_length=1)
    role: str = Field(min_items=1, max_length=255)


class ChatMessageCreate(ChatMessageBase):
    conversation_id: uuid.UUID | None = None


class ChatMessage(ChatMessageBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, nullable=False), default=None
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, onupdate=utcnow), default=None
    )

    conversation_id: uuid.UUID = Field(foreign_key="conversation.id")
    conversation: "Conversation" = Relationship(back_populates="chat_messages")


class ConversationBase(SQLModel):
    title: str = Field(min_items=1, max_length=255, nullable=True, default="")


class ConversationWithChatMessages(ConversationBase):
    id: uuid.UUID
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    user_id: uuid.UUID
    chat_messages: list[ChatMessage] = []


class Conversation(ConversationBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, nullable=False), default=None
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, onupdate=utcnow), default=None
    )

    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: User = Relationship(back_populates="conversations")

    chat_messages: list[ChatMessage] = Relationship(
        back_populates="conversation", cascade_delete=True
    )
