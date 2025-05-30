from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep
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
def chat(
    agent_name: str,
    body: AgentChatCreate,
    agent: AgentDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
    session: SessionDep,
):
    if agent is None:
        logger.info(f"Agent {agent_name} not found")
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")

    agent.add_service("user", user)
    agent.add_service("file_storage", file_storage_service)
    agent.add_service("session", session)

    return StreamingResponse(
        agent.get_answer(
            conversation_id=body.conversation_id,
            message=body.message,
            interrupt_response=body.interrupt_response,
        ),
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream",
        },
    )


@router.get("/{agent_name}/chat/{conversation_id}")
def chat_history(agent_name: str, conversation_id: str, agent: AgentDep):
    if agent is None:
        logger.info(f"Agent {agent_name} not found")
        raise HTTPException(status_code=404, detail=f"Agent {agent_name} not found")

    history = agent.get_history(conversation_id)

    return history
