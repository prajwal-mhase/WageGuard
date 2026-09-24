import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = os.environ.get("DATABASE_URL", "")
    supabase_url: str = os.environ.get("SUPABASE_URL", "")
    supabase_jwt_secret: str = os.environ.get("SUPABASE_JWT_SECRET", "")
    frontend_origin: str = os.environ.get("FRONTEND_ORIGIN", "http://localhost:5173")
    working_days_per_month: int = 26

    class Config:
        env_file = ".env"


settings = Settings()
