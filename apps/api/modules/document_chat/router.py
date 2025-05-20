from fastapi import APIRouter

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep
from api.modules.knowledge_base.dependencies import KnowledgeBaseServiceDep

from .dependencies import DocumentChatServiceDep
from .schemas import ChatMessageWithCitations, DocumentChatMessageCreate

router = APIRouter(prefix="/document-chat", tags=["Document Chat"])


@router.post("/", response_model=ChatMessageWithCitations)
def chat(
    chat_service: DocumentChatServiceDep,
    chat_message: DocumentChatMessageCreate,
    knowledge_base_service: KnowledgeBaseServiceDep,
    file_storage_service: FileStorageServiceDep,
    user: CurrentUser,
    session: SessionDep,
):
    result = chat_service.chat(
        chat_message, user, session, knowledge_base_service, file_storage_service
    )
    return result
