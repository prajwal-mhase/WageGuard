import psycopg2
import psycopg2.extras
from contextlib import contextmanager

from config import settings


@contextmanager
def get_conn():
    """
    Yields a psycopg2 connection to the Supabase Postgres database.
    Uses DATABASE_URL, e.g.:
    postgresql://postgres:<password>@<host>:5432/postgres
    """
    conn = psycopg2.connect(settings.database_url, cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def get_cursor(commit: bool = False):
    with get_conn() as conn:
        cur = conn.cursor()
        try:
            yield cur
            if commit:
                conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cur.close()
