from fastapi import Header, HTTPException
from jose import jwt, JWTError

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
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject claim")

    return user_id
