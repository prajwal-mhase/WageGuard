import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'
import { useToast } from '../components/Toast'

function money(n) {
  return `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function fmt(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return dateStr }
}

export default function EntryDetail() {
  const { id } = useParams()
  const [entry, setEntry] = useState(null)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const toast = useToast()

  useEffect(() => {
    api.getEntry(id).then(setEntry).catch((e) => setError(e.message))
  }, [id])

  async function handleExport() {
    setExporting(true)
    try {
      const { blob, contentType } = await api.getReport(id)
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: contentType }))
      const win = window.open(blobUrl, '_blank')
      if (!win) {
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `wageguard-report-${id}.${contentType.includes('pdf') ? 'pdf' : 'html'}`
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000)
      toast('Report opened in new tab', 'success')
    } catch (e) {
      toast(e.message, 'error')
    } finally {
      setExporting(false)
    }
  }

  if (error) {
    return (
      <Layout title="Result">
        <div className="card bg-red-50 border-red-200">
          <p className="text-sm text-red-700">{error}</p>
          <Link to="/dashboard" className="btn-ghost mt-3 block text-center">← Back to dashboard</Link>
        </div>
      </Layout>
    )
  }

  if (!entry) {
    return (
      <Layout title="Result">
        <div className="space-y-3">
          <div className="skeleton h-36 w-full rounded-2xl" />
          <div className="skeleton h-28 w-full rounded-2xl" />
          <div className="skeleton h-20 w-full rounded-2xl" />
        </div>
      </Layout>
    )
  }

  const below = entry.status === 'below_reference'
  const gapPct = entry.reference_rate.daily_equivalent > 0
    ? Math.abs(Math.round((entry.potential_gap / entry.reference_rate.daily_equivalent) * 100))
    : 0

  return (
    <Layout title="Result">
      {/* Hero result card */}
      <div className={`rounded-2xl border p-5 mb-4 ${below ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1">{fmt(entry.job_date)}</p>
            <p className="text-xs text-gray-500 capitalize">{entry.skill_tier} · {entry.reference_rate.zone}</p>
          </div>
          <span className={`badge text-xs ${below ? 'badge-amber' : 'badge-green'}`}>
            {below ? 'Below reference' : 'At or above reference'}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <p className="text-[11px] text-gray-500 mb-1">You received</p>
            <p className="text-xl font-extrabold text-ink">{money(entry.amount_paid)}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-1">Reference rate</p>
            <p className="text-xl font-extrabold text-gray-700">{money(entry.reference_rate.daily_equivalent)}</p>
          </div>
          <div>
            <p className="text-[11px] text-gray-500 mb-1">Potential gap</p>
            <p className={`text-xl font-extrabold ${below ? 'text-amber-700' : 'text-emerald-700'}`}>
              {below ? `−${money(entry.potential_gap)}` : `+${money(Math.abs(entry.potential_gap))}`}
            </p>
          </div>
        </div>

        {below && gapPct > 0 && (
          <div className="bg-amber-100 rounded-xl px-3 py-2">
            <p className="text-xs text-amber-800">
              Payment is <strong>{gapPct}% below</strong> the reference daily rate for {entry.skill_tier} workers.
            </p>
          </div>
        )}
        {!below && (
          <div className="bg-emerald-100 rounded-xl px-3 py-2">
            <p className="text-xs text-emerald-800">
              Payment meets or exceeds the reference daily rate. ✓
            </p>
          </div>
        )}
      </div>

      {/* How this was calculated */}
      <div className="card mb-4">
        <h3 className="section-title">How this was calculated</h3>
        <div className="space-y-2.5">
          <Row label="State" value={entry.reference_rate.state} />
          <Row label="Sector" value={entry.reference_rate.scheduled_employment} />
          <Row label="Zone" value={entry.reference_rate.zone} />
          <Row label="Skill tier" value={entry.skill_tier} />
          {entry.hours_worked != null && (
            <Row label="Reported hours" value={`${entry.hours_worked} hrs (context only)`} />
          )}
          <Row label="Reference period" value={`${entry.reference_rate.effective_from} – ${entry.reference_rate.effective_to}`} />
          <Row label="Monthly reference" value={`₹${Number(entry.reference_rate.monthly_total).toLocaleString('en-IN')}`} />
          <Row label="Daily equivalent" value={`${money(entry.reference_rate.daily_equivalent)} (÷ 26 days)`} />
        </div>
      </div>

      {/* Calculation note */}
      <div className="card mb-4">
        <h3 className="section-title">Calculation note</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{entry.calculation_note}</p>
      </div>

      {/* Source */}
      <div className="card mb-5">
        <h3 className="section-title">Source</h3>
        <p className="text-sm text-gray-800 font-medium">{entry.reference_rate.source_name}</p>
        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{entry.reference_rate.source_note}</p>
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <button onClick={handleExport} disabled={exporting} className="btn-primary">
          {exporting ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Preparing report…
            </span>
          ) : '↓ Export reference summary'}
        </button>
        <Link to="/add-job" className="btn-secondary block text-center">
          + Log another job
        </Link>
      </div>

      <Link to="/ledger" className="block text-center text-xs text-gray-400 hover:text-ink transition-colors mt-4 py-2">
        View full ledger →
      </Link>

      <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed px-2">
        Reference tool only — not legal advice or certification. Verify official notifications before real-world action.
      </p>
    </Layout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <dt className="text-xs text-gray-500 shrink-0">{label}</dt>
      <dd className="text-xs font-medium text-ink text-right capitalize">{value}</dd>
    </div>
  )
}
