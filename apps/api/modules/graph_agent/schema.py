from typing import Any, Optional

from sqlmodel import Field, SQLModel


class AgentChatCreate(SQLModel):
    message: str = Field(min_length=1)
    conversation_id: Optional[str] = None


class AgentWorkflowResponse(SQLModel):
    mermaid: str
    state: dict[str, list[dict[str, Any]]]
