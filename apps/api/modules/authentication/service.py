from sqlmodel import Session

from api.core.security import verify_password
from api.modules.users.service import UserService


class AuthenticationService:
    def __init__(self):
        self.user_service = UserService()

    def authenticate(self, session: Session, email: str, password: str):
        print("Email:", email)
        print("Password:", password)
        user = self.user_service.get_user_by_email(session=session, email=email)
        if not user:
            return None
        if not verify_password(password, user.password):
            print("Password verification failed")
            print(user.password)
            return None
        return user
