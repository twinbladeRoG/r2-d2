from typing import Annotated

from fastapi import APIRouter, Query

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep
from api.error import UserDefinedException

from .dependencies import KnowledgeBaseServiceDep

router = APIRouter(prefix="/knowledge-base", tags=["Knowledge Base"])


@router.get("/")
def get_knowledge_base():
    return {"message": "Knowledge Base API"}


@router.post("/{document_id}")
def create_knowledge_base(
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


@router.get("/{document_id}")
def search_from_knowledge_base(
    document_id: str,
    knowledge_base_service: KnowledgeBaseServiceDep,
    query: Annotated[
        str | None, Query(max_length=256, description="Query string for search")
    ],
):
    if query == None or len(query.strip()) == 0:
        return UserDefinedException(message="Query is empty", code="EMPTY_QUERY")

    results = knowledge_base_service.search_from_vector_store(document_id, query)

    return results
