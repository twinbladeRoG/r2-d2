from fastapi import APIRouter, UploadFile

from api.dependencies import CurrentUser, SessionDep
from api.models import Document, DocumentBase

from .service import FileStorageService

router = APIRouter(prefix="/file-storage", tags=["File Storage"])


@router.get("/")
def get_all_files(session: SessionDep, user: CurrentUser) -> list[Document]:
    file_storage_service = FileStorageService()
    files = file_storage_service.get_user_files(session, user)
    return files


@router.post("/")
async def create_file(
    file: UploadFile, session: SessionDep, user: CurrentUser
) -> Document:
    file_storage_service = FileStorageService()
    response = await file_storage_service.upload_file(
        session=session, user=user, file=file
    )
    return response


@router.delete("/{file_id}")
def delete_file(file_id: int, user: CurrentUser):
    return {"message": "Delete file"}
