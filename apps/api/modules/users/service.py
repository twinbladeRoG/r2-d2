from datetime import datetime, timezone

from sqlmodel import Session, func, select

from api.models import User, UserBase, UsersPublic
from api.modules.utils.pagination import PaginationOutOfBoundException, get_pagination


def utcnow():
    return datetime.now(timezone.utc)


class UserService:
    def get_user_by_email(self, session: Session, email: str) -> User | None:
        statement = select(User).where(User.email == email)
        user = session.exec(statement).first()
        return user

    def create_user(self, session: Session, user_data: UserBase) -> User:
        user = User.model_validate(user_data)
        session.add(user)
        session.commit()
        session.refresh(user)
        return user

    def get_users(
        self, session: Session, page: int = 0, limit: int = 10
    ) -> UsersPublic:
        count_statement = select(func.count()).select_from(User)
        count = session.exec(count_statement).one()

        pagination = get_pagination(page=page, limit=limit, count=count)

        if page > pagination.total_pages - 1:
            raise PaginationOutOfBoundException(page, count)

        statement = select(User).offset(page * limit).limit(limit)
        users = session.exec(statement).all()

        return UsersPublic(data=users, pagination=pagination)
