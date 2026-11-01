import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart, lineKey } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import Newsletter from '../components/Newsletter'

export default function Cart() {
  const { items, totals, promo, updateQty, removeItem, applyPromo, setPromo } = useCart()
  const [code, setCode] = useState('')
  const toast = useToast()
  const navigate = useNavigate()

  const onApply = async () => {
    try {
      await applyPromo(code)
      toast('Promo code lag gaya ✅')
      setCode('')
    } catch (e) {
      toast(e.message, 'err')
    }
  }

  return (
    <div className="container">
      <div className="breadcrumb"><Link to="/">Home</Link> &gt; Cart</div>
      <h2 style={{ fontSize: 32, marginBottom: 24 }}>YOUR CART</h2>

      <div className="cart-layout">
        <div>
          {items.length === 0 && (
            <p>Your cart is empty. <Link to="/category"><u>Shopping shuru karo</u></Link></p>
          )}
          {items.map((it) => {
            const k = lineKey(it)
            return (
              <div className="cart-item" key={k}>
                <Link to={`/product/${it.productId}`} className="cart-item-thumb">
                  <img src={it.image} alt={it.name} className="cart-item-img" />
                </Link>
                <div className="cart-item-info">
                  <h4>{it.name}</h4>
                  <div className="meta">Size: {it.size}</div>
                  <div className="meta">Color: <span className="color-chip" style={{ background: it.color }} /></div>
                  <div className="price">${it.price}</div>
                </div>
                <button className="cart-remove" onClick={() => removeItem(k)} aria-label="Remove">🗑</button>
                <div className="cart-qty">
                  <button onClick={() => updateQty(k, -1)}>-</button>
                  <span>{it.qty}</span>
                  <button onClick={() => updateQty(k, 1)}>+</button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>${totals.subtotal.toFixed(2)}</span></div>
          <div className="summary-row">
            <span>Discount{promo ? ` (-${promo.percent}%)` : ''}</span>
            <span className="discount">-${totals.discount.toFixed(2)}</span>
          </div>
          <div className="summary-row"><span>Delivery Fee</span><span>${totals.deliveryFee.toFixed(2)}</span></div>
          <div className="summary-row total"><span>Total</span><span>${totals.total.toFixed(2)}</span></div>

          {promo ? (
            <p className="promo-applied">Code <b>{promo.code}</b> applied <button onClick={() => setPromo(null)}>remove</button></p>
          ) : (
            <div className="promo-row">
              <input placeholder="Add promo code (SHOP20)" value={code} onChange={(e) => setCode(e.target.value)} />
              <button className="btn" onClick={onApply} disabled={!code.trim()}>Apply</button>
            </div>
          )}
          <button className="btn" disabled={!items.length} onClick={() => navigate('/checkout')}>Go to Checkout →</button>
        </div>
      </div>

      <Link to="/category" style={{ color: 'var(--text-muted)', fontSize: 14 }}>← Continue Shopping</Link>
      <Newsletter />
    </div>
  )
}
