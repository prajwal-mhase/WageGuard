import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'

const TIER_COLORS = {
  unskilled: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  'semi-skilled': { bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-700', badge: 'bg-violet-100 text-violet-700' },
  skilled: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
}

export default function ReferenceRules() {
  const [rates, setRates] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getRates()
      .then(setRates)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Reference wage table">
      {/* Methodology note */}
      <div className="card mb-4 bg-gray-50 border-gray-100">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">How these rates work</h3>
        <p className="text-xs text-gray-600 leading-relaxed mb-2">
          Coverage: <strong className="text-gray-800">Maharashtra · Construction of Roads and Buildings · Zone I</strong>
        </p>
        <p className="text-xs text-gray-500 leading-relaxed">
          Monthly figures are the published reference totals. Daily figures are this app's own calculation
          (monthly ÷ 26 working days) — <strong>not an officially published daily rate</strong>.
          The engine uses these figures to compute a potential difference only.
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}
        </div>
      )}

      <div className="space-y-3">
        {rates.map((r) => {
          const colors = TIER_COLORS[r.skill_tier] || TIER_COLORS.unskilled
          return (
            <div key={r.id} className={`rounded-2xl border p-4 ${colors.bg} ${colors.border}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`badge text-xs capitalize ${colors.badge}`}>{r.skill_tier}</span>
                <span className="text-[11px] text-gray-400">{r.zone}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[11px] text-gray-500 mb-0.5">Published monthly</div>
                  <div className={`text-xl font-extrabold ${colors.text}`}>
                    ₹{Number(r.monthly_total).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500 mb-0.5">MVP daily (÷26)</div>
                  <div className={`text-xl font-extrabold ${colors.text}`}>
                    ₹{Number(r.daily_equivalent).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-current/10">
                <p className="text-[11px] text-gray-500">
                  Valid: <strong className="text-gray-700">{r.effective_from} – {r.effective_to}</strong>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Source */}
      {rates.length > 0 && (
        <div className="card mt-4">
          <h3 className="section-title">Source</h3>
          <p className="text-sm text-gray-800 font-medium">{rates[0].source_name}</p>
          <p className="text-xs text-gray-400 mt-1 leading-relaxed">
            The team has not independently verified this against the original gazette notification.
            Verify before any real-world use.
          </p>
        </div>
      )}

      <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed px-2">
        Reference tool only — not legal advice. These rates are used exactly as shown by the comparison engine.
      </p>
    </Layout>
  )
}
