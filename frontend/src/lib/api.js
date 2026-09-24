const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

export function getToken() {
  return localStorage.getItem('wageguard_token')
}

// Callback set by App to handle global 401 (token expired)
let _onUnauthorized = null
export function setUnauthorizedHandler(fn) { _onUnauthorized = fn }

async function authedFetch(path, options = {}) {
  const token = getToken()

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  })

  if (res.status === 401) {
    if (_onUnauthorized) _onUnauthorized()
    throw new Error('Session expired. Please sign in again.')
  }

  if (!res.ok) {
    let detail = `Request failed (${res.status})`
    try {
      const body = await res.json()
      detail = body.detail || detail
    } catch (_) { /* non-JSON error body */ }
    throw new Error(detail)
  }

  const contentType = res.headers.get('content-type') || ''
  if (contentType.includes('application/json')) return res.json()
  return res
}

export const api = {
  createEntry: (payload) =>
    authedFetch('/entries', { method: 'POST', body: JSON.stringify(payload) }),
  listEntries: () => authedFetch('/entries'),
  getEntry: (id) => authedFetch(`/entries/${id}`),
  getSummary: () => authedFetch('/entries/summary'),
  getRates: () => authedFetch('/rates'),

  async getReport(id) {
    const token = getToken()
    if (!token) throw new Error('Sign in to export a report')

    const res = await fetch(`${API_BASE}/entries/${id}/report`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (res.status === 401) {
      if (_onUnauthorized) _onUnauthorized()
      throw new Error('Session expired. Please sign in again.')
    }

    if (!res.ok) {
      let detail = `Could not generate report (${res.status})`
      try {
        const body = await res.json()
        detail = body.detail || detail
      } catch (_) { /* non-JSON */ }
      throw new Error(detail)
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream'
    const blob = await res.blob()
    const isPdf = contentType.includes('application/pdf')
    const filename = `wageguard-report-${id}.${isPdf ? 'pdf' : 'html'}`
    return { blob, contentType, filename }
  },
}
