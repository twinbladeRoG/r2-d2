from typing import Any, Optional

from sqlmodel import Field, SQLModel


class InterruptResponse(SQLModel):
    message: str
    tool_id: str


class AgentChatCreate(SQLModel):
    message: str = Field(min_length=1)
    conversation_id: Optional[str] = None
    interrupt_response: Optional[InterruptResponse] | None = None


class AgentWorkflowResponse(SQLModel):
    mermaid: str
    state: dict[str, list[dict[str, Any]]]
