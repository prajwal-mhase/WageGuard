import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { useAuth } from '../lib/useAuth'

function money(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function fmt(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch { return dateStr }
}

function SkeletonCard() {
  return <div className="skeleton h-20 w-full" />
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const { user, isGuest } = useAuth()

  useEffect(() => {
    Promise.all([api.getSummary(), api.listEntries()])
      .then(([s, e]) => { setSummary(s); setEntries(e.slice(0, 5)) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const hasGap = summary && summary.potential_cumulative_gap > 0

  return (
    <Layout title="Maharashtra · Zone I" onAdd>
      {/* Guest banner */}
      {isGuest && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-amber-500 mt-0.5 shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
            </svg>
          </span>
          <p className="text-xs text-amber-800 leading-relaxed">
            You're using WageGuard as a guest. Entries are saved locally.{' '}
            <strong>Save account</strong> (top right) to save across devices.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {loading ? (
          <>
            <SkeletonCard /><SkeletonCard />
            <SkeletonCard /><SkeletonCard />
          </>
        ) : summary ? (
          <>
            <div className="stat-card">
              <div className="stat-label">Total jobs</div>
              <div className="stat-value">{summary.total_jobs}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total paid</div>
              <div className="stat-value text-xl">{money(summary.total_earnings)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Reference total</div>
              <div className="stat-value text-xl">{money(summary.total_reference_earnings)}</div>
            </div>
            <div className={`stat-card ${hasGap ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
              <div className={`stat-label ${hasGap ? 'text-amber-700' : 'text-emerald-700'}`}>
                Potential gap
              </div>
              <div className={`stat-value text-xl ${hasGap ? 'text-amber-700' : 'text-emerald-700'}`}>
                {money(summary.potential_cumulative_gap)}
              </div>
            </div>
          </>
        ) : null}
      </div>

      {/* Scope note */}
      <div className="mb-4 bg-gray-50 rounded-xl px-3 py-2.5 flex items-center gap-2">
        <span className="text-gray-400">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <circle cx="7" cy="7" r="6"/><path d="M7 5v4M7 3.5v.5"/>
          </svg>
        </span>
        <p className="text-[11px] text-gray-500">
          Scope: <strong className="text-gray-700">Maharashtra · Construction · Zone I · Jan–Jun 2026</strong>
        </p>
      </div>

      {/* Recent entries */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title mb-0">Recent Jobs</h2>
        {entries.length > 0 && (
          <Link to="/ledger" className="text-xs text-gray-400 hover:text-ink transition-colors">
            View all →
          </Link>
        )}
      </div>

      <div className="space-y-2">
        {loading && (
          <>
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="skeleton h-16 w-full rounded-2xl" />
            <div className="skeleton h-16 w-full rounded-2xl" />
          </>
        )}
        {!loading && entries.length === 0 && (
          <div className="card text-center py-10">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm font-medium text-gray-700 mb-1">No jobs logged yet</p>
            <p className="text-xs text-gray-400 mb-4">Log your first job to check against the reference wage.</p>
            <Link to="/add-job" className="inline-block bg-ink text-white text-xs font-semibold rounded-xl px-4 py-2">
              + Log First Job
            </Link>
          </div>
        )}
        {entries.map((e) => {
          const below = e.status === 'below_reference'
          return (
            <Link key={e.id} to={`/entry/${e.id}`} className="card flex items-center justify-between hover:border-gray-200 hover:shadow-md transition-all">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">{fmt(e.job_date)}</div>
                <div className="text-xs text-gray-500 capitalize mt-0.5">{e.skill_tier} · {money(e.amount_paid)} paid</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                <span className={`text-sm font-bold ${below ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {below ? `−${money(e.potential_gap)}` : '✓ OK'}
                </span>
                <span className={`badge text-[10px] ${below ? 'badge-amber' : 'badge-green'}`}>
                  {below ? 'Below ref.' : 'At/above'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Reference disclaimer */}
      <p className="mt-6 text-[10px] text-gray-400 text-center leading-relaxed px-2">
        Reference tool only — not legal advice. Daily rates = monthly ÷ 26 days (MVP calculation).
      </p>
    </Layout>
  )
}
