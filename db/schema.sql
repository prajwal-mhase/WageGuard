-- WageGuard schema
-- Run this in the Supabase SQL editor (or psql connected to your Supabase DB)

create table if not exists wage_rates (
  id serial primary key,
  state text not null default 'Maharashtra',
  scheduled_employment text not null default 'Construction of Roads and Buildings',
  zone text not null,
  skill_tier text not null check (skill_tier in ('unskilled','semi-skilled','skilled')),
  monthly_total numeric not null,
  daily_equivalent numeric not null,
  effective_from date not null,
  effective_to date not null,
  source_name text not null,
  source_note text not null,
  created_at timestamptz default now()
);

create index if not exists idx_wage_rates_lookup
  on wage_rates (state, scheduled_employment, zone, skill_tier, effective_from, effective_to);

create table if not exists job_entries (
  id serial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  job_date date not null,
  zone text not null,
  skill_tier text not null check (skill_tier in ('unskilled','semi-skilled','skilled')),
  hours_worked numeric,
  amount_paid numeric not null check (amount_paid >= 0),
  wage_rate_id int not null references wage_rates(id),
  normalized_daily_equivalent numeric not null,
  potential_gap numeric not null,
  status text not null check (status in ('below_reference','at_or_above_reference')),
  calculation_note text not null,
  created_at timestamptz default now()
);

create index if not exists idx_job_entries_user_date on job_entries (user_id, job_date desc);

-- Row Level Security
alter table job_entries enable row level security;

create policy "select_own_entries" on job_entries
  for select using (auth.uid() = user_id);

create policy "insert_own_entries" on job_entries
  for insert with check (auth.uid() = user_id);

-- No update/delete policy is created intentionally: entries are immutable
-- once logged, which keeps the ledger and the explanation trail trustworthy.

-- wage_rates is reference data: public read, no writes from clients.
alter table wage_rates enable row level security;

create policy "public_read_wage_rates" on wage_rates
  for select using (true);
