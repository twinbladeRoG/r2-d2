from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from api.core.config import settings
from api.core.security import create_access_token
from api.dependencies import SessionDep
from api.models import Token
from api.modules.authentication.service import AuthenticationService

router = APIRouter(prefix="/authentication", tags=["Authentication"])


@router.post("/user/login")
def login_user(
    session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> Token:
    auth_service = AuthenticationService()
    user = auth_service.authenticate(
        session=session, email=form_data.username, password=form_data.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return Token(
        access_token=create_access_token(user.id, expires_delta=access_token_expires)
    )
