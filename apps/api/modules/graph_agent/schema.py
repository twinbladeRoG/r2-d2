from sqlmodel import Field, SQLModel


class AgentChatCreate(SQLModel):
    message: str = Field(min_length=1)
