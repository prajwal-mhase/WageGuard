from datetime import date, datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator

SkillTier = Literal["unskilled", "semi-skilled", "skilled"]


class JobEntryIn(BaseModel):
    job_date: date
    zone: str = Field(default="Zone I")
    skill_tier: SkillTier
    hours_worked: Optional[float] = Field(default=None, ge=0, le=24)
    amount_paid: float = Field(ge=0)

    @field_validator("job_date")
    @classmethod
    def no_future_dates(cls, v: date):
        if v > date.today():
            raise ValueError("job_date cannot be in the future")
        return v


class WageRateOut(BaseModel):
    id: int
    state: str
    scheduled_employment: str
    zone: str
    skill_tier: str
    monthly_total: float
    daily_equivalent: float
    effective_from: date
    effective_to: date
    source_name: str
    source_note: str


class JobEntryOut(BaseModel):
    id: int
    job_date: date
    zone: str
    skill_tier: str
    hours_worked: Optional[float]
    amount_paid: float
    wage_rate_id: int
    normalized_daily_equivalent: float
    potential_gap: float
    status: str
    calculation_note: str
    created_at: datetime
    reference_rate: WageRateOut


class LedgerSummary(BaseModel):
    total_jobs: int
    total_earnings: float
    total_reference_earnings: float
    potential_cumulative_gap: float
