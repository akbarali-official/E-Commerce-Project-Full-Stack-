import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { fmtDate } from './Orders'

export default function OrderDetail() {
  const { id } = useParams()
  const [sp] = useSearchParams()
  const [o, setO] = useState(null)
  const [err, setErr] = useState('')
  useEffect(() => {
    api(`/orders/${id}`).then(setO).catch((e) => setErr(e.message))
  }, [id])

  if (err) return <div className="container section">{err}</div>
  if (!o) return <div className="container section">Loading...</div>

  return (
    <div className="container section">
      {sp.get('placed') && (
        <div className="success-box">
          <h2>THANK YOU! 🎉</h2>
          <p>Aap ka order #{o.id} place ho gaya hai.</p>
        </div>
      )}
      <h2 style={{ fontSize: 28, marginBottom: 6 }}>ORDER #{o.id}</h2>
      <p className="muted" style={{ marginBottom: 20 }}>{fmtDate(o.createdAt)} · <span className={`status ${o.status}`}>{o.status}</span></p>

      <div className="cart-layout">
        <div>
          {o.items.map((it, i) => (
            <div className="cart-item" key={i}>
              <div className="cart-item-thumb"><img src={it.image} alt={it.name} className="cart-item-img" /></div>
              <div className="cart-item-info">
                <h4>{it.name}</h4>
                <div className="meta">Size: {it.size} · Qty: {it.qty}</div>
                <div className="price">${(it.price * it.qty).toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="order-summary">
          <h3>Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>${o.subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Discount {o.promoCode ? `(${o.promoCode})` : ''}</span><span className="discount">-${o.discount.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery</span><span>${o.deliveryFee.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>${o.total.toFixed(2)}</span></div>
          <p className="muted" style={{ fontSize: 13 }}>
            <b>Ship to:</b> {o.shipping.name}, {o.shipping.phone}<br />
            {o.shipping.address}, {o.shipping.city} {o.shipping.postalCode}<br />
            <b>Payment:</b> {o.paymentStatus}
          </p>
        </div>
      </div>
      <Link to="/orders" style={{ color: 'var(--text-muted)', fontSize: 14 }}>← All orders</Link>
    </div>
  )
}
