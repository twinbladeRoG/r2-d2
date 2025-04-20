from fastapi import APIRouter
from fastapi.responses import StreamingResponse

from .dependencies import WebSearchAgentDep
from .schema import AgentChatCreate

router = APIRouter(prefix="/agent", tags=["Agent"])


@router.get("/workflow")
def chat(agent: WebSearchAgentDep):
    graph = agent.build_graph()
    mermaid = graph.get_graph().draw_mermaid()
    state = graph.get_graph().to_json()

    return {"mermaid": mermaid, "state": state}


@router.post("/")
def chat(body: AgentChatCreate, agent: WebSearchAgentDep):
    return StreamingResponse(
        agent.get_answer(conversation_id=body.conversation_id, message=body.message),
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )
