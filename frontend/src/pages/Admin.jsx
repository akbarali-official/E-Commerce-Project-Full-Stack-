import { useEffect, useState } from 'react'
import { api } from '../api'
import { useToast } from '../context/ToastContext'
import { fmtDate } from './Orders'

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const blank = { name: '', price: '', oldPrice: '', category: 'T-shirts', style: 'Casual', image: '', images: '', colors: '#000000', stock: 50, description: '' }

export default function Admin() {
  const toast = useToast()
  const [tab, setTab] = useState('products')
  const [stats, setStats] = useState(null)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [form, setForm] = useState(null) // null = hidden, object = add/edit

  const load = () => {
    api('/admin/stats').then(setStats).catch(() => {})
    api('/products', { params: { limit: 100, sort: 'newest' } }).then((d) => setProducts(d.items))
    api('/admin/orders').then(setOrders).catch(() => {})
  }
  useEffect(load, [])

  const save = async (e) => {
    e.preventDefault()
    const body = { ...form, colors: String(form.colors), images: String(form.images || '') }
    try {
      if (form.id) await api(`/products/${form.id}`, { method: 'PUT', body })
      else await api('/products', { method: 'POST', body })
      toast('Saved ✅')
      setForm(null)
      load()
    } catch (err) {
      toast(err.message, 'err')
    }
  }
  const del = async (p) => {
    if (!confirm(`"${p.name}" delete karna hai?`)) return
    await api(`/products/${p.id}`, { method: 'DELETE' })
    load()
  }
  const setStatus = async (o, status) => {
    try {
      await api(`/admin/orders/${o.id}`, { method: 'PATCH', body: { status } })
      load()
    } catch (err) {
      toast(err.message, 'err')
    }
  }
  const f = (k) => ({ value: form[k] ?? '', onChange: (e) => setForm({ ...form, [k]: e.target.value }) })

  return (
    <div className="container section">
      <h2 style={{ fontSize: 32, marginBottom: 24 }}>ADMIN PANEL</h2>
      {stats && (
        <div className="stat-cards">
          <div><b>${stats.revenue}</b><span>Revenue</span></div>
          <div><b>{stats.orders}</b><span>Orders</span></div>
          <div><b>{stats.products}</b><span>Products</span></div>
          <div><b>{stats.customers}</b><span>Customers</span></div>
          <div><b>{stats.subscribers}</b><span>Subscribers</span></div>
        </div>
      )}

      <div className="tabs">
        <span className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</span>
        <span className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</span>
      </div>

      {tab === 'products' && (
        <>
          <button className="btn" onClick={() => setForm({ ...blank })}>+ Add Product</button>

          {form && (
            <form className="form-card" onSubmit={save} style={{ margin: '20px 0' }}>
              <h3>{form.id ? 'Edit Product' : 'New Product'}</h3>
              <div className="form-grid">
                <input required placeholder="Name" {...f('name')} />
                <input required placeholder="Category (T-shirts, Jeans...)" {...f('category')} />
                <input required type="number" step="0.01" placeholder="Price" {...f('price')} />
                <input type="number" step="0.01" placeholder="Old price (optional)" {...f('oldPrice')} />
                <select {...f('style')}>{['Casual', 'Formal', 'Party', 'Gym'].map((s) => <option key={s}>{s}</option>)}</select>
                <input required type="number" placeholder="Stock" {...f('stock')} />
                <input required className="span2" placeholder="Main image (/images/p1.png ya https://...)" {...f('image')} />
                <input className="span2" placeholder="Extra images (comma separated, optional)" {...f('images')} />
                <input className="span2" placeholder="Colors hex comma separated: #000000,#3b82f6" {...f('colors')} />
                <textarea className="span2" rows={3} placeholder="Description" {...f('description')} />
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                <button className="btn" type="submit">Save</button>
                <button className="btn btn-outline" type="button" onClick={() => setForm(null)}>Cancel</button>
              </div>
            </form>
          )}

          <div className="table-wrap">
            <table className="admin-table">
              <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Sold</th><th></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td><img src={p.image} alt="" width="44" height="44" style={{ objectFit: 'cover', borderRadius: 8 }} /></td>
                    <td>{p.name}</td><td>{p.category}</td><td>${p.price}</td><td>{p.stock}</td><td>{p.sold}</td>
                    <td className="actions">
                      <button onClick={() => setForm({ ...p, colors: p.colors.join(','), images: p.images.join(','), oldPrice: p.oldPrice ?? '' })}>Edit</button>
                      <button className="danger" onClick={() => del(p)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="table-wrap">
          <table className="admin-table">
            <thead><tr><th>#</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.shipping.name}<div className="muted" style={{ fontSize: 12 }}>{o.shipping.phone} · {o.shipping.city}</div></td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td>{o.items.map((i) => `${i.name} ×${i.qty}`).join(', ')}</td>
                  <td>${o.total.toFixed(2)}</td>
                  <td>{o.paymentStatus}</td>
                  <td>
                    <select value={o.status} onChange={(e) => setStatus(o, e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && <tr><td colSpan="7">Abhi koi order nahi.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
