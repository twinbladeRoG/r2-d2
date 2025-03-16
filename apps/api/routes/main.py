from fastapi import APIRouter

from api.modules.authentication import router as auth_router
from api.modules.document_extraction import router as document_extraction
from api.modules.file_storage import router as file_storage_router
from api.modules.users import router as user_router

api_router = APIRouter()

api_router.include_router(document_extraction.router)
api_router.include_router(file_storage_router.router)
api_router.include_router(user_router.router)
api_router.include_router(auth_router.router)
