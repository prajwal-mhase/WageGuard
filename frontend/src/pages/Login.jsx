import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

export default function Login() {
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const fn = mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password })
      const { error: authError } = await fn
      if (authError) throw authError
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-3xl font-extrabold tracking-tight mb-2">WageGuard</div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Know if your pay is below the reference minimum —
            before you leave the job site.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-xs text-amber-700">{error}</p>}
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <button
          className="mt-4 w-full text-center text-xs text-gray-500 underline"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
        >
          {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>

        <p className="mt-8 text-[11px] text-gray-400 text-center leading-relaxed">
          Reference tool only — not legal advice. Coverage limited to Maharashtra,
          Construction of Roads and Buildings, Zone I.
        </p>
      </div>
    </div>
  )
}
