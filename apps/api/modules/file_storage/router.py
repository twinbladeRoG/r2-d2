from fastapi import APIRouter, UploadFile

from .service import FileStorageService

router = APIRouter(prefix="/file-storage", tags=["File Storage"])


@router.get("/")
def get_all_files():
    return {"message": "Get all files"}


@router.post("/")
async def create_file(file: UploadFile):
    file_storage_service = FileStorageService()
    response = await file_storage_service.upload_file(file)
    return {"message": "Create file", "data": response}


@router.delete("/")
def delete_file():
    return {"message": "Delete file"}
