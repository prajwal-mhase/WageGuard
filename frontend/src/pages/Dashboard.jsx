import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'

function money(n) {
  return `\u20b9${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.getSummary(), api.listEntries()])
      .then(([s, e]) => { setSummary(s); setEntries(e.slice(0, 5)) })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Maharashtra · Construction · Zone I" onAdd>
      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-amber-700">{error}</p>}

      {summary && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="card">
            <div className="text-xs text-gray-500">Total jobs</div>
            <div className="text-xl font-bold mt-1">{summary.total_jobs}</div>
          </div>
          <div className="card">
            <div className="text-xs text-gray-500">Total earnings</div>
            <div className="text-xl font-bold mt-1">{money(summary.total_earnings)}</div>
          </div>
          <div className="card">
            <div className="text-xs text-gray-500">Reference earnings</div>
            <div className="text-xl font-bold mt-1">{money(summary.total_reference_earnings)}</div>
          </div>
          <div className="card bg-amber-50 border-amber-200">
            <div className="text-xs text-amber-700">Potential underpayment</div>
            <div className="text-xl font-extrabold mt-1 text-amber-700">
              {money(summary.potential_cumulative_gap)}
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">Recent Jobs</h2>
        <Link to="/ledger" className="text-xs text-gray-500 underline">View all</Link>
      </div>

      <div className="space-y-2">
        {entries.length === 0 && !loading && (
          <div className="card text-center text-sm text-gray-500 py-8">
            No jobs logged yet. Tap "+ Add Job" to log your first one.
          </div>
        )}
        {entries.map((e) => (
          <Link key={e.id} to={`/entry/${e.id}`} className="card flex items-center justify-between block">
            <div>
              <div className="text-sm font-medium">{e.job_date}</div>
              <div className="text-xs text-gray-500 capitalize">{e.skill_tier} · {money(e.amount_paid)} paid</div>
            </div>
            <div className={`text-sm font-semibold ${e.status === 'below_reference' ? 'text-amber-700' : 'text-emerald-600'}`}>
              {e.status === 'below_reference' ? `-${money(e.potential_gap)}` : 'At/above ref.'}
            </div>
          </Link>
        ))}
      </div>
    </Layout>
  )
}
