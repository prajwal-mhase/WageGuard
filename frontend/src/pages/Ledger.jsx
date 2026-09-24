import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'

function money(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function fmt(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
  } catch { return dateStr }
}

export default function Ledger() {
  const [summary, setSummary] = useState(null)
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getSummary(), api.listEntries()])
      .then(([s, e]) => { setSummary(s); setEntries(e) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const hasGap = summary && summary.potential_cumulative_gap > 0

  return (
    <Layout title="Earnings Ledger" onAdd>
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Summary */}
      {loading ? (
        <div className="skeleton h-24 w-full rounded-2xl mb-4" />
      ) : summary ? (
        <div className={`card mb-4 ${hasGap ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-[11px] font-medium text-gray-500 mb-1">Total paid</div>
              <div className="text-base font-bold text-ink">{money(summary.total_earnings)}</div>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-500 mb-1">Reference</div>
              <div className="text-base font-bold text-ink">{money(summary.total_reference_earnings)}</div>
            </div>
            <div>
              <div className={`text-[11px] font-medium mb-1 ${hasGap ? 'text-amber-700' : 'text-emerald-700'}`}>
                Potential gap
              </div>
              <div className={`text-base font-extrabold ${hasGap ? 'text-amber-700' : 'text-emerald-700'}`}>
                {money(summary.potential_cumulative_gap)}
              </div>
            </div>
          </div>
          {summary.total_jobs > 0 && (
            <div className="mt-3 pt-3 border-t border-current/10 text-center">
              <p className="text-[11px] text-gray-500">
                {summary.total_jobs} job{summary.total_jobs !== 1 ? 's' : ''} logged
                {hasGap ? ` · cumulative potential underpayment` : ' · all at or above reference'}
              </p>
            </div>
          )}
        </div>
      ) : null}

      {/* Entry list */}
      <div className="space-y-2">
        {loading && (
          <>
            {[1,2,3,4].map(i => <div key={i} className="skeleton h-16 w-full rounded-2xl" />)}
          </>
        )}
        {!loading && entries.length === 0 && (
          <div className="card text-center py-10">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm font-medium text-gray-700 mb-1">No entries yet</p>
            <p className="text-xs text-gray-400 mb-4">Log a job to start building your ledger.</p>
            <Link to="/add-job" className="inline-block bg-ink text-white text-xs font-semibold rounded-xl px-4 py-2">
              + Log First Job
            </Link>
          </div>
        )}
        {entries.map((e) => {
          const below = e.status === 'below_reference'
          return (
            <Link key={e.id} to={`/entry/${e.id}`} className="card flex items-center justify-between hover:shadow-md transition-all">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">{fmt(e.job_date)}</div>
                <div className="text-xs text-gray-500 capitalize mt-0.5">{e.skill_tier} · {money(e.amount_paid)}</div>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 ml-3">
                <span className={`text-sm font-bold ${below ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {below ? `−${money(e.potential_gap)}` : '✓'}
                </span>
                <span className={`badge text-[10px] ${below ? 'badge-amber' : 'badge-green'}`}>
                  {below ? 'Below' : 'OK'}
                </span>
              </div>
            </Link>
          )
        })}
      </div>

      {entries.length > 0 && (
        <p className="mt-5 text-[10px] text-gray-400 text-center leading-relaxed px-2">
          Potential gap = reference daily rate − amount paid, per entry. Reference tool only.
        </p>
      )}
    </Layout>
  )
}
