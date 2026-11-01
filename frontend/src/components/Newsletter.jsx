import { useState } from 'react'
import { api } from '../api'
import { useToast } from '../context/ToastContext'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const toast = useToast()

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const d = await api('/newsletter', { method: 'POST', body: { email } })
      toast(d.message)
      setEmail('')
    } catch (err) {
      toast(err.message, 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="newsletter">
      <h3>STAY UPTO DATE ABOUT OUR LATEST OFFERS</h3>
      <form className="newsletter-form" onSubmit={submit}>
        <input type="email" required placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" disabled={busy}>{busy ? 'Please wait...' : 'Subscribe to Newsletter'}</button>
      </form>
    </div>
  )
}
