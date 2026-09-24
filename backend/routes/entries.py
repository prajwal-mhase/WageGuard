from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user_id
from database import get_cursor, sql
from engine import compute_comparison, NoReferenceRateError
from schemas import JobEntryIn, JobEntryOut, LedgerSummary, WageRateOut

router = APIRouter(prefix="/entries", tags=["entries"])


def _row_to_entry_out(row: dict, rate_row: dict) -> JobEntryOut:
    return JobEntryOut(
        id=row["id"],
        job_date=row["job_date"],
        zone=row["zone"],
        skill_tier=row["skill_tier"],
        hours_worked=row["hours_worked"],
        amount_paid=float(row["amount_paid"]),
        wage_rate_id=row["wage_rate_id"],
        normalized_daily_equivalent=float(row["normalized_daily_equivalent"]),
        potential_gap=float(row["potential_gap"]),
        status=row["status"],
        calculation_note=row["calculation_note"],
        created_at=row["created_at"],
        reference_rate=WageRateOut(
            id=rate_row["id"],
            state=rate_row["state"],
            scheduled_employment=rate_row["scheduled_employment"],
            zone=rate_row["zone"],
            skill_tier=rate_row["skill_tier"],
            monthly_total=float(rate_row["monthly_total"]),
            daily_equivalent=float(rate_row["daily_equivalent"]),
            effective_from=rate_row["effective_from"],
            effective_to=rate_row["effective_to"],
            source_name=rate_row["source_name"],
            source_note=rate_row["source_note"],
        ),
    )


@router.post("", response_model=JobEntryOut)
def create_entry(entry: JobEntryIn, user_id: str = Depends(get_current_user_id)):
    try:
        result = compute_comparison(entry)
    except NoReferenceRateError as e:
        raise HTTPException(status_code=422, detail=str(e))

    insert_query = """
        insert into job_entries
            (user_id, job_date, zone, skill_tier, hours_worked, amount_paid,
             wage_rate_id, normalized_daily_equivalent, potential_gap,
             status, calculation_note)
        values (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        returning id, job_date, zone, skill_tier, hours_worked, amount_paid,
                  wage_rate_id, normalized_daily_equivalent, potential_gap,
                  status, calculation_note, created_at
    """
    params = (
        user_id, entry.job_date, entry.zone, entry.skill_tier, entry.hours_worked,
        entry.amount_paid, result["wage_rate_id"], result["normalized_daily_equivalent"],
        result["potential_gap"], result["status"], result["calculation_note"],
    )
    with get_cursor(commit=True) as cur:
        cur.execute(sql(insert_query), params)
        row = cur.fetchone()

    return _row_to_entry_out(row, result["reference_rate"])


@router.get("", response_model=list[JobEntryOut])
def list_entries(user_id: str = Depends(get_current_user_id)):
    query = """
        select je.*, wr.id as rate_id, wr.state, wr.scheduled_employment,
               wr.zone as rate_zone, wr.skill_tier as rate_skill_tier,
               wr.monthly_total, wr.daily_equivalent, wr.effective_from,
               wr.effective_to, wr.source_name, wr.source_note
        from job_entries je
        join wage_rates wr on wr.id = je.wage_rate_id
        where je.user_id = %s
        order by je.job_date desc, je.created_at desc
    """
    with get_cursor() as cur:
        cur.execute(sql(query), (user_id,))
        rows = cur.fetchall()

    out = []
    for row in rows:
        rate_row = {
            "id": row["rate_id"], "state": row["state"],
            "scheduled_employment": row["scheduled_employment"],
            "zone": row["rate_zone"], "skill_tier": row["rate_skill_tier"],
            "monthly_total": row["monthly_total"], "daily_equivalent": row["daily_equivalent"],
            "effective_from": row["effective_from"], "effective_to": row["effective_to"],
            "source_name": row["source_name"], "source_note": row["source_note"],
        }
        out.append(_row_to_entry_out(row, rate_row))
    return out


@router.get("/summary", response_model=LedgerSummary)
def summary(user_id: str = Depends(get_current_user_id)):
    query = """
        select
            count(*) as total_jobs,
            coalesce(sum(je.amount_paid), 0) as total_earnings,
            coalesce(sum(wr.daily_equivalent), 0) as total_reference_earnings,
            coalesce(sum(je.potential_gap), 0) as potential_cumulative_gap
        from job_entries je
        join wage_rates wr on wr.id = je.wage_rate_id
        where je.user_id = %s
    """
    with get_cursor() as cur:
        cur.execute(sql(query), (user_id,))
        row = cur.fetchone()

    return LedgerSummary(
        total_jobs=row["total_jobs"],
        total_earnings=float(row["total_earnings"]),
        total_reference_earnings=float(row["total_reference_earnings"]),
        potential_cumulative_gap=float(row["potential_cumulative_gap"]),
    )


@router.get("/{entry_id}", response_model=JobEntryOut)
def get_entry(entry_id: int, user_id: str = Depends(get_current_user_id)):
    query = """
        select je.*, wr.id as rate_id, wr.state, wr.scheduled_employment,
               wr.zone as rate_zone, wr.skill_tier as rate_skill_tier,
               wr.monthly_total, wr.daily_equivalent, wr.effective_from,
               wr.effective_to, wr.source_name, wr.source_note
        from job_entries je
        join wage_rates wr on wr.id = je.wage_rate_id
        where je.id = %s and je.user_id = %s
    """
    with get_cursor() as cur:
        cur.execute(sql(query), (entry_id, user_id))
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")

    rate_row = {
        "id": row["rate_id"], "state": row["state"],
        "scheduled_employment": row["scheduled_employment"],
        "zone": row["rate_zone"], "skill_tier": row["rate_skill_tier"],
        "monthly_total": row["monthly_total"], "daily_equivalent": row["daily_equivalent"],
        "effective_from": row["effective_from"], "effective_to": row["effective_to"],
        "source_name": row["source_name"], "source_note": row["source_note"],
    }
    return _row_to_entry_out(row, rate_row)
