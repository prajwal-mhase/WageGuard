import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../lib/api'

export default function ReferenceRules() {
  const [rates, setRates] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.getRates().then(setRates).catch((e) => setError(e.message))
  }, [])

  return (
    <Layout title="Reference wage table">
      {error && <p className="text-sm text-amber-700">{error}</p>}

      <div className="card mb-4 bg-gray-50">
        <p className="text-xs text-gray-600 leading-relaxed">
          Coverage: <strong>Maharashtra → Construction of Roads and Buildings → Zone I</strong>.
          Monthly figures are the published reference figures. Daily figures are
          this app's own MVP conversion (monthly ÷ 26 working days) — not an
          officially published daily rate.
        </p>
      </div>

      <div className="space-y-3">
        {rates.map((r) => (
          <div key={r.id} className="card">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold capitalize">{r.skill_tier}</div>
              <div className="text-xs text-gray-400">{r.zone}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <div className="text-[11px] text-gray-500">Published monthly</div>
                <div className="font-bold">₹{Number(r.monthly_total).toLocaleString('en-IN')}</div>
              </div>
              <div>
                <div className="text-[11px] text-gray-500">MVP daily equivalent</div>
                <div className="font-bold">₹{Number(r.daily_equivalent).toLocaleString('en-IN')}</div>
              </div>
            </div>
            <div className="text-[11px] text-gray-400 mt-2">
              Effective {r.effective_from} – {r.effective_to}
            </div>
          </div>
        ))}
      </div>

      <div className="card mt-4">
        <div className="text-xs font-semibold text-gray-700 mb-1">Source</div>
        <p className="text-sm text-gray-800">
          WageIndicator.org, compiled from Maharashtra Labour Department notification.
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          The team has not independently verified this against the original
          gazette notification. Verify before real-world use.
        </p>
      </div>
    </Layout>
  )
}
