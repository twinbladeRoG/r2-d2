from fastapi import FastAPI

from api.core.config import settings
from api.routes.main import api_router

app = FastAPI()

app.include_router(api_router, prefix=settings.API_V1_STR)
