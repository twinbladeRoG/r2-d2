from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse

from .agent import get_answer, graph
from .schema import AgentChatCreate

router = APIRouter(prefix="/agent", tags=["Agent"])


@router.get("/workflow")
def chat():
    mermaid = graph.get_graph().draw_mermaid()
    state = graph.get_graph().to_json()

    return {"mermaid": mermaid, "state": state}


@router.post("/")
def chat(body: AgentChatCreate):
    return StreamingResponse(
        get_answer(conversation_id=body.conversation_id, message=body.message),
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )
