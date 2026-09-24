import os
from pathlib import Path
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.environ.get("DATABASE_URL", "")
    database_path: str = os.environ.get(
        "DATABASE_PATH", str(Path(__file__).resolve().parent / "wageguard.db")
    )
    jwt_secret: str = os.environ.get("JWT_SECRET", "wageguard-local-dev-secret")
    frontend_origin: str = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
    working_days_per_month: int = 26

    class Config:
        env_file = ".env"


settings = Settings()
