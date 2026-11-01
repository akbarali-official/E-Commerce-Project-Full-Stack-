import { useState } from 'react'
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, login, register } = useAuth()
  const [sp] = useSearchParams()
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [f, setF] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const next = sp.get('next') || '/'

  if (user) return <Navigate to={next} replace />

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') await login(f.email, f.password)
      else await register(f.name, f.email, f.password)
      navigate(next, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container auth-wrap">
      <form className="form-card auth-card" onSubmit={submit}>
        <h2>{mode === 'login' ? 'LOGIN' : 'CREATE ACCOUNT'}</h2>
        {mode === 'register' && (
          <input required placeholder="Full name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        )}
        <input required type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required type="password" minLength={6} placeholder="Password (min 6)" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        {error && <p className="form-error">{error}</p>}
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Please wait...' : mode === 'login' ? 'Login' : 'Sign Up'}</button>
        <p className="muted switch">
          {mode === 'login' ? 'Account nahi hai?' : 'Pehle se account hai?'}{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); setError(''); setMode(mode === 'login' ? 'register' : 'login') }}>
            <u>{mode === 'login' ? 'Sign up' : 'Login'}</u>
          </a>
        </p>
      </form>
    </div>
  )
}
