import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'

const today = () => new Date().toISOString().slice(0, 10)

export default function AddJob() {
  const [jobDate, setJobDate] = useState(today())
  const [zone, setZone] = useState('Zone I')
  const [skillTier, setSkillTier] = useState('semi-skilled')
  const [hours, setHours] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const entry = await api.createEntry({
        job_date: jobDate,
        zone,
        skill_tier: skillTier,
        hours_worked: hours === '' ? null : Number(hours),
        amount_paid: Number(amount),
      })
      navigate(`/entry/${entry.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout title="Log a job">
      <div className="card mb-4 bg-gray-50">
        <p className="text-xs text-gray-600">
          Current MVP scope: <strong>Maharashtra → Construction of Roads and
          Buildings → Zone I</strong>. Other zones/sectors are not yet supported.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-600">Date</label>
          <input
            type="date" required max={today()} className="input mt-1"
            value={jobDate} onChange={(e) => setJobDate(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Zone</label>
          <select className="input mt-1" value={zone} onChange={(e) => setZone(e.target.value)}>
            <option value="Zone I">Zone I</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Skill tier</label>
          <select className="input mt-1" value={skillTier} onChange={(e) => setSkillTier(e.target.value)}>
            <option value="unskilled">Unskilled</option>
            <option value="semi-skilled">Semi-skilled</option>
            <option value="skilled">Skilled</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Hours worked (optional)</label>
          <input
            type="number" min="0" max="24" step="0.5" className="input mt-1"
            placeholder="e.g. 9" value={hours} onChange={(e) => setHours(e.target.value)}
          />
          <p className="text-[11px] text-gray-400 mt-1">
            Recorded for context only — not converted into an hourly rate.
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600">Amount paid (₹)</label>
          <input
            type="number" required min="0" step="1" className="input mt-1"
            placeholder="e.g. 650" value={amount} onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {error && <p className="text-xs text-amber-700">{error}</p>}

        <button className="btn-primary" disabled={loading}>
          {loading ? 'Checking…' : 'Check against reference rate'}
        </button>
      </form>
    </Layout>
  )
}
