import { useState } from 'react'
import { useAuth } from '../lib/useAuth'
import { useToast } from './Toast'

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn, signUp } = useAuth()
  const toast = useToast()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await (mode === 'signin' ? signIn(email, password) : signUp(email, password))
      toast(mode === 'signin' ? 'Signed in — your data is now saved.' : 'Account created! Your entries are now saved.', 'success')
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 fade-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold text-ink">
              {mode === 'signin' ? 'Sign in to WageGuard' : 'Create an account'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Save your entries across sessions</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1" aria-label="Close">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-600" htmlFor="auth-email">Email</label>
            <input
              id="auth-email"
              type="email" required autoComplete="email"
              className="input mt-1" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600" htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password" required minLength={6}
              className="input mt-1" placeholder="Min. 6 characters"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          className="mt-3 w-full text-center text-xs text-gray-500 hover:text-ink transition-colors py-1"
          onClick={() => { setMode(m => m === 'signin' ? 'signup' : 'signin'); setError('') }}
        >
          {mode === 'signin' ? 'New here? Create an account →' : 'Already have an account? Sign in →'}
        </button>

        <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed">
          Without an account, entries are saved as a guest in this browser session.
        </p>
      </div>
    </div>
  )
}
