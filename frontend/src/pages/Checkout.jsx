import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export default function Checkout() {
  const { user } = useAuth()
  const { items, totals, promo, clear } = useCart()
  const toast = useToast()
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [payment, setPayment] = useState('cod')
  const [f, setF] = useState({ name: user?.name || '', phone: '', address: '', city: '', postalCode: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  if (!items.length) {
    return <div className="container section">Cart khali hai. <Link to="/category"><u>Shop</u></Link></div>
  }

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    try {
      const order = await api('/orders', {
        method: 'POST',
        body: {
          items: items.map(({ productId, qty, size, color }) => ({ productId, qty, size, color })),
          shipping: f,
          paymentMethod: payment,
          promoCode: promo?.code,
        },
      })
      clear()
      toast('Order place ho gaya 🎉')
      navigate(`/orders/${order.id}?placed=1`)
    } catch (err) {
      toast(err.message, 'err')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container">
      <div className="breadcrumb"><Link to="/">Home</Link> &gt; <Link to="/cart">Cart</Link> &gt; Checkout</div>
      <h2 style={{ fontSize: 32, marginBottom: 24 }}>CHECKOUT</h2>

      <form className="cart-layout" onSubmit={submit}>
        <div className="form-card">
          <h3>Shipping Details</h3>
          <div className="form-grid">
            <input required placeholder="Full name" value={f.name} onChange={set('name')} />
            <input required placeholder="Phone number" value={f.phone} onChange={set('phone')} />
            <input required className="span2" placeholder="Address" value={f.address} onChange={set('address')} />
            <input required placeholder="City" value={f.city} onChange={set('city')} />
            <input placeholder="Postal code (optional)" value={f.postalCode} onChange={set('postalCode')} />
          </div>

          <h3 style={{ marginTop: 28 }}>Payment</h3>
          <label className="radio-row">
            <input type="radio" name="pay" checked={payment === 'cod'} onChange={() => setPayment('cod')} /> Cash on Delivery
          </label>
          <label className="radio-row">
            <input type="radio" name="pay" checked={payment === 'card'} onChange={() => setPayment('card')} /> Card (demo — koi asli payment nahi hoti)
          </label>
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          {items.map((it) => (
            <div className="summary-row" key={`${it.productId}${it.size}${it.color}`}>
              <span>{it.name} ({it.size}) × {it.qty}</span>
              <span>${(it.price * it.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ border: 0, borderTop: '1px solid var(--gray-border)', margin: '14px 0' }} />
          <div className="summary-row"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
          <div className="summary-row"><span>Discount</span><span className="discount">-${totals.discount.toFixed(2)}</span></div>
          <div className="summary-row"><span>Delivery Fee</span><span>${totals.deliveryFee.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>
          <button className="btn" type="submit" disabled={busy} style={{ marginTop: 16 }}>{busy ? 'Placing order...' : 'Place Order'}</button>
        </div>
      </form>
    </div>
  )
}
