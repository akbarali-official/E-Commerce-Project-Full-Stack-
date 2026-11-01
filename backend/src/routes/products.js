import { Router } from 'express'
import { db, nextId, save } from '../db.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = Router()
const SIZES = ['XX-Small', 'X-Small', 'Small', 'Medium', 'Large', 'X-Large', 'XX-Large']
const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : [])

router.get('/meta', (_req, res) => {
  const ps = db().products
  const counts = {}
  ps.forEach((p) => (counts[p.category] = (counts[p.category] || 0) + 1))
  const colors = [...new Set(ps.flatMap((p) => p.colors))]
  res.json({
    categories: Object.keys(counts).sort(),
    styles: ['Casual', 'Formal', 'Party', 'Gym'],
    sizes: SIZES,
    colors,
    maxPrice: Math.max(500, ...ps.map((p) => Math.ceil(p.price / 50) * 50)),
  })
})

router.get('/', (req, res) => {
  const { search, sale, sort = 'popular' } = req.query
  const cats = list(req.query.category).map((s) => s.toLowerCase())
  const styles = list(req.query.style).map((s) => s.toLowerCase())
  const colors = list(req.query.colors).map((s) => s.toLowerCase())
  const sizes = list(req.query.sizes)
  const min = Number(req.query.minPrice) || 0
  const max = Number(req.query.maxPrice) || Infinity
  const q = String(search || '').trim().toLowerCase()

  let items = db().products.filter((p) => {
    if (q && !`${p.name} ${p.category} ${p.style}`.toLowerCase().includes(q)) return false
    if (cats.length && !cats.includes(p.category.toLowerCase())) return false
    if (styles.length && !styles.includes(p.style.toLowerCase())) return false
    if (colors.length && !p.colors.some((c) => colors.includes(c.toLowerCase()))) return false
    if (sizes.length && !p.sizes.some((s) => sizes.includes(s))) return false
    if (sale === '1' && !(p.oldPrice && p.oldPrice > p.price)) return false
    return p.price >= min && p.price <= max
  })

  const sorters = {
    popular: (a, b) => b.sold - a.sold,
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    rating: (a, b) => b.rating - a.rating,
  }
  items = [...items].sort(sorters[sort] || sorters.popular)

  const total = items.length
  const limit = Math.min(Number(req.query.limit) || 12, 100)
  const page = Math.max(Number(req.query.page) || 1, 1)
  const pages = Math.max(Math.ceil(total / limit), 1)
  res.json({ items: items.slice((page - 1) * limit, page * limit), total, page, pages })
})

router.get('/:id', (req, res) => {
  const p = db().products.find((x) => x.id === Number(req.params.id))
  if (!p) return res.status(404).json({ message: 'Product not found' })
  res.json(p)
})

/* ---------- Reviews ---------- */
router.get('/:id/reviews', (req, res) => {
  const reviews = db()
    .reviews.filter((r) => r.productId === Number(req.params.id))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  res.json(reviews)
})

router.post('/:id/reviews', requireAuth, (req, res) => {
  const p = db().products.find((x) => x.id === Number(req.params.id))
  if (!p) return res.status(404).json({ message: 'Product not found' })
  const rating = Number(req.body?.rating)
  const text = String(req.body?.text || '').trim()
  if (!(rating >= 1 && rating <= 5)) return res.status(400).json({ message: 'Rating 1 se 5 ke beech ho' })
  if (text.length < 3) return res.status(400).json({ message: 'Review thoda likho' })
  if (db().reviews.some((r) => r.productId === p.id && r.userId === req.user.id)) {
    return res.status(409).json({ message: 'Aap is product ka review pehle de chuke ho' })
  }
  const review = {
    id: nextId('reviews'),
    productId: p.id,
    userId: req.user.id,
    name: req.user.name,
    rating,
    text,
    createdAt: new Date().toISOString(),
  }
  db().reviews.push(review)
  p.rating = Math.round(((p.rating * p.reviewCount + rating) / (p.reviewCount + 1)) * 10) / 10
  p.reviewCount += 1
  save()
  res.status(201).json(review)
})

/* ---------- Admin CRUD ---------- */
function readBody(b, existing = {}) {
  const colors = Array.isArray(b.colors) ? b.colors : list(b.colors)
  const image = String(b.image ?? existing.image ?? '').trim()
  const extra = Array.isArray(b.images) ? b.images : list(b.images)
  return {
    name: String(b.name ?? existing.name ?? '').trim(),
    description: String(b.description ?? existing.description ?? '').trim(),
    price: Number(b.price ?? existing.price),
    oldPrice: b.oldPrice === '' || b.oldPrice == null ? (b.oldPrice === undefined ? existing.oldPrice ?? null : null) : Number(b.oldPrice),
    category: String(b.category ?? existing.category ?? '').trim(),
    style: String(b.style ?? existing.style ?? 'Casual').trim(),
    colors: colors.length ? colors : existing.colors || ['#000000'],
    image,
    images: extra.length ? extra : existing.images && existing.images.length ? existing.images : [image],
    stock: Number(b.stock ?? existing.stock ?? 0),
  }
}
function validate(p) {
  if (!p.name) return 'Name zaroori hai'
  if (!(p.price >= 0)) return 'Price sahi likho'
  if (!p.category) return 'Category zaroori hai'
  if (!p.image) return 'Image path/URL zaroori hai'
  if (!(p.stock >= 0)) return 'Stock sahi likho'
  return null
}

router.post('/', requireAdmin, (req, res) => {
  const data = readBody(req.body || {})
  const err = validate(data)
  if (err) return res.status(400).json({ message: err })
  const product = {
    id: nextId('products'),
    ...data,
    sizes: ['Small', 'Medium', 'Large', 'X-Large'],
    rating: 0,
    reviewCount: 0,
    sold: 0,
    createdAt: new Date().toISOString(),
  }
  db().products.push(product)
  save()
  res.status(201).json(product)
})

router.put('/:id', requireAdmin, (req, res) => {
  const p = db().products.find((x) => x.id === Number(req.params.id))
  if (!p) return res.status(404).json({ message: 'Product not found' })
  const data = readBody(req.body || {}, p)
  const err = validate(data)
  if (err) return res.status(400).json({ message: err })
  Object.assign(p, data)
  save()
  res.json(p)
})

router.delete('/:id', requireAdmin, (req, res) => {
  const i = db().products.findIndex((x) => x.id === Number(req.params.id))
  if (i < 0) return res.status(404).json({ message: 'Product not found' })
  db().products.splice(i, 1)
  db().reviews = db().reviews.filter((r) => r.productId !== Number(req.params.id))
  save()
  res.json({ ok: true })
})

export default router
