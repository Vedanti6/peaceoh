from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from uuid import uuid4
from datetime import datetime, timezone
import store, auth

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    email: str
    password: str

class LoginBody(BaseModel):
    email: str
    password: str


@router.post("/register", status_code=201)
def register(body: RegisterBody):
    if len(body.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")
    if store.get_user_by_email(body.email):
        raise HTTPException(409, "An account with that email already exists.")

    user = store.create_user({
        "id":            str(uuid4()),
        "email":         body.email.lower(),
        "password_hash": auth.hash_password(body.password),
        "created_at":    datetime.now(timezone.utc).isoformat(),
    })
    token = auth.create_token({"id": user["id"], "email": user["email"]})
    return {"token": token, "user": {"id": user["id"], "email": user["email"]}}


@router.post("/login")
def login(body: LoginBody):
    user = store.get_user_by_email(body.email)
    if not user or not auth.verify_password(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid email or password.")

    token = auth.create_token({"id": user["id"], "email": user["email"]})
    return {"token": token, "user": {"id": user["id"], "email": user["email"]}}


@router.get("/me")
def me(current_user: dict = __import__('fastapi').Depends(auth.get_current_user)):
    user = store.get_user_by_id(current_user["id"])
    if not user:
        raise HTTPException(404, "User not found.")
    return {"id": user["id"], "email": user["email"], "created_at": user["created_at"]}
