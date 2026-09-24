import sqlite3
from contextlib import contextmanager

from config import settings


@contextmanager
def get_conn():
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
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


def init_db():
        with get_conn() as conn:
                conn.executescript("""
                create table if not exists users (
                    id text primary key,
                    email text unique not null,
                    password_hash text not null,
                    created_at text not null default current_timestamp
                );
                create table if not exists wage_rates (
                    id integer primary key autoincrement,
                    state text not null, scheduled_employment text not null,
                    zone text not null, skill_tier text not null,
                    monthly_total real not null, daily_equivalent real not null,
                    effective_from text not null, effective_to text not null,
                    source_name text not null, source_note text not null
                );
                create table if not exists job_entries (
                    id integer primary key autoincrement, user_id text not null references users(id),
                    job_date text not null, zone text not null, skill_tier text not null,
                    hours_worked real, amount_paid real not null, wage_rate_id integer not null,
                    normalized_daily_equivalent real not null, potential_gap real not null,
                    status text not null, calculation_note text not null,
                    created_at text not null default current_timestamp
                );
                create index if not exists idx_job_entries_user_date on job_entries(user_id, job_date desc);
                """)
                if conn.execute("select count(*) from wage_rates").fetchone()[0] == 0:
                        conn.executemany("""
                            insert into wage_rates
                            (state, scheduled_employment, zone, skill_tier, monthly_total,
                             daily_equivalent, effective_from, effective_to, source_name, source_note)
                            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, [
                            ("Maharashtra", "Construction of Roads and Buildings", "Zone I", "unskilled", 22094, 850, "2026-01-01", "2026-06-30", "WageIndicator.org, compiled from Maharashtra Labour Department notification", "Daily figure = monthly total / 26 working days. MVP conversion, not an officially published daily rate."),
                            ("Maharashtra", "Construction of Roads and Buildings", "Zone I", "semi-skilled", 23174, 891, "2026-01-01", "2026-06-30", "WageIndicator.org, compiled from Maharashtra Labour Department notification", "Daily figure = monthly total / 26 working days. MVP conversion, not an officially published daily rate."),
                            ("Maharashtra", "Construction of Roads and Buildings", "Zone I", "skilled", 24689, 950, "2026-01-01", "2026-06-30", "WageIndicator.org, compiled from Maharashtra Labour Department notification", "Daily figure = monthly total / 26 working days. MVP conversion, not an officially published daily rate."),
                        ])
