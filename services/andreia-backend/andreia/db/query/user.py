from andreia.db.query import BaseQueryController
from andreia.model import User


class UserQuery(BaseQueryController):
    def get_user(self, email: str) -> User:
        user = self.session.query(User).filter(User.email == email).one_or_none()
        return user
