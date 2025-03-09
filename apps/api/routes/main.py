from fastapi import APIRouter
from modules.document_extraction import router as document_extraction
from modules.file_storage import router as file_storage_router

api_router = APIRouter()
api_router.include_router(document_extraction.router)
api_router.include_router(file_storage_router.router)
