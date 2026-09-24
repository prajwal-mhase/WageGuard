import Layout from '../components/Layout'
import { useAuth } from '../lib/useAuth'
import { useToast } from '../components/Toast'

export default function About() {
  const { user, isGuest, signOut } = useAuth()
  const toast = useToast()

  function handleSignOut() {
    signOut()
    toast('Signed out successfully', 'success')
  }

  return (
    <Layout title="About">
      {/* Hero */}
      <div className="card mb-4 bg-ink text-white border-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2L18 6V14L10 18L2 14V6L10 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M10 7V13M7 10H13" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base font-extrabold">WageGuard</h1>
            <p className="text-xs text-gray-400">Reference Wage Check & Earnings Ledger</p>
          </div>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Know if your pay is below the reference minimum — before you leave the job site.
        </p>
      </div>

      {/* What it does */}
      <div className="card mb-4">
        <h2 className="section-title">What WageGuard does</h2>
        <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
          <p>
            WageGuard lets a construction daily-wage worker in Maharashtra log a job and instantly
            see whether the amount paid meets the officially referenced minimum wage for their
            skill tier.
          </p>
          <p>
            Every result shows the applicable reference rate, its source, its effective dates,
            and the exact calculation — not just a number.
          </p>
          <p>
            The personal earnings ledger tracks cumulative potential underpayment across all
            logged jobs.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="card mb-4 bg-amber-50 border-amber-200">
        <h2 className="section-title text-amber-700">Important disclaimer</h2>
        <div className="space-y-2 text-xs text-amber-900 leading-relaxed">
          <p>
            WageGuard is an <strong>educational/reference tool</strong>. It does not provide
            legal advice or legal certification.
          </p>
          <p>
            Rates are sourced from WageIndicator.org, stated to be compiled from Maharashtra
            Labour Department notifications. The team has not independently verified the
            original gazette notification.
          </p>
          <p>
            Daily equivalents are calculated as monthly rate ÷ 26 working days — an MVP
            assumption, not an officially published daily rate.
          </p>
          <p>
            Coverage is currently limited to Maharashtra, Construction of Roads and Buildings,
            Zone I, 1 Jan – 30 Jun 2026.
          </p>
          <p>
            <strong>Verify current official wage notifications before taking real-world action.</strong>
          </p>
        </div>
      </div>

      {/* Built by */}
      <div className="card mb-4">
        <h2 className="section-title">Built by</h2>
        <p className="text-sm font-semibold text-ink">Team Infinity — Prajwal Mhase</p>
        <p className="text-xs text-gray-500 mt-1">Global Innovation Hackathon 2026, Bharat Academix</p>
        <a
          href="https://wage-guard-ochre.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline mt-2 block"
        >
          wage-guard-ochre.vercel.app ↗
        </a>
      </div>

      {/* Account */}
      <div className="card mb-4">
        <h2 className="section-title">Account</h2>
        {user && !isGuest ? (
          <div>
            <p className="text-sm text-gray-700 mb-1">Signed in as</p>
            <p className="text-sm font-semibold text-ink break-all">{user.email}</p>
            <p className="text-xs text-gray-400 mt-1 mb-3">Your entries are saved to your account.</p>
            <button
              onClick={handleSignOut}
              className="btn-secondary"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 mb-1">You're using WageGuard as a guest.</p>
            <p className="text-xs text-gray-400">Entries are saved locally in this browser. Sign in (top right) to save across devices.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
