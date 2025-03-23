from fastapi import APIRouter, UploadFile

from api.dependencies import CurrentUser

from .service import FileStorageService

router = APIRouter(prefix="/file-storage", tags=["File Storage"])


@router.get("/")
def get_all_files(user: CurrentUser):
    return {"message": "Get all files"}


@router.post("/")
async def create_file(file: UploadFile, user: CurrentUser):
    file_storage_service = FileStorageService()
    response = await file_storage_service.upload_file(file)
    return {"message": "Create file", "data": response}


@router.delete("/{file_id}")
def delete_file(file_id: int, user: CurrentUser):
    return {"message": "Delete file"}
