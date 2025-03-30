from fastapi import FastAPI, Request, status
from fastapi.exceptions import HTTPException, RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from api.core.config import settings
from api.error import UserDefinedException
from api.routes.main import api_router

app = FastAPI()

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
