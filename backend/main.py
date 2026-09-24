from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from routes import entries, rates, reports
from database import init_db

from fastapi import HTTPException
from pydantic import BaseModel, Field
from auth import create_token, new_user_id, hash_password, verify_password
from database import get_cursor, sql

app = FastAPI(
    title="WageGuard API",
    description=(
        "Reference wage check and earnings ledger for informal workers. "
        "MVP scope: Maharashtra, Construction of Roads and Buildings, Zone I. "
        "This API performs a deterministic reference-rate comparison only "
        "and does not provide legal advice or legal certification."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(entries.router)
app.include_router(rates.router)
app.include_router(reports.router)


class AuthIn(BaseModel):
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)


@app.on_event("startup")
def startup():
    init_db()


@app.post("/auth/signup")
def signup(payload: AuthIn):
    user_id = new_user_id()
    with get_cursor(commit=True) as cur:
        try:
            cur.execute(sql("insert into users (id, email, password_hash) values (%s, %s, %s)"),
                        (user_id, payload.email.lower(), hash_password(payload.password)))
        except Exception:
            raise HTTPException(status_code=409, detail="An account with that email already exists")
    return {"access_token": create_token(user_id), "user": {"id": user_id, "email": payload.email.lower()}}


@app.post("/auth/login")
def login(payload: AuthIn):
    with get_cursor() as cur:
        cur.execute(sql("select id, email, password_hash from users where email = %s"), (payload.email.lower(),))
        user = cur.fetchone()
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_token(user["id"]), "user": {"id": user["id"], "email": user["email"]}}


@app.get("/health")
def health():
    return {"status": "ok", "scope": "Maharashtra / Construction of Roads and Buildings / Zone I"}
