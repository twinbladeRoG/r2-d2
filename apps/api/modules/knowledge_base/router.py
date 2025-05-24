from fastapi import APIRouter

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep
from api.models import KnowledgeBase

from .dependencies import KnowledgeBaseServiceDep
from .schemas import (
    KnowledgeBaseAddDocumentsRequest,
    KnowledgeBaseCreate,
    KnowledgeBaseWithDocuments,
)

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])


@router.get("/", response_model=list[KnowledgeBase])
def get_knowledge_base(
    session: SessionDep,
    user: CurrentUser,
    knowledge_base_service: KnowledgeBaseServiceDep,
):
    result = knowledge_base_service.get_knowledge_bases(session, user)
    return result


@router.post("/", response_model=KnowledgeBase)
def create_knowledge_base(
    session: SessionDep,
    user: CurrentUser,
    knowledge_base_service: KnowledgeBaseServiceDep,
    file_service: FileStorageServiceDep,
    body: KnowledgeBaseCreate,
):
    result = knowledge_base_service.create_knowledge_base(
        session=session, user=user, file_service=file_service, payload=body
    )
    return result


@router.get("/{knowledge_base_id}", response_model=KnowledgeBaseWithDocuments)
def get_knowledge_base(
    knowledge_base_id: str,
    session: SessionDep,
    user: CurrentUser,
    knowledge_base_service: KnowledgeBaseServiceDep,
):
    result = knowledge_base_service.get_knowledge_base_by_id(
        session, user, knowledge_base_id
    )
    return result


@router.delete("/{knowledge_base_id}")
def delete_knowledge_base(
    knowledge_base_id: str,
    session: SessionDep,
    user: CurrentUser,
    knowledge_base_service: KnowledgeBaseServiceDep,
):
    result = knowledge_base_service.delete_knowledge_base(
        session, user, knowledge_base_id
    )
    return result


@router.put("/{knowledge_base_id}/documents", response_model=KnowledgeBaseWithDocuments)
def add_documents_to_knowledge_base(
    knowledge_base_id: str,
    session: SessionDep,
    user: CurrentUser,
    knowledge_base_service: KnowledgeBaseServiceDep,
    file_storage_service: FileStorageServiceDep,
    body: KnowledgeBaseAddDocumentsRequest,
):
    result = knowledge_base_service.add_document_to_knowledge_base(
        session, user, file_storage_service, knowledge_base_id, body.document_ids
    )

    return result


@router.delete("/{knowledge_base_id}/documents/{document_id}")
def remove_document_from_knowledge_base(
    knowledge_base_id: str,
    document_id: str,
    session: SessionDep,
    user: CurrentUser,
    knowledge_base_service: KnowledgeBaseServiceDep,
    file_storage_service: FileStorageServiceDep,
):
    result = knowledge_base_service.remove_document_from_knowledge_base(
        session, user, file_storage_service, knowledge_base_id, document_id
    )

    return result


@router.post("/{knowledge_base_id}/add-to-vector-store")
def add_knowledge_base_to_vector_store(
    knowledge_base_id: str,
    session: SessionDep,
    user: CurrentUser,
    knowledge_base_service: KnowledgeBaseServiceDep,
) -> None:
    result = knowledge_base_service.create_embeddings_for_documents(
        session, user, knowledge_base_id
    )
    return result
