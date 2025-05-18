from typing import Annotated

from fastapi import Depends
from qdrant_client import QdrantClient

from api.core.config import settings
from api.logger import logger

from .service import KnowledgeBaseService


def get_qdrant_client() -> QdrantClient:
    logger.debug(">> Creating Qdrant client")
    return QdrantClient(
        host=settings.QDRANT_HOST,
        port=settings.QDRANT_PORT,
    )


QdrantClientDep = Annotated[QdrantClient, Depends(get_qdrant_client)]

service = KnowledgeBaseService()


def get_knowledge_base_service() -> KnowledgeBaseService:
    return service


KnowledgeBaseServiceDep = Annotated[
    KnowledgeBaseService,
    Depends(get_knowledge_base_service),
]
