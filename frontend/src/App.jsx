import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './lib/useAuth'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddJob from './pages/AddJob'
import EntryDetail from './pages/EntryDetail'
import Ledger from './pages/Ledger'
import ReferenceRules from './pages/ReferenceRules'
import About from './pages/About'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Loading…
      </div>
    )
  }
  // AUTH BYPASS: skip redirect
  // if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/add-job" element={<Protected><AddJob /></Protected>} />
      <Route path="/result/:id" element={<Protected><EntryDetail /></Protected>} />
      <Route path="/entry/:id" element={<Protected><EntryDetail /></Protected>} />
      <Route path="/ledger" element={<Protected><Ledger /></Protected>} />
      <Route path="/reference-rules" element={<Protected><ReferenceRules /></Protected>} />
      <Route path="/about" element={<Protected><About /></Protected>} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
