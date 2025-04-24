from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from api.logger import logger

from .dependencies import AgentDep
from .schema import AgentChatCreate, AgentWorkflowResponse

router = APIRouter(prefix="/agent", tags=["Agent"])


@router.get("/{agent_name}/workflow", response_model=AgentWorkflowResponse)
def chat(agent_name: str, agent: AgentDep):
    if agent is None:
        logger.info(f"Agent {agent_name} not found")
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")

    graph = agent.build_graph()
    mermaid = graph.get_graph().draw_mermaid()
    state = graph.get_graph().to_json()

    response = AgentWorkflowResponse(mermaid=mermaid, state=state)

    return response


@router.post("/{agent_name}/chat")
def chat(agent_name: str, body: AgentChatCreate, agent: AgentDep):
    if agent is None:
        logger.info(f"Agent {agent_name} not found")
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")

    return StreamingResponse(
        agent.get_answer(conversation_id=body.conversation_id, message=body.message),
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )
