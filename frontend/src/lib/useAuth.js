import { useCallback, useState } from 'react'
import { getToken } from './api'
export function useAuth() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('wageguard_user') || 'null'))
  const [loading, setLoading] = useState(false)

  const authenticate = useCallback(async (path, email, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.detail || 'Authentication failed')
      localStorage.setItem('wageguard_token', body.access_token)
      localStorage.setItem('wageguard_user', JSON.stringify(body.user))
      setUser(body.user)
    } finally { setLoading(false) }
  }, [])

  const signIn = (email, password) => authenticate('/auth/login', email, password)
  const signUp = (email, password) => authenticate('/auth/signup', email, password)
  const signOut = () => { localStorage.removeItem('wageguard_token'); localStorage.removeItem('wageguard_user'); setUser(null) }

  return {
    session: getToken() ? { user } : null,
    loading,
    user,
    signIn,
    signUp,
    signOut,
  }
}
