import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { path: '/dashboard', label: 'Home' },
  { path: '/ledger', label: 'Ledger' },
  { path: '/reference-rules', label: 'Rates' },
  { path: '/about', label: 'About' },
]

export default function Layout({ children, title, onAdd }) {
  const location = useLocation()

  return (
    <div className="min-h-screen flex flex-col bg-paper">
      <header className="sticky top-0 z-10 bg-paper/90 backdrop-blur border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div>
          <div className="font-extrabold text-lg tracking-tight">WageGuard</div>
          {title && <div className="text-xs text-gray-500">{title}</div>}
        </div>
        {onAdd && (
          <Link to="/add-job" className="text-sm font-semibold bg-ink text-white rounded-lg px-3 py-1.5">
            + Add Job
          </Link>
        )}
      </header>

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-4 pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto grid grid-cols-4">
          {TABS.map((t) => (
            <Link
              key={t.path}
              to={t.path}
              className={`text-center py-3 text-xs font-medium ${
                location.pathname === t.path ? 'text-ink' : 'text-gray-400'
              }`}
            >
              {t.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  )
}
