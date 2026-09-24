import { useCallback, useState, useEffect } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function useAuth() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('wageguard_user') || 'null') }
    catch { return null }
  })
  const [loading, setLoading] = useState(false)

  // Auto-initialize guest session if no token exists
  useEffect(() => {
    const token = localStorage.getItem('wageguard_token')
    if (!token) {
      fetch(`${API_BASE}/auth/guest`)
        .then(r => r.ok ? r.json() : null)
        .then(body => {
          if (!body) return
          localStorage.setItem('wageguard_token', body.access_token)
          localStorage.setItem('wageguard_user', JSON.stringify(body.user))
          setUser(body.user)
        })
        .catch(() => { /* backend offline — app still renders */ })
    }
  }, [])

  const authenticate = useCallback(async (path, email, password) => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.detail || 'Authentication failed')
      localStorage.setItem('wageguard_token', body.access_token)
      localStorage.setItem('wageguard_user', JSON.stringify(body.user))
      setUser(body.user)
      return body.user
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = (email, password) => authenticate('/auth/login', email, password)
  const signUp = (email, password) => authenticate('/auth/signup', email, password)

  const signOut = useCallback(() => {
    localStorage.removeItem('wageguard_token')
    localStorage.removeItem('wageguard_user')
    setUser(null)
    // Re-initialize guest session after sign-out
    fetch(`${API_BASE}/auth/guest`)
      .then(r => r.ok ? r.json() : null)
      .then(body => {
        if (!body) return
        localStorage.setItem('wageguard_token', body.access_token)
        localStorage.setItem('wageguard_user', JSON.stringify(body.user))
        setUser(body.user)
      })
      .catch(() => {})
  }, [])

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem('wageguard_token')
    localStorage.removeItem('wageguard_user')
    setUser(null)
  }, [])

  const isGuest = user?.is_guest === true || (user?.id && user.id.startsWith('guest_'))

  return { user, loading, isGuest, signIn, signUp, signOut, handleUnauthorized }
}
