import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './lib/useAuth'
import { setUnauthorizedHandler } from './lib/api'
import { ToastProvider } from './components/Toast'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import EntryDetail from './pages/EntryDetail'
import Ledger from './pages/Ledger'
import ReferenceRules from './pages/ReferenceRules'
import About from './pages/About'

function AppRoutes() {
  const { signOut } = useAuth()

  useEffect(() => {
    setUnauthorizedHandler(signOut)
  }, [signOut])

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-job" element={<AddJob />} />
      <Route path="/result/:id" element={<EntryDetail />} />
      <Route path="/entry/:id" element={<EntryDetail />} />
      <Route path="/ledger" element={<Ledger />} />
      <Route path="/reference-rules" element={<ReferenceRules />} />
      <Route path="/about" element={<About />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AppRoutes />
    </ToastProvider>
  )
}
