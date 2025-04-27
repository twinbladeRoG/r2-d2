from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from api.core.config import settings
from api.core.security import create_access_token, create_refresh_token
from api.dependencies import (
    AuthenticationServiceDep,
    CurrentUser,
    SessionDep,
    UserServiceDep,
)
from api.models import AccessToken, Token, UserCreate, UserPublic

router = APIRouter(prefix="/authentication", tags=["Authentication"])


@router.post("/user/login")
def login_user(
    session: SessionDep,
    auth_service: AuthenticationServiceDep,
    user_service: UserServiceDep,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
) -> Token:
    user = auth_service.authenticate(
        session=session,
        user_service=user_service,
        email=form_data.username,
        password=form_data.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)

    return Token(
        access_token=create_access_token(user.id, expires_delta=access_token_expires),
        refresh_token=create_refresh_token(
            user.id, expires_delta=refresh_token_expires
        ),
    )


@router.post(
    "/user/register",
)
def create_user(
    *,
    session: SessionDep,
    auth_service: AuthenticationServiceDep,
    user_service: UserServiceDep,
    user_data: UserCreate,
) -> UserPublic:
    user = auth_service.register_user(session, user_service, user_data)
    return user


@router.get("/user/refresh")
def refresh_jwt_token(
    *,
    user: CurrentUser,
):
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return AccessToken(
        access_token=create_access_token(user.id, expires_delta=access_token_expires)
    )
