import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import EmailStr
from sqlmodel import Column, DateTime, Field, SQLModel


def utcnow():
    return datetime.now(timezone.utc)


class TimeStampMixin(SQLModel):
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, nullable=False)
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, onupdate=utcnow)
    )


class DocumentModel(TimeStampMixin):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class UserBase(SQLModel):
    username: str = Field(unique=True, min_items=1, max_length=255)
    password: str
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    first_name: str = Field(default=None, max_length=255)
    last_name: Optional[str] = Field(default=None, max_length=255)


class User(UserBase, DocumentModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

    def __repr__(self) -> str:
        return f"{self.id}: {self.username}, {self.email}"
