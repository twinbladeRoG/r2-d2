from fastapi import APIRouter

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep
from api.models import KnowledgeBase

from .dependencies import KnowledgeBaseServiceDep
from .schemas import KnowledgeBaseCreate, KnowledgeBaseWithDocuments

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


@router.post("/{document_id}")
def create_knowledge_base_for_document(
    document_id: str,
    session: SessionDep,
    user: CurrentUser,
    knowledge_base_service: KnowledgeBaseServiceDep,
    document_service: FileStorageServiceDep,
):
    document = document_service.get_file(
        user=user, session=session, file_id=document_id
    )

    embeddings = knowledge_base_service.store_to_vector_store(document)

    return {"embedding_points": embeddings}


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
