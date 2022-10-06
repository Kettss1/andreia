from pydantic import BaseModel
from starlette import status
from starlette.exceptions import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from andreia.controllers import BaseController
from andreia.db.query.user import UserQuery
from andreia.model import User, AuthToken


class LoginResponse(BaseModel):
    access_token: str


class LoginRequest(BaseModel):
    email: str
    password: str

    @classmethod
    def oauth_login_form(cls, form: OAuth2PasswordRequestForm):
        try:
            return cls(
                email=form.username,
                password=form.password
            )
        except:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail='Invalid form'
            )


class TokenController(BaseController):
    def generate_and_commit_new_token(self, user: User) -> AuthToken:
        new_token = AuthToken(user=user).generate_token()
        self.session.add(new_token)
        self.session.commit()

        return new_token


class LoginController(BaseController):

    @staticmethod
    def login_failed(reason: str):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=reason
        )

    def login(self, login: LoginRequest):
        user = UserQuery(self.session).get_user(email=login.email)

        if not user:
            self.login_failed('No such user')

        if not login.password:
            self.login_failed('Invalid password')

        user_token = TokenController(self.session).generate_and_commit_new_token(user=user)

        return LoginResponse(access_token=user_token.token)
