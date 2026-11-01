import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export const fmtDate = (d) => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

export default function Orders() {
  const [orders, setOrders] = useState(null)
  useEffect(() => {
    api('/orders').then(setOrders).catch(() => setOrders([]))
  }, [])

  return (
    <div className="container section">
      <h2 style={{ fontSize: 32, marginBottom: 24 }}>MY ORDERS</h2>
      {orders === null && <p>Loading...</p>}
      {orders && orders.length === 0 && <p>Abhi koi order nahi. <Link to="/category"><u>Shop</u></Link></p>}
      {orders && orders.map((o) => (
        <Link to={`/orders/${o.id}`} className="order-row" key={o.id}>
          <div><b>Order #{o.id}</b><div className="muted">{fmtDate(o.createdAt)}</div></div>
          <div className="muted">{o.items.reduce((s, i) => s + i.qty, 0)} items</div>
          <span className={`status ${o.status}`}>{o.status}</span>
          <b>${o.total.toFixed(2)}</b>
        </Link>
      ))}
    </div>
  )
}
