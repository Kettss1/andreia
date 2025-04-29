from fastapi import FastAPI, Depends
from fastapi.security import OAuth2PasswordRequestForm
from andreia.controllers.UserLoginController import LoginResponse, LoginController, LoginRequest
from andreia.db import get_session, Session
import uvicorn

app = FastAPI()


@app.post('/login', response_model=LoginResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)):
    login_request_response = LoginRequest.oauth_login_form(form_data)
    return LoginController(db).login(login_request_response)

if __name__ == '__main__':
    uvicorn.run(app)
