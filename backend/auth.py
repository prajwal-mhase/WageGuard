from datetime import datetime, timedelta, timezone
import hashlib
import hmac
import os
from fastapi import Header, HTTPException
from jose import jwt, JWTError
from uuid import uuid4

from config import settings


def get_current_user_id(authorization: str = Header(None)) -> str:
    """
    Expects: Authorization: Bearer <supabase access token>
    Verifies the token using the Supabase project's JWT secret and
    returns the user's UUID (the `sub` claim).

    The backend NEVER receives or uses the Supabase service-role key
    from the frontend. This function only verifies a user-issued token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject claim")

    return user_id


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 120000)
    return f"{salt.hex()}${digest.hex()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_hex, digest_hex = stored.split("$", 1)
        expected = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt_hex), 120000)
        return hmac.compare_digest(expected.hex(), digest_hex)
    except (ValueError, TypeError):
        return False


def create_token(user_id: str) -> str:
    return jwt.encode(
        {"sub": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=30)},
        settings.jwt_secret, algorithm="HS256"
    )


def new_user_id() -> str:
    return str(uuid4())
