import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../lib/useAuth'
import AuthModal from './AuthModal'

const TABS = [
  { path: '/dashboard', label: 'Home', icon: HomeIcon },
  { path: '/ledger', label: 'Ledger', icon: LedgerIcon },
  { path: '/reference-rules', label: 'Rates', icon: RatesIcon },
  { path: '/about', label: 'About', icon: AboutIcon },
]

export default function Layout({ children, title, onAdd }) {
  const location = useLocation()
  const { user, isGuest } = useAuth()
  const [showAuth, setShowAuth] = useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-gray-100 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-ink rounded-lg flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M7 5V9M5 7H9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="font-extrabold text-base tracking-tight text-ink">WageGuard</span>
            </Link>
            {title && <span className="text-xs text-gray-400 hidden sm:block">· {title}</span>}
          </div>

          <div className="flex items-center gap-2">
            {onAdd && (
              <Link
                to="/add-job"
                className="text-xs font-semibold bg-ink text-white rounded-lg px-3 py-1.5 hover:bg-gray-800 transition-colors"
              >
                + Add Job
              </Link>
            )}
            {user && !isGuest ? (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-2.5 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                <span className="hidden sm:block max-w-[120px] truncate">{user.email}</span>
                <span className="sm:hidden">Saved</span>
              </div>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="text-xs font-medium text-gray-500 hover:text-ink border border-gray-200 rounded-lg px-2.5 py-1.5 transition-colors"
              >
                Save account
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-5 pb-24 fade-in">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 safe-area-pb">
        <div className="max-w-lg mx-auto grid grid-cols-4">
          {TABS.map((t) => {
            const active = location.pathname === t.path
            const Icon = t.icon
            return (
              <Link
                key={t.path}
                to={t.path}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors
                  ${active ? 'text-ink' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Icon active={active} />
                {t.label}
              </Link>
            )
          })}
        </div>
      </nav>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

function HomeIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L10 3L17 9.5V17H13V13H7V17H3V9.5Z"/>
    </svg>
  )
}

function LedgerIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="14" height="14" rx="2"/>
      <path d="M7 7H13M7 10H13M7 13H10"/>
    </svg>
  )
}

function RatesIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 3V17M6 6H12.5C13.9 6 15 7.1 15 8.5S13.9 11 12.5 11H7.5C6.1 11 5 12.1 5 13.5S6.1 16 7.5 16H14"/>
    </svg>
  )
}

function AboutIcon({ active }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="10" r="7"/>
      <path d="M10 9V14M10 7V7.5"/>
    </svg>
  )
}
