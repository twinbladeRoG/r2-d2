from typing import Annotated

from fastapi import Depends
from qdrant_client import QdrantClient

from api.core.config import settings
from api.logger import logger


def get_qdrant_client() -> QdrantClient:
    logger.debug(">> Creating Qdrant client")
    return QdrantClient(
        host=settings.QDRANT_HOST,
        port=settings.QDRANT_PORT,
    )


QdrantClientDep = Annotated[QdrantClient, Depends(get_qdrant_client)]
