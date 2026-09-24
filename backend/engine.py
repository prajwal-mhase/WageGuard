"""
WageGuard comparison engine.

Deterministic, rule-based logic only. No AI/ML is used here by design:
this calculation is presented to workers as something they can trust and
inspect, so every number must be traceable to a specific database row
and a specific formula -- not a model output.
"""

from datetime import date
from typing import Optional

from database import get_cursor
from schemas import JobEntryIn


class NoReferenceRateError(Exception):
    """Raised when no wage_rates row matches the entry's date/zone/skill."""
    pass


def find_wage_rate(zone: str, skill_tier: str, job_date: date) -> dict:
    query = """
        select id, state, scheduled_employment, zone, skill_tier,
               monthly_total, daily_equivalent, effective_from, effective_to,
               source_name, source_note
        from wage_rates
        where state = 'Maharashtra'
          and scheduled_employment = 'Construction of Roads and Buildings'
          and zone = %s
          and skill_tier = %s
          and effective_from <= %s
          and effective_to >= %s
        order by effective_from desc
        limit 1
    """
    with get_cursor() as cur:
        cur.execute(query, (zone, skill_tier, job_date, job_date))
        row = cur.fetchone()

    if not row:
        raise NoReferenceRateError(
            f"No reference wage rate found for zone='{zone}', "
            f"skill_tier='{skill_tier}', date={job_date}. "
            f"Coverage is currently limited to Maharashtra, Construction of "
            f"Roads and Buildings, Zone I, 1 Jan 2026 - 30 Jun 2026."
        )
    return row


def compute_comparison(entry: JobEntryIn) -> dict:
    """
    Returns a dict with all fields needed to persist a job_entries row
    and to render the explainable result screen.

    IMPORTANT: hours_worked is stored for context only. It is never used
    to derive an hourly legal rate -- doing so would require rules this
    MVP does not implement, and a wrong legal inference is worse than none.
    """
    rate_row = find_wage_rate(entry.zone, entry.skill_tier, entry.job_date)

    normalized_daily_equivalent = entry.amount_paid
    gap = round(float(rate_row["daily_equivalent"]) - normalized_daily_equivalent, 2)
    status = "below_reference" if gap > 0 else "at_or_above_reference"

    hours_note = ""
    if entry.hours_worked is not None:
        hours_note = (
            f" Reported hours worked: {entry.hours_worked}. MVP comparison "
            f"treats the entered amount as the reported payment for the day; "
            f"hours are recorded for context but are not converted into an "
            f"hourly legal rate."
        )

    calculation_note = (
        f"\u20b9{rate_row['daily_equivalent']} \u2212 \u20b9{normalized_daily_equivalent} "
        f"= \u20b9{gap} potential difference. "
        f"Daily reference is an MVP calculation using monthly rate \u00f7 26 "
        f"working days. Reference calculation only \u2014 not legal "
        f"certification.{hours_note}"
    )

    return {
        "wage_rate_id": rate_row["id"],
        "normalized_daily_equivalent": normalized_daily_equivalent,
        "potential_gap": gap,
        "status": status,
        "calculation_note": calculation_note,
        "reference_rate": rate_row,
    }
