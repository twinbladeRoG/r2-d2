import logging

from api.core.config import settings

logger = logging.getLogger("uvicorn")
logger.setLevel(settings.LOG_LEVEL)
