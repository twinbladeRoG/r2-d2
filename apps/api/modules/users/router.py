from typing import Annotated, Any

from fastapi import APIRouter, HTTPException, Query

from api.dependencies import CurrentUser, SessionDep
from api.models import UserCreate, UserPublic, UsersPublic
from api.modules.utils.pagination import (
    PaginationOutOfBoundException,
    PaginationQueryParams,
)

from .service import UserService

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=UsersPublic)
def get_all_users(
    session: SessionDep,
    query: Annotated[PaginationQueryParams, Query()],
):
    user_service = UserService()

    try:
        result = user_service.get_users(
            session=session, page=query.page, limit=query.limit
        )
        return result
    except PaginationOutOfBoundException as e:
        return HTTPException(status_code=400, detail=str(e))


@router.post("/", response_model=UserPublic)
def create_user(*, session: SessionDep, user_data: UserCreate) -> Any:
    """
    Create new user
    """
    user_service = UserService()
    user = user_service.get_user_by_email(session=session, email=user_data.email)

    if user:
        raise HTTPException(
            status_code=400, detail="The user with this email already exists."
        )

    user = user_service.create_user(session=session, user_data=user_data)

    return user


@router.get("/me", response_model=UserPublic)
def get_current_user(session: SessionDep, user: CurrentUser):
    return user
