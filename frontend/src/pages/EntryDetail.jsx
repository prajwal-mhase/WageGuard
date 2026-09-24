import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'

function money(n) {
  return `\u20b9${Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

export default function EntryDetail() {
  const { id } = useParams()
  const [entry, setEntry] = useState(null)
  const [error, setError] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    api.getEntry(id).then(setEntry).catch((e) => setError(e.message))
  }, [id])

  async function handleExport() {
    setExportError('')
    setExporting(true)
    try {
      const { blob, contentType } = await api.getReport(id)
      // Blob URL preserves the "opens in a new tab" UX of the original
      // <a target="_blank">, but now the request actually carried the
      // Authorization header, so it succeeds instead of 401ing.
      const blobUrl = URL.createObjectURL(new Blob([blob], { type: contentType }))
      const win = window.open(blobUrl, '_blank')
      if (!win) {
        // Popup blocked — fall back to a same-tab download.
        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `wageguard-report-${id}.${contentType.includes('pdf') ? 'pdf' : 'html'}`
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
      // Revoke after a delay so the new tab/download has time to load it.
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000)
    } catch (e) {
      setExportError(e.message)
    } finally {
      setExporting(false)
    }
  }

  if (error) return <Layout title="Result"><p className="text-sm text-amber-700">{error}</p></Layout>
  if (!entry) return <Layout title="Result"><p className="text-sm text-gray-500">Loading…</p></Layout>

  const below = entry.status === 'below_reference'

  return (
    <Layout title="Result">
      <div className={`card mb-4 ${below ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-100'}`}>
        <div className="text-xs text-gray-600 mb-1">Your payment</div>
        <div className="text-3xl font-extrabold mb-4">{money(entry.amount_paid)}</div>

        <div className="text-xs text-gray-600 mb-1">Reference daily rate</div>
        <div className="text-xl font-bold mb-4">{money(entry.reference_rate.daily_equivalent)}</div>

        <div className="text-xs text-gray-600 mb-1">Potential difference</div>
        <div className={`text-2xl font-extrabold ${below ? 'text-amber-700' : 'text-emerald-600'}`}>
          {money(entry.potential_gap)}
        </div>
        <div className={`inline-block mt-2 text-[11px] font-semibold px-2 py-1 rounded ${below ? 'bg-amber-200 text-amber-800' : 'bg-emerald-200 text-emerald-800'}`}>
          {below ? 'Below reference' : 'At or above reference'}
        </div>
      </div>

      <div className="card mb-4">
        <div className="text-xs font-semibold text-gray-700 mb-2">Why?</div>
        <dl className="text-sm space-y-1.5">
          <Row label="State" value={entry.reference_rate.state} />
          <Row label="Scheduled employment" value={entry.reference_rate.scheduled_employment} />
          <Row label="Zone" value={entry.reference_rate.zone} />
          <Row label="Skill tier" value={entry.skill_tier} />
          {entry.hours_worked != null && <Row label="Reported hours" value={`${entry.hours_worked} (context only)`} />}
          <Row label="Effective" value={`${entry.reference_rate.effective_from} – ${entry.reference_rate.effective_to}`} />
        </dl>
      </div>

      <div className="card mb-4">
        <div className="text-xs font-semibold text-gray-700 mb-1">Calculation</div>
        <p className="text-sm text-gray-800 leading-relaxed">{entry.calculation_note}</p>
      </div>

      <div className="card mb-4">
        <div className="text-xs font-semibold text-gray-700 mb-1">Source</div>
        <p className="text-sm text-gray-800">{entry.reference_rate.source_name}</p>
        <p className="text-[11px] text-gray-400 mt-1">{entry.reference_rate.source_note}</p>
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-primary"
        >
          {exporting ? 'Preparing report…' : 'Export summary'}
        </button>
        {exportError && <p className="text-xs text-amber-700">{exportError}</p>}
      </div>
      <Link to="/ledger" className="block text-center text-xs text-gray-500 underline mt-4">
        View full ledger
      </Link>
    </Layout>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium capitalize">{value}</dd>
    </div>
  )
}
