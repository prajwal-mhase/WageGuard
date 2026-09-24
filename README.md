# WageGuard — Reference Wage Check & Earnings Ledger

**Know if your pay is below the reference minimum — before you leave the job site.**

Live app: **[https://wage-guard-ochre.vercel.app/](https://wage-guard-ochre.vercel.app/)**

> Built for the Global Innovation Hackathon 2026 (Bharat Academix) by **Team Infinity** — Prajwal Mhase.

---

## Problem Statement

Over 110 million workers are employed in India's unincorporated non-agricultural enterprises (Ministry of Labour & Employment, ASUSE data), a large share of them in daily-wage construction work, paid in cash with no contract. They have no simple way to check whether the amount they were paid for a day's work meets the officially referenced minimum wage for their state, sector, and skill level.

## Solution

WageGuard lets a construction daily-wage worker in Maharashtra log a job — zone, skill tier, hours (optional), and amount paid. The system looks up the applicable sourced, dated reference wage rate, compares it to the payment, and shows the potential gap along with the exact rule and calculation behind it. Every logged job is added to a personal, running earnings ledger so the worker can see accumulated potential underpayment over time, and can export a shareable reference summary for any single entry.

## Key Features (as implemented)

- **Email/password authentication** via FastAPI endpoints with signed JWTs (sign up / sign in / sign out)
- **Job logging** — date, zone, skill tier, optional hours worked, amount paid
- **Explainable comparison engine** — every result shows the applicable rate, its source, its effective dates, and the exact calculation, not just a number
- **Personal earnings ledger** — running totals for total earnings, total reference earnings, and potential cumulative gap, computed server-side via `/entries/summary`
- **Entry detail view** — full breakdown for any single logged job
- **Reference Rules screen** — the live wage-rate table the engine actually uses, shown transparently in-app
- **Authenticated report export** — generates a "Reference Wage Summary" (PDF via WeasyPrint, with an automatic print-friendly HTML fallback if PDF generation isn't available) for a single entry
- **User-scoped access** — backend queries filter job entries by the authenticated user ID; wage rate data is public read-only reference data
- **Explicit error handling** — no valid wage rate for a date/category returns a clear "Reference rate unavailable" response; the engine never falls back to a stale or guessed rate

## Innovation

Existing wage-related tools either document work for human advocates to review, or generically timestamp/photograph proof that work happened. WageGuard's MVP combines three capabilities in one worker-facing workflow: a **sourced wage-reference lookup**, an **explainable normalization-and-comparison calculation**, and **cumulative potential-underpayment tracking** across logged jobs — not documentation alone.

## Target Users & Impact

- **Primary:** Maharashtra construction daily-wage workers
- **Secondary:** labor-rights NGOs who could use a worker's exported summary as a starting point for outreach or conversation

**Impact:** converts an otherwise invisible, uncomputed wage gap into a visible, cited, explainable number a worker can act on — a self-service awareness step, not a legal determination.

---

## Scope and Reference Data

The current seeded scope is:

- State: Maharashtra
- Scheduled employment: Construction of Roads and Buildings
- Zone: Zone I
- Skill tiers: unskilled, semi-skilled, and skilled
- Rate validity: 1 January 2026 through 30 June 2026
- Daily comparison basis: monthly reference total divided by 26 working days

The rate seed describes its source as WageIndicator.org material compiled from
Maharashtra Labour Department notifications. The project has not independently
verified the original gazette notification.

> WageGuard is an educational reference tool. It does not provide legal advice
> or legal certification.

## Technology Stack

### Frontend

- React 18
- React DOM
- React Router DOM
- Vite
- Tailwind CSS
- PostCSS and Autoprefixer

### Backend

- Python
- FastAPI and Uvicorn
- Pydantic and pydantic-settings
- `python-jose` for JWT handling
- PBKDF2-SHA256 password hashing using Python's standard library
- SQLite for local development
- PostgreSQL via `psycopg2` for Supabase production
- Jinja2 and WeasyPrint for report generation

### Deployment

- Vercel for the frontend
- Render or Railway for the backend
- Supabase Postgres for production database storage

## System Architecture and Workflow

```text
React/Vite frontend
        |
        | JSON API requests with Bearer JWT
        v
FastAPI backend
  |-- authentication: users, password hashes, JWTs
  |-- comparison engine: date/category rate lookup and gap calculation
  |-- entry, summary, rate, and report routes
        |
        +--> SQLite locally
        |
        +--> Supabase PostgreSQL in production
```

1. A user signs up or logs in.
2. The backend returns a signed JWT and the frontend uses it for API calls.
3. Protected API requests send the token in the `Authorization` header.
4. A job is validated and matched to a wage-rate row covering its date.
5. The comparison uses `reference daily equivalent - amount paid`.
6. The entry is stored with its user ID and calculation explanation.
7. List, detail, summary, and report queries filter by the authenticated user ID.

## Project Structure

```text
wageguard/
├── api/index.py                  Optional Vercel Python entrypoint
├── backend/
│   ├── main.py                   FastAPI app and auth endpoints
│   ├── auth.py                   JWT and password helpers
│   ├── config.py                 Environment-backed settings
│   ├── database.py               SQLite/PostgreSQL connection layer
│   ├── engine.py                 Wage lookup and comparison calculation
│   ├── schemas.py                Pydantic request/response models
│   ├── routes/                   Entries, rates, and reports
│   ├── requirements.txt          Backend dependencies
│   └── .env.example              Backend configuration template
├── db/
│   ├── schema.sql                Supabase/PostgreSQL schema
│   ├── seed.sql                  Reference wage-rate seed data
│   └── demo_seed.sql             June 2026 demo entries
├── frontend/
│   ├── src/                      React application and pages
│   ├── package.json              Frontend scripts and dependencies
│   ├── package-lock.json         Locked npm dependency tree
│   ├── .env.example              Frontend configuration template
│   └── vercel.json               Frontend SPA rewrite
├── requirements.txt              Root requirements for optional Vercel deploy
├── vercel.json                   Optional combined Vercel configuration
└── README.md
```

## Database Overview

The database contains:

- `users`: application accounts, email addresses, and password hashes
- `wage_rates`: state, employment category, zone, skill tier, monthly total,
  daily equivalent, effective dates, and source information
- `job_entries`: user-owned job records, payment, selected wage-rate ID,
  potential gap, status, calculation note, and creation time

The SQL schema enables Row-Level Security for job entries and public read access
for reference wage rates. The backend also applies the authenticated user ID to
entry list, detail, summary, and report queries.

## Setup Requirements

- Python 3.10 or newer recommended
- Node.js and npm
- A Supabase project for production PostgreSQL deployment
- WeasyPrint system libraries are optional; report generation falls back to
  printable HTML if PDF generation is unavailable

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

```text
DATABASE_URL=
DATABASE_PATH=./wageguard.db
JWT_SECRET=replace-with-a-long-random-secret
FRONTEND_ORIGIN=http://localhost:5173
```

Leave `DATABASE_URL` blank for local SQLite. For production, set it to the
Supabase Session Pooler PostgreSQL connection URI. Set `JWT_SECRET` to a long,
private random value.

Create `frontend/.env.local` from `frontend/.env.example`:

```text
VITE_API_BASE_URL=http://localhost:8000
```

For Vercel, set `VITE_API_BASE_URL` to the public Render or Railway backend URL.

Never commit `.env`, `.env.local`, database passwords, JWT secrets, or service
role keys.

## Local Installation and Run

### Backend - Windows PowerShell

```powershell
cd backend
py -m venv venv
.\venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
Copy-Item .env.example .env
uvicorn main:app --reload --port 8000
```

### Backend - macOS/Linux

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

### Frontend

In a second terminal:

```bash
cd frontend
npm install
copy .env.example .env.local
npm run dev
```

On macOS/Linux, use `cp .env.example .env.local` instead of `copy`.

Open http://localhost:5173. The backend health endpoint is
http://localhost:8000/health and the API documentation is
http://localhost:8000/docs.

## Supabase and Production Database Setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Run `db/schema.sql`.
4. Run `db/seed.sql`.
5. Copy the Supabase Session Pooler URI into the backend `DATABASE_URL`.
6. Deploy the backend to Render or Railway with that variable and a private
   `JWT_SECRET`.
7. Set `FRONTEND_ORIGIN` to `https://wage-guard-ochre.vercel.app`.
8. Set the Vercel frontend `VITE_API_BASE_URL` to the deployed backend URL and
   redeploy the frontend.

## Deployment Settings

### Vercel frontend

- Root directory: `frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_BASE_URL=<public backend URL>`

Live URL: https://wage-guard-ochre.vercel.app/

### Render or Railway backend

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Required variables: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN`

## Demo Flow

1. Open the live application or local frontend.
2. Select **Create an account** and register with an email and password of at
   least six characters.
3. Add a job using a date from 1 January through 30 June 2026, a supported skill
   tier, and the amount paid.
4. Review the result, reference rate, potential difference, calculation note,
   effective period, and source.
5. Open the dashboard and ledger to review totals.
6. Open Reference Rules to inspect the reference table.
7. Open an entry and select **Export summary**.

For the supplied SQL demo data, create an account first, then replace
`REPLACE_WITH_DEMO_USER_UUID` in `db/demo_seed.sql` with that account's UUID
from the `users` table. There are no shared demo credentials in this repository.
The expected three-row totals are INR 1,970 paid, INR 2,673 reference earnings,
and INR 703 potential cumulative difference.

## Limitations and Disclaimer

The project currently covers only Maharashtra, Construction of Roads and
Buildings, Zone I, and the seeded 1 January-30 June 2026 rate window. The
monthly-to-daily conversion uses 26 working days as an MVP assumption. Hours
worked are recorded for context and are not converted into an hourly legal rate.
Verify current official wage notifications before taking real-world action.
