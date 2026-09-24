# WageGuard — Reference Wage Check & Earnings Ledger

MVP scope: **Maharashtra → Construction of Roads and Buildings → Zone I**,
daily-rate comparison only. Not legal advice or legal certification.

## 1. Create the project (already scaffolded here)

```
wageguard/
├── db/            schema.sql, seed.sql, demo_seed.sql
├── backend/        FastAPI app
└── frontend/        React + Vite + Tailwind app
```

## 2. Local persistent storage

This prototype uses a local SQLite database. The API creates `backend/wageguard.db`
and seeds the three reference rates automatically on first startup. Accounts,
entries, and calculations remain available across restarts as long as that file
is retained. For a hosted prototype, attach a persistent disk and set
`DATABASE_PATH` to a path on that disk.

## 3. Backend — local setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env         # Windows; edit JWT_SECRET for shared hosting
uvicorn main:app --reload --port 8000
```

Health check: open http://localhost:8000/health — should return
`{"status": "ok", ...}`. Interactive docs at http://localhost:8000/docs.

> Note on PDF export: `weasyprint` needs system libraries (Pango/Cairo) on
> some OSes. If `pip install` or PDF generation fails, the `/entries/{id}/report`
> endpoint automatically falls back to returning printable HTML instead of
> failing — the frontend's "Export summary" button still works either way.

## 4. Frontend — local setup

```bash
cd frontend
npm install
copy .env.example .env.local    # optional; localhost is the default
npm run dev
```

Open http://localhost:5173.

## 5. Demo data

1. Sign up a user through the running app (`/login` → "Create an account").
2. For demo rows, insert the SQL in `db/demo_seed.sql` after replacing the
   placeholder with the user's local UUID from `backend/wageguard.db`, or use
   the app to create entries.
4. Refresh the dashboard — you should see 3 jobs dated **12–14 June 2026**
   (inside the seeded rate window of 1 Jan–30 Jun 2026), ₹1,970 total
   earnings, ₹2,673 reference earnings, ₹703 potential cumulative
   difference.

   Dates matter here: the comparison engine deliberately refuses to
   guess when no wage-rate row covers a given date (see `engine.py`),
   so demo entries must fall inside `2026-01-01`–`2026-06-30`. If you
   log a live entry during the demo, use a date in that range too (e.g.
   any June 2026 date) — a September 2026 date will correctly return
   "Reference rate unavailable for this date/category."

These are explicitly labeled **DEMO ENTRIES** in `demo_seed.sql`'s comments —
mention this if asked during Q&A.

## 6. Testing checklist

- [ ] Sign up / sign in / sign out works
- [ ] Add Job with a normal amount → Result screen shows correct gap and citation
- [ ] Add Job with amount ≥ reference rate → shows "at/above reference", not alarmist styling
- [ ] Add Job with a future date → rejected client-side (max date) and server-side (Pydantic validator)
- [ ] Add Job with a date outside 1 Jan–30 Jun 2026 → API returns 422 "Reference rate unavailable…", no silent fallback
- [ ] Ledger totals match sum of individual entries
- [ ] Entry Detail shows source, effective dates, and full calculation text
- [ ] Reference Rules screen matches exactly what the engine used (same table)
- [ ] Export summary opens a PDF (or HTML fallback) with disclaimer text
- [ ] Logged-out user hitting `/dashboard` redirects to `/login`
- [ ] One user cannot see another user's entries (test with two accounts — enforced by RLS)
- [ ] Service role key does not appear anywhere in frontend code or browser network tab

## 7. Deployment

**Frontend and backend together (Vercel):**

The repository root contains `vercel.json`, `api/index.py`, and
`requirements.txt` for a single Vercel project. Import the GitHub repository
with the root directory set to `.`. Vercel builds the Vite frontend and serves
FastAPI under `/api`.

Set these Vercel environment variables:

```text
VITE_API_BASE_URL=/api
JWT_SECRET=replace-with-a-long-random-secret
```

The current SQLite database is appropriate for local development only. Vercel
serverless storage is ephemeral, so use Vercel Postgres, Neon, Supabase, or
another persistent database before relying on hosted data.

```bash
vercel --prod
```

**Frontend-only Vercel alternative:**
```bash
cd frontend
npm install -g vercel
vercel
# set VITE_API_BASE_URL to the deployed backend URL
# as Environment Variables in the Vercel dashboard, then:
vercel --prod
```

**Backend (Render or Railway):**
- Push `backend/` to a GitHub repo (or the whole monorepo with backend as root dir).
- New Web Service → connect repo → root directory `backend`.
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- Add environment variables: `DATABASE_PATH` (on a persistent disk),
  `JWT_SECRET` (a long random value), and `FRONTEND_ORIGIN` (your deployed
  Vercel URL).

After both are deployed, update the frontend's `VITE_API_BASE_URL` to the
backend's public URL and redeploy the frontend.

## 8. 3-minute demo procedure

1. Open the deployed (or local) app, already logged in.
2. Dashboard: show the 3 pre-seeded demo entries (dated 12–14 June 2026)
   and the ₹703 potential cumulative difference card.
3. Tap "+ Add Job" → enter a 4th entry live, **using a June 2026 date**
   (any date 1 Jan–30 Jun 2026 works; September 2026 will correctly be
   rejected as outside the seeded rate window) → submit.
4. Result screen: point at "Reference daily rate", "Potential difference",
   then scroll to "Why?" and "Calculation" — read the exact citation aloud.
5. Back to Dashboard/Ledger: show the total updating live.
6. Tap "Export summary" → show the generated report with disclaimer.
7. Tap "Rates" tab → show the transparent reference table + source.
8. Close on the "About" disclaimer screen — reinforces intellectual honesty.

## 9. Final hackathon checklist

- [ ] Idea submission uploaded (see prior message's Step 13 copy)
- [ ] Code pushed to GitHub, repo link ready
- [ ] Both frontend and backend deployed and reachable
- [ ] Demo data seeded on the deployed instance (not just local)
- [ ] Deck exported and ready to share-screen
- [ ] Demo rehearsed at least twice, timed to ~3 minutes
- [ ] Team can answer the Q&A set from the previous validation pass
- [ ] `.env` files are in `.gitignore`, not committed
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` anywhere in the repo
