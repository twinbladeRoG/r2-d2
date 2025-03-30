from fastapi import APIRouter

from api.dependencies import CurrentUser, SessionDep
from api.models import ChatMessage, ChatMessageCreate, ConversationWithChatMessages

from .dependencies import ChatServiceDep

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatMessage)
def chat(
    chat_service: ChatServiceDep,
    chat_message: ChatMessageCreate,
    user: CurrentUser,
    session: SessionDep,
):
    result = chat_service.chat(chat_message, user, session)
    return result


@router.get("/")
def get_user_conversations(
    session: SessionDep, user: CurrentUser, chat_service: ChatServiceDep
):
    result = chat_service.get_users_conversations(session, user)
    return result


@router.get("/{conversation_id}", response_model=ConversationWithChatMessages)
def get_conversation(
    session: SessionDep,
    user: CurrentUser,
    chat_service: ChatServiceDep,
    conversation_id: str,
):
    result = chat_service.get_conversation(conversation_id, session, user)
    return result


@router.delete("/{conversation_id}")
def delete_conversation(
    session: SessionDep,
    user: CurrentUser,
    chat_service: ChatServiceDep,
    conversation_id: str,
):
    chat_service.delete_conversation(session, user, conversation_id)
    return None
