import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.core.config import settings
from api.error import UserDefinedException
from api.modules.kafka.consumer import consume, create_kafka_consumer
from api.modules.kafka.enums import KafkaTopic
from api.routes.main import api_router

logger = logging.getLogger("uvicorn")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for the FastAPI application.
    """
    loop = asyncio.get_event_loop()
    consumer = create_kafka_consumer(
        topic=KafkaTopic.EXTRACT_DOCUMENT.value, group_id="extract", loop=loop
    )
    task = asyncio.create_task(consume(consumer))
    try:
        yield
    except asyncio.CancelledError:
        logger.error("Lifespan task cancelled")
        pass
    except Exception as e:
        logger.error(f"Error in lifespan: {e}")
    finally:
        await consumer.stop()
        task.cancel()


app = FastAPI(lifespan=lifespan)

if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": f"Oops! {exc.detail}"},
    )


# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     return JSONResponse(
#         status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
#         content={"detail": exc.errors(), "body": exc.body},
#     )


@app.exception_handler(UserDefinedException)
async def user_defined_exception_handler(request: Request, exc: UserDefinedException):
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"name": exc.name, "message": exc.message},
    )


app.include_router(api_router, prefix=settings.API_V1_STR)
