from fastapi import APIRouter

from database import get_cursor
from schemas import WageRateOut

router = APIRouter(prefix="/rates", tags=["rates"])


@router.get("", response_model=list[WageRateOut])
def list_rates():
    """
    Public endpoint -- no auth required. Returns the full reference
    wage-rate table exactly as used by the comparison engine, so the
    Reference Rules screen and the engine can never drift apart.
    """
    query = """
        select id, state, scheduled_employment, zone, skill_tier,
               monthly_total, daily_equivalent, effective_from, effective_to,
               source_name, source_note
        from wage_rates
        order by zone, skill_tier
    """
    with get_cursor() as cur:
        cur.execute(query)
        rows = cur.fetchall()
    return [WageRateOut(**row) for row in rows]
