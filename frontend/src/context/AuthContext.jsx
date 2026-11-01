import { createContext, useContext, useEffect, useState } from 'react'
import { api, getToken, setToken } from '../api'

const AuthCtx = createContext(null)
export const useAuth = () => useContext(AuthCtx)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!getToken())

  useEffect(() => {
    if (!getToken()) return
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false))
  }, [])

  const handle = (d) => {
    setToken(d.token)
    setUser(d.user)
    return d.user
  }
  const login = async (email, password) => handle(await api('/auth/login', { method: 'POST', body: { email, password } }))
  const register = async (name, email, password) =>
    handle(await api('/auth/register', { method: 'POST', body: { name, email, password } }))
  const logout = () => {
    setToken(null)
    setUser(null)
  }

  return <AuthCtx.Provider value={{ user, loading, login, register, logout }}>{children}</AuthCtx.Provider>
}
