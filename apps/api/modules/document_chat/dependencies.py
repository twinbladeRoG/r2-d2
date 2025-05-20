from typing import Annotated

from fastapi import Depends

from .service import DocumentChatService


def create_document_chat_service():
    return DocumentChatService()


DocumentChatServiceDep = Annotated[
    DocumentChatService, Depends(create_document_chat_service)
]
