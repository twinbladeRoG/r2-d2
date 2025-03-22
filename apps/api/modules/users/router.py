from typing import Annotated

from fastapi import APIRouter, HTTPException, Query

from api.dependencies import CurrentUser, SessionDep
from api.models import UserPublic, UsersPublic
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
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/me", response_model=UserPublic)
def get_current_user(session: SessionDep, user: CurrentUser):
    return user
