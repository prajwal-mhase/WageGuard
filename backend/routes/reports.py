from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse, Response
from jinja2 import Template

from auth import get_current_user_id
from database import get_cursor

router = APIRouter(prefix="/entries", tags=["reports"])

REPORT_TEMPLATE = Template("""
<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>WageGuard - Reference Wage Summary</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; max-width: 640px; margin: 40px auto; }
  h1 { font-size: 20px; margin-bottom: 0; }
  .sub { color: #666; font-size: 13px; margin-top: 4px; margin-bottom: 24px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  td { padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
  td.label { color: #666; width: 45%; }
  .gap { font-size: 22px; font-weight: 700; }
  .below { color: #b45309; }
  .ok { color: #15803d; }
  .disclaimer { font-size: 11px; color: #888; margin-top: 28px; line-height: 1.5; border-top: 1px solid #eee; padding-top: 12px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; background: #f3f4f6; font-size: 11px; color: #555; }
</style>
</head>
<body>
  <h1>WageGuard — Reference Wage Summary</h1>
  <div class="sub">Not a legal certificate. Reference calculation only.</div>

  <table>
    <tr><td class="label">Date</td><td>{{ entry.job_date }}</td></tr>
    <tr><td class="label">Scheduled employment</td><td>{{ rate.scheduled_employment }}</td></tr>
    <tr><td class="label">State / Zone</td><td>{{ rate.state }} / {{ rate.zone }}</td></tr>
    <tr><td class="label">Skill tier</td><td>{{ entry.skill_tier }}</td></tr>
    {% if entry.hours_worked %}
    <tr><td class="label">Reported hours (context only)</td><td>{{ entry.hours_worked }}</td></tr>
    {% endif %}
    <tr><td class="label">Amount paid</td><td>&#8377;{{ entry.amount_paid }}</td></tr>
    <tr><td class="label">Reference daily rate</td><td>&#8377;{{ rate.daily_equivalent }}</td></tr>
    <tr><td class="label">Potential difference</td>
        <td class="gap {{ 'below' if entry.status == 'below_reference' else 'ok' }}">
          &#8377;{{ entry.potential_gap }}
          <span class="badge">{{ 'Below reference' if entry.status == 'below_reference' else 'At/above reference' }}</span>
        </td></tr>
  </table>

  <table>
    <tr><td class="label">Calculation</td><td>{{ entry.calculation_note }}</td></tr>
    <tr><td class="label">Effective period</td><td>{{ rate.effective_from }} – {{ rate.effective_to }}</td></tr>
    <tr><td class="label">Source</td><td>{{ rate.source_name }}</td></tr>
  </table>

  <div class="disclaimer">
    WageGuard is an educational/reference tool. It does not provide legal advice
    or legal certification. Rates are sourced from WageIndicator.org and stated
    to be compiled from Maharashtra Labour Department notifications; the team
    has not independently verified the original gazette notification. Daily
    equivalents are calculated as monthly rate &divide; 26 working days, an MVP
    assumption, not an officially published daily rate. Coverage is currently
    limited to Maharashtra, Construction of Roads and Buildings, Zone I. Verify
    current official wage notifications before taking real-world action.
  </div>
</body>
</html>
""")


@router.get("/{entry_id}/report", response_class=HTMLResponse)
def get_report(entry_id: int, user_id: str = Depends(get_current_user_id)):
    query = """
        select je.*, wr.state, wr.scheduled_employment, wr.zone as rate_zone,
               wr.daily_equivalent, wr.effective_from, wr.effective_to, wr.source_name
        from job_entries je
        join wage_rates wr on wr.id = je.wage_rate_id
        where je.id = %s and je.user_id = %s
    """
    with get_cursor() as cur:
        cur.execute(query, (entry_id, user_id))
        row = cur.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Entry not found")

    rate = {
        "state": row["state"], "scheduled_employment": row["scheduled_employment"],
        "zone": row["rate_zone"], "daily_equivalent": row["daily_equivalent"],
        "effective_from": row["effective_from"], "effective_to": row["effective_to"],
        "source_name": row["source_name"],
    }
    html = REPORT_TEMPLATE.render(entry=row, rate=rate)

    try:
        from weasyprint import HTML
        pdf_bytes = HTML(string=html).write_pdf()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'inline; filename="wageguard-report-{entry_id}.pdf"'},
        )
    except Exception:
        # Fallback: if WeasyPrint / its system libs aren't available in the
        # environment, return the printable HTML directly. The frontend can
        # open this in a new tab and the user can print-to-PDF from there.
        return HTMLResponse(content=html)
