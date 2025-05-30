from typing import Annotated

from fastapi import APIRouter, Query, UploadFile

from api.dependencies import CurrentUser, FileStorageServiceDep, SessionDep
from api.models import Document
from api.modules.knowledge_base.dependencies import KnowledgeBaseServiceDep

from .schemas import FileFilterParams

router = APIRouter(prefix="/file-storage", tags=["File Storage"])


@router.get("/")
def get_all_files(
    session: SessionDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
    query: Annotated[FileFilterParams, Query()],
) -> list[Document]:
    files = file_storage_service.get_user_files(session, user, query)
    return files


@router.post("/")
async def create_file(
    file: UploadFile,
    session: SessionDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
) -> Document:
    response = await file_storage_service.upload_file(
        session=session, user=user, file=file
    )
    return response


@router.get("/{file_id}")
def get_file(
    session: SessionDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
    file_id: str,
):
    document = file_storage_service.get_file(user, session, file_id)
    return document


@router.delete("/{file_id}")
def delete_file(
    file_id: str,
    session: SessionDep,
    user: CurrentUser,
    file_storage_service: FileStorageServiceDep,
    knowledge_base_service: KnowledgeBaseServiceDep,
):
    file_storage_service.remove_file(session, user, knowledge_base_service, file_id)
    return None
