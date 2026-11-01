import { Router } from 'express'
import { db, save } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { enrichLines, computeTotals, findPromo } from '../lib/pricing.js'

const router = Router()

router.get('/', requireAuth, (req, res) => {
  res.json({ items: enrichLines(db().carts[req.user.id] || []) })
})

// Poori cart replace karta hai (frontend jab bhi cart badle, sync kar deta hai)
router.put('/', requireAuth, (req, res) => {
  const incoming = Array.isArray(req.body?.items) ? req.body.items : []
  const clean = enrichLines(incoming).map(({ productId, qty, size, color }) => ({ productId, qty, size, color }))
  db().carts[req.user.id] = clean
  save()
  res.json({ items: enrichLines(clean) })
})

// Promo code check + totals preview (guest bhi use kar sakta hai)
router.post('/promo', (req, res) => {
  const promo = findPromo(req.body?.code)
  if (!promo) return res.status(400).json({ message: 'Invalid promo code' })
  const lines = enrichLines(req.body?.items || [])
  res.json({ promo, totals: computeTotals(lines, promo.code) })
})

export default router
