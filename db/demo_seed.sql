-- WageGuard DEMO data.
-- These are DEMO ENTRIES for presentation/testing purposes only.
--
-- Usage: sign up a user in the app first (e.g. via /login), find that
-- user's UUID in Supabase Auth > Users, then replace
-- 'REPLACE_WITH_DEMO_USER_UUID' below and run this in the SQL editor.
--
-- This mirrors exactly what the API would insert, using the seeded
-- semi-skilled Zone I rate (wage_rate_id for semi-skilled from seed.sql).

-- 1) Find the semi-skilled Zone I wage_rate id:
--    select id from wage_rates where skill_tier = 'semi-skilled' and zone = 'Zone I';
--    (assumed to be id = 2 if seed.sql was run on an empty table, in insertion order)

-- NOTE: dates must fall inside the seeded wage-rate validity window
-- (2026-01-01 to 2026-06-30). September dates were used in an earlier
-- draft and were rejected by the comparison engine ("No reference wage
-- rate found...") because no rate row covers that period. Corrected to
-- June 2026 below -- the wage rate window itself is NOT changed to fit
-- the demo; the demo is fit to the verified rate window instead.

insert into job_entries
  (user_id, job_date, zone, skill_tier, hours_worked, amount_paid,
   wage_rate_id, normalized_daily_equivalent, potential_gap, status, calculation_note)
values
  ('REPLACE_WITH_DEMO_USER_UUID', '2026-06-12', 'Zone I', 'semi-skilled', 9, 650,
   (select id from wage_rates where skill_tier='semi-skilled' and zone='Zone I'),
   650, 241, 'below_reference',
   '₹891 − ₹650 = ₹241 potential difference. Daily reference is an MVP calculation using monthly rate ÷ 26 working days. Reference calculation only — not legal certification. Reported hours worked: 9. MVP comparison treats the entered amount as the reported payment for the day; hours are recorded for context but are not converted into an hourly legal rate.'),

  ('REPLACE_WITH_DEMO_USER_UUID', '2026-06-13', 'Zone I', 'semi-skilled', 9, 700,
   (select id from wage_rates where skill_tier='semi-skilled' and zone='Zone I'),
   700, 191, 'below_reference',
   '₹891 − ₹700 = ₹191 potential difference. Daily reference is an MVP calculation using monthly rate ÷ 26 working days. Reference calculation only — not legal certification. Reported hours worked: 9. MVP comparison treats the entered amount as the reported payment for the day; hours are recorded for context but are not converted into an hourly legal rate.'),

  ('REPLACE_WITH_DEMO_USER_UUID', '2026-06-14', 'Zone I', 'semi-skilled', 8, 620,
   (select id from wage_rates where skill_tier='semi-skilled' and zone='Zone I'),
   620, 271, 'below_reference',
   '₹891 − ₹620 = ₹271 potential difference. Daily reference is an MVP calculation using monthly rate ÷ 26 working days. Reference calculation only — not legal certification. Reported hours worked: 8. MVP comparison treats the entered amount as the reported payment for the day; hours are recorded for context but are not converted into an hourly legal rate.');

-- Expected after running:
-- Total earnings:            ₹1,970
-- Total reference earnings:  ₹2,673
-- Potential cumulative gap:  ₹703
