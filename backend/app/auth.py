from __future__ import annotations

import os
from datetime import datetime, timedelta, timezone
from typing import Literal

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from pydantic import BaseModel

Role = Literal["operator", "manager", "admin"]

JWT_SECRET = os.getenv("AI_MONITOR_JWT_SECRET", "aegis-dev-secret-change-in-production")
JWT_ALGORITHM = "HS256"
TOKEN_TTL_SECONDS = int(os.getenv("AI_MONITOR_TOKEN_TTL", "14400"))


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


class StoredUser:
    __slots__ = ("username", "password_hash", "role")

    def __init__(self, username: str, password: str, role: Role) -> None:
        self.username = username
        self.password_hash = _hash_password(password)
        self.role = role


class User(BaseModel):
    username: str
    role: Role


class AuthLoginRequest(BaseModel):
    username: str
    password: str


class AuthLoginResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_at: str
    user: User


_USERS: dict[str, StoredUser] = {
    "operator": StoredUser(
        username="operator",
        password=os.getenv("AI_MONITOR_PASSWORD_OPERATOR", "operator123"),
        role="operator",
    ),
    "manager": StoredUser(
        username="manager",
        password=os.getenv("AI_MONITOR_PASSWORD_MANAGER", "manager123"),
        role="manager",
    ),
    "admin": StoredUser(
        username="admin",
        password=os.getenv("AI_MONITOR_PASSWORD_ADMIN", "admin123"),
        role="admin",
    ),
}


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def create_access_token(user: StoredUser) -> tuple[str, str]:
    expires = datetime.now(timezone.utc) + timedelta(seconds=TOKEN_TTL_SECONDS)
    payload = {
        "sub": user.username,
        "role": user.role,
        "exp": expires,
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return token, expires.isoformat().replace("+00:00", "Z")


def get_token_from_request(request: Request) -> str | None:
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        return auth_header[7:].strip()
    return request.headers.get("X-API-KEY")


def validate_token(token: str | None) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authentication token",
        )
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        username: str = payload["sub"]
        role: Role = payload["role"]
        return User(username=username, role=role)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except (jwt.InvalidTokenError, KeyError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )


def auth_required(request: Request) -> User:
    token = get_token_from_request(request)
    return validate_token(token)


def get_current_user(request: Request) -> User:
    return auth_required(request)


def role_required(allowed_roles: list[Role]):
    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient privileges",
            )
        return user
    return dependency


def login_user(payload: AuthLoginRequest) -> AuthLoginResponse:
    user = _USERS.get(payload.username)
    if user is None or not _verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Неверное имя пользователя или пароль",
        )
    token, expires_at = create_access_token(user)
    return AuthLoginResponse(
        access_token=token,
        expires_at=expires_at,
        user=User(username=user.username, role=user.role),
    )
