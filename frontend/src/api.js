const BASE = import.meta.env.VITE_API_URL || '/api'
export const TOKEN_KEY = 'shopco_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY))

export async function api(path, { method = 'GET', body, params } = {}) {
  let url = BASE + path
  if (params) {
    const qs = new URLSearchParams()
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && !v.length)) return
      qs.set(k, Array.isArray(v) ? v.join(',') : v)
    })
    const s = qs.toString()
    if (s) url += '?' + s
  }
  const headers = {}
  if (body) headers['Content-Type'] = 'application/json'
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`

  let res
  try {
    res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined })
  } catch {
    throw new Error('Server se connect nahi ho pa raha. Backend chal raha hai?')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || 'Something went wrong')
    err.status = res.status
    throw err
  }
  return data
}
