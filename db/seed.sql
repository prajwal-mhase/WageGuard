-- WageGuard seed data
-- MVP scope: Maharashtra, Construction of Roads and Buildings, Zone I only.
--
-- Monthly totals are the published figures (Basic + Special Allowance).
-- daily_equivalent = monthly_total / 26 working days.
-- This daily figure is OUR OWN MVP conversion, not an officially published
-- daily rate. This is disclosed in the app UI on every result.
--
-- Source: WageIndicator.org, compiled from Maharashtra Labour Department
-- notification (Construction of Roads and Buildings, Zone I).
-- The team has not independently verified this against the original
-- government gazette notification -- verify before any real-world use.

insert into wage_rates
  (state, scheduled_employment, zone, skill_tier, monthly_total, daily_equivalent,
   effective_from, effective_to, source_name, source_note)
values
  ('Maharashtra', 'Construction of Roads and Buildings', 'Zone I', 'unskilled',
   22094, 850, '2026-01-01', '2026-06-30',
   'WageIndicator.org, compiled from Maharashtra Labour Department notification',
   'Daily figure = monthly total / 26 working days. MVP conversion, not an officially published daily rate. Verify against the original gazette notification before real-world use.'),

  ('Maharashtra', 'Construction of Roads and Buildings', 'Zone I', 'semi-skilled',
   23174, 891, '2026-01-01', '2026-06-30',
   'WageIndicator.org, compiled from Maharashtra Labour Department notification',
   'Daily figure = monthly total / 26 working days. MVP conversion, not an officially published daily rate. Verify against the original gazette notification before real-world use.'),

  ('Maharashtra', 'Construction of Roads and Buildings', 'Zone I', 'skilled',
   24689, 950, '2026-01-01', '2026-06-30',
   'WageIndicator.org, compiled from Maharashtra Labour Department notification',
   'Daily figure = monthly total / 26 working days. MVP conversion, not an officially published daily rate. Verify against the original gazette notification before real-world use.');
