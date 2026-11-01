import { Router } from 'express'
import { db, save } from '../db.js'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

router.post('/newsletter', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Valid email likho' })
  if (db().subscribers.some((s) => s.email === email)) return res.json({ message: 'Aap pehle se subscribed ho 🙂' })
  db().subscribers.push({ email, createdAt: new Date().toISOString() })
  save()
  res.status(201).json({ message: 'Subscribe ho gaye! Shukriya.' })
})

/* ---------- Admin ---------- */
router.get('/admin/stats', requireAdmin, (_req, res) => {
  const d = db()
  res.json({
    products: d.products.length,
    orders: d.orders.length,
    customers: d.users.filter((u) => u.role === 'customer').length,
    subscribers: d.subscribers.length,
    revenue: Math.round(d.orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0) * 100) / 100,
  })
})

router.get('/admin/orders', requireAdmin, (_req, res) => {
  res.json([...db().orders].sort((a, b) => b.id - a.id))
})

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
router.patch('/admin/orders/:id', requireAdmin, (req, res) => {
  const o = db().orders.find((x) => x.id === Number(req.params.id))
  if (!o) return res.status(404).json({ message: 'Order not found' })
  if (!STATUSES.includes(req.body?.status)) return res.status(400).json({ message: 'Invalid status' })
  // cancel hone par stock wapis
  if (req.body.status === 'cancelled' && o.status !== 'cancelled') {
    for (const it of o.items) {
      const p = db().products.find((x) => x.id === it.productId)
      if (p) { p.stock += it.qty; p.sold = Math.max(0, p.sold - it.qty) }
    }
  }
  o.status = req.body.status
  save()
  res.json(o)
})

export default router
