import Layout from '../components/Layout'
import { useAuth } from '../lib/useAuth'

export default function About() {
  const { signOut } = useAuth()

  return (
    <Layout title="About & disclaimer">
      <div className="card mb-4 space-y-3 text-sm text-gray-800 leading-relaxed">
        <p>
          WageGuard is an educational/reference tool. It does not provide
          legal advice or legal certification.
        </p>
        <p>
          Rates are sourced from WageIndicator.org and stated to be compiled
          from Maharashtra Labour Department notifications. The team has not
          independently verified the original gazette notification.
        </p>
        <p>
          Daily equivalents shown in the MVP are calculated as monthly rate
          ÷ 26 working days.
        </p>
        <p>
          Coverage is currently limited to Maharashtra, Construction of
          Roads and Buildings, Zone I.
        </p>
        <p>
          Users should verify current official wage notifications before
          taking real-world action.
        </p>
      </div>

      <div className="card mb-4">
        <div className="text-xs font-semibold text-gray-700 mb-1">Built by</div>
        <p className="text-sm">Team Infinity — Prajwal Mhase</p>
        <p className="text-xs text-gray-500 mt-1">
          Global Innovation Hackathon 2026, Bharat Academix
        </p>
      </div>

      <button
        onClick={() => signOut()}
        className="w-full text-center text-xs text-gray-500 underline py-3"
      >
        Sign out
      </button>
    </Layout>
  )
}
