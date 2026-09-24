import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../lib/api'

const today = () => new Date().toISOString().slice(0, 10)

const SKILL_TIERS = [
  { value: 'unskilled', label: 'Unskilled', daily: '₹850/day ref.' },
  { value: 'semi-skilled', label: 'Semi-skilled', daily: '₹891/day ref.' },
  { value: 'skilled', label: 'Skilled', daily: '₹950/day ref.' },
]

export default function AddJob() {
  const [jobDate, setJobDate] = useState(today())
  const [zone] = useState('Zone I')
  const [skillTier, setSkillTier] = useState('semi-skilled')
  const [hours, setHours] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const amountNum = Number(amount)
    if (isNaN(amountNum) || amountNum < 0) {
      setError('Please enter a valid amount paid (0 or more).')
      return
    }

    setLoading(true)
    try {
      const entry = await api.createEntry({
        job_date: jobDate,
        zone,
        skill_tier: skillTier,
        hours_worked: hours === '' ? null : Number(hours),
        amount_paid: amountNum,
      })
      navigate(`/entry/${entry.id}`)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedTier = SKILL_TIERS.find(t => t.value === skillTier)

  return (
    <Layout title="Log a job">
      {/* Scope banner */}
      <div className="mb-4 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3">
        <p className="text-xs text-gray-600 leading-relaxed">
          <span className="font-semibold text-gray-800">Scope:</span> Maharashtra · Construction of Roads and Buildings · Zone I · Jan–Jun 2026
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date */}
        <div className="card">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor="job-date">
            Date of work
          </label>
          <input
            id="job-date"
            type="date"
            required
            max={today()}
            min="2026-01-01"
            className="input mt-2"
            value={jobDate}
            onChange={(e) => setJobDate(e.target.value)}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">Reference rates cover 1 Jan – 30 Jun 2026</p>
        </div>

        {/* Skill tier */}
        <div className="card">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Skill tier
          </label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {SKILL_TIERS.map(t => (
              <button
                key={t.value}
                type="button"
                onClick={() => setSkillTier(t.value)}
                className={`rounded-xl border py-2.5 px-2 text-center transition-all
                  ${skillTier === t.value
                    ? 'border-ink bg-ink text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
              >
                <div className="text-xs font-semibold">{t.label}</div>
                <div className={`text-[10px] mt-0.5 ${skillTier === t.value ? 'text-gray-300' : 'text-gray-400'}`}>
                  {t.daily}
                </div>
              </button>
            ))}
          </div>
          {selectedTier && (
            <p className="text-[11px] text-gray-400 mt-2">
              Reference: <strong className="text-gray-600">{selectedTier.daily}</strong> (monthly ÷ 26 days)
            </p>
          )}
        </div>

        {/* Amount paid */}
        <div className="card">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor="amount-paid">
            Amount paid (₹)
          </label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">₹</span>
            <input
              id="amount-paid"
              type="number"
              required
              min="0"
              step="1"
              className="input pl-7"
              placeholder="e.g. 650"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5">Enter the total amount you were paid for this day's work.</p>
        </div>

        {/* Hours (optional) */}
        <div className="card">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide" htmlFor="hours-worked">
            Hours worked <span className="font-normal text-gray-400 normal-case">(optional)</span>
          </label>
          <input
            id="hours-worked"
            type="number"
            min="0"
            max="24"
            step="0.5"
            className="input mt-2"
            placeholder="e.g. 9"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Recorded for context only — not converted into an hourly rate in this MVP.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Checking reference rate…
            </span>
          ) : 'Check against reference rate →'}
        </button>
      </form>
    </Layout>
  )
}
