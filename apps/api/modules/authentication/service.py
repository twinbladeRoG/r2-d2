from fastapi import HTTPException
from sqlmodel import Session

from api.core.security import verify_password
from api.models import UserCreate
from api.modules.users.service import UserService


class AuthenticationService:
    def authenticate(
        self, session: Session, user_service: UserService, email: str, password: str
    ):
        user = user_service.get_user_by_email(session=session, email=email)
        if not user:
            return None
        if not verify_password(password, user.password):
            return None
        return user

    def register_user(
        self, session: Session, user_service: UserService, user_data: UserCreate
    ):
        user = user_service.get_user_by_email(session=session, email=user_data.email)

        if user:
            raise HTTPException(
                status_code=400, detail="The user with this email already exists."
            )

        user = user_service.get_user_by_username(
            session=session, username=user_data.username
        )

        if user:
            raise HTTPException(
                status_code=400, detail="The user with this username already exists."
            )

        user = user_service.create_user(session=session, user_data=user_data)

        return user
