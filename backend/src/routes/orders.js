import { Router } from 'express'
import { db, nextId, save } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { enrichLines, computeTotals } from '../lib/pricing.js'

const router = Router()

router.post('/', requireAuth, (req, res) => {
  const { items, shipping = {}, paymentMethod = 'cod', promoCode } = req.body || {}
  const lines = enrichLines(items)
  if (!lines.length) return res.status(400).json({ message: 'Cart khali hai' })

  for (const f of ['name', 'phone', 'address', 'city']) {
    if (!String(shipping[f] || '').trim()) return res.status(400).json({ message: `Shipping ${f} zaroori hai` })
  }
  if (!['cod', 'card'].includes(paymentMethod)) return res.status(400).json({ message: 'Invalid payment method' })

  for (const l of lines) {
    if (l.qty > l.stock) return res.status(400).json({ message: `"${l.name}" ka sirf ${l.stock} stock bacha hai` })
  }

  const totals = computeTotals(lines, promoCode)
  const order = {
    id: nextId('orders'),
    userId: req.user.id,
    customerName: req.user.name,
    items: lines.map(({ productId, name, price, image, size, color, qty }) => ({ productId, name, price, image, size, color, qty })),
    shipping: ['name', 'phone', 'address', 'city', 'postalCode'].reduce((o, k) => ({ ...o, [k]: String(shipping[k] || '').trim() }), {}),
    paymentMethod,
    // Card abhi demo hai (real gateway = Stripe/JazzCash/Easypaisa baad me jorna hai)
    paymentStatus: paymentMethod === 'card' ? 'paid (demo)' : 'pending (cash on delivery)',
    promoCode: totals.promo ? totals.promo.code : null,
    subtotal: totals.subtotal,
    discount: totals.discount,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }

  for (const l of lines) {
    const p = db().products.find((x) => x.id === l.productId)
    p.stock -= l.qty
    p.sold += l.qty
  }
  db().orders.push(order)
  db().carts[req.user.id] = []
  save()
  res.status(201).json(order)
})

router.get('/', requireAuth, (req, res) => {
  const mine = db().orders.filter((o) => o.userId === req.user.id).sort((a, b) => b.id - a.id)
  res.json(mine)
})

router.get('/:id', requireAuth, (req, res) => {
  const o = db().orders.find((x) => x.id === Number(req.params.id))
  if (!o || (o.userId !== req.user.id && req.user.role !== 'admin')) return res.status(404).json({ message: 'Order not found' })
  res.json(o)
})

export default router
