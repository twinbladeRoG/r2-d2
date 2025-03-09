from fastapi import APIRouter

from . import document_extraction

api_router = APIRouter()
api_router.include_router(document_extraction.router)
