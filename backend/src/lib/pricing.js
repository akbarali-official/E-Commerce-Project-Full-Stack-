import { config, PROMO_CODES } from '../config.js'
import { db } from '../db.js'

export const round2 = (n) => Math.round(n * 100) / 100

// Cart lines [{productId, qty, size, color}] ko current DB prices ke sath enrich karta hai
export function enrichLines(lines) {
  const out = []
  for (const l of lines || []) {
    const p = db().products.find((x) => x.id === Number(l.productId))
    if (!p) continue // product delete ho chuka hai
    out.push({
      productId: p.id,
      name: p.name,
      price: p.price,
      image: p.image,
      stock: p.stock,
      size: l.size || p.sizes[1] || p.sizes[0],
      color: l.color || p.colors[0] || null,
      qty: Math.max(1, Math.min(Number(l.qty) || 1, 99)),
    })
  }
  return out
}

export function findPromo(code) {
  if (!code) return null
  const key = String(code).trim().toUpperCase()
  const promo = PROMO_CODES[key]
  return promo ? { code: key, ...promo } : null
}

export function computeTotals(lines, promoCode) {
  const subtotal = round2(lines.reduce((s, l) => s + l.price * l.qty, 0))
  const promo = findPromo(promoCode)
  const discount = promo ? round2((subtotal * promo.percent) / 100) : 0
  const deliveryFee = lines.length ? config.deliveryFee : 0
  const total = round2(subtotal - discount + deliveryFee)
  return { subtotal, discount, deliveryFee, total, promo }
}
