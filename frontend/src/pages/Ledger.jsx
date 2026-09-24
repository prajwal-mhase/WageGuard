import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'

function money(n) {
  return `\u20b9${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function Ledger() {
  const [summary, setSummary] = useState(null)
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.getSummary(), api.listEntries()])
      .then(([s, e]) => { setSummary(s); setEntries(e) })
      .catch((err) => setError(err.message))
  }, [])

  return (
    <Layout title="Earnings Ledger" onAdd>
      {error && <p className="text-sm text-amber-700">{error}</p>}

      {summary && (
        <div className="card mb-4 bg-amber-50 border-amber-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-[11px] text-gray-600">Total earnings</div>
              <div className="text-lg font-bold">{money(summary.total_earnings)}</div>
            </div>
            <div>
              <div className="text-[11px] text-gray-600">Reference earnings</div>
              <div className="text-lg font-bold">{money(summary.total_reference_earnings)}</div>
            </div>
            <div>
              <div className="text-[11px] text-amber-700">Potential difference</div>
              <div className="text-lg font-extrabold text-amber-700">
                {money(summary.potential_cumulative_gap)}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
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
        {entries.length === 0 && (
          <div className="card text-center text-sm text-gray-500 py-8">No jobs logged yet.</div>
        )}
      </div>
    </Layout>
  )
}
