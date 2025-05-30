from fastapi import APIRouter

from api.modules.authentication import router as auth_router
from api.modules.chat import router as chat_router
from api.modules.document_chat import router as document_chat_router
from api.modules.document_extraction import router as document_extraction
from api.modules.file_storage import router as file_storage_router
from api.modules.graph_agent import router as graph_agent_router
from api.modules.knowledge_base import router as knowledge_base_router
from api.modules.users import router as user_router

api_router = APIRouter()

api_router.include_router(document_extraction.router)
api_router.include_router(file_storage_router.router)
api_router.include_router(user_router.router)
api_router.include_router(auth_router.router)
api_router.include_router(chat_router.router)
api_router.include_router(graph_agent_router.router)
api_router.include_router(knowledge_base_router.router)
api_router.include_router(document_chat_router.router)
