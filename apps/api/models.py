import uuid
from datetime import datetime, timezone
from typing import Optional

from pydantic import EmailStr, field_validator
from sqlmodel import Column, DateTime, Field, SQLModel

from api.core.security import get_password_hash


def utcnow():
    return datetime.now(timezone.utc)


class TimeStampMixin(SQLModel):
    created_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, nullable=False), default=None
    )
    updated_at: Optional[datetime] = Field(
        sa_column=Column(DateTime, default=utcnow, onupdate=utcnow), default=None
    )


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


class UserPublic(UserBase, TimeStampMixin):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)


class UsersPublic(SQLModel):
    data: list[UserPublic]
    pagination: Pagination


class User(UserBase, TimeStampMixin, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    password: str

    @field_validator("password", mode="after")
    @classmethod
    def generate_hashed_password(cls, value: str) -> str:
        return get_password_hash(password=value)

    def __repr__(self) -> str:
        return f"{self.id}: {self.username}, {self.email}"


class TokenPayload(SQLModel):
    sub: str | None = None


class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"
