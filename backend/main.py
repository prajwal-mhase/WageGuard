from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator
import re
import uuid

from config import settings
from routes import entries, rates, reports
from database import init_db, get_cursor, sql
from auth import create_token, new_user_id, hash_password, verify_password

app = FastAPI(
    title="WageGuard API",
    description=(
        "Reference wage check and earnings ledger for informal workers. "
        "MVP scope: Maharashtra, Construction of Roads and Buildings, Zone I. "
        "This API performs a deterministic reference-rate comparison only "
        "and does not provide legal advice or legal certification."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# Allow configured origin plus localhost variants for local dev
_origins = [settings.frontend_origin]
if "localhost" not in settings.frontend_origin and "127.0.0.1" not in settings.frontend_origin:
    _origins += ["http://localhost:5173", "http://127.0.0.1:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(entries.router)
app.include_router(rates.router)
app.include_router(reports.router)


class AuthIn(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=6, max_length=128)

    @field_validator("email")
    @classmethod
    def valid_email(cls, v: str):
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Invalid email address")
        return v.lower()


@app.on_event("startup")
def startup():
    init_db()


@app.post("/auth/signup", status_code=201)
def signup(payload: AuthIn):
    user_id = new_user_id()
    with get_cursor(commit=True) as cur:
        try:
            cur.execute(
                sql("insert into users (id, email, password_hash) values (%s, %s, %s)"),
                (user_id, payload.email, hash_password(payload.password)),
            )
        except Exception:
            raise HTTPException(status_code=409, detail="An account with that email already exists")
    return {"access_token": create_token(user_id), "user": {"id": user_id, "email": payload.email}}


@app.post("/auth/login")
def login(payload: AuthIn):
    with get_cursor() as cur:
        cur.execute(
            sql("select id, email, password_hash from users where email = %s"),
            (payload.email,),
        )
        user = cur.fetchone()
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"access_token": create_token(user["id"]), "user": {"id": user["id"], "email": user["email"]}}


@app.get("/auth/guest", status_code=201)
def guest_session():
    """Issue a guest JWT for anonymous use. Entries are scoped to this guest ID."""
    guest_id = f"guest_{uuid.uuid4().hex[:12]}"
    # Create a guest user row so foreign key constraints are satisfied
    with get_cursor(commit=True) as cur:
        try:
            cur.execute(
                sql("insert into users (id, email, password_hash) values (%s, %s, %s)"),
                (guest_id, f"{guest_id}@guest.local", "guest"),
            )
        except Exception:
            pass  # already exists
    return {"access_token": create_token(guest_id), "user": {"id": guest_id, "email": None, "is_guest": True}}


@app.get("/health")
def health():
    return {"status": "ok", "scope": "Maharashtra / Construction of Roads and Buildings / Zone I"}
