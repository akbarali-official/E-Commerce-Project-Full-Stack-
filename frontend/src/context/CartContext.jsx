import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api } from '../api'
import { useAuth } from './AuthContext'

const CartCtx = createContext(null)
export const useCart = () => useContext(CartCtx)

const LS_KEY = 'shopco_cart'
const DELIVERY_FEE = 15 // backend config.deliveryFee ke barabar

export const lineKey = (l) => `${l.productId}|${l.size}|${l.color}`

function loadLocal() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || []
  } catch {
    return []
  }
}

function merge(a, b) {
  const map = new Map()
  ;[...a, ...b].forEach((l) => {
    const k = lineKey(l)
    map.set(k, map.has(k) ? { ...map.get(k), qty: Math.min(99, map.get(k).qty + l.qty) } : { ...l })
  })
  return [...map.values()]
}

export function CartProvider({ children }) {
  const { user, loading } = useAuth()
  const [items, setItems] = useState(loadLocal)
  const [promo, setPromo] = useState(null) // { code, percent }
  const ready = useRef(false)
  const hadUser = useRef(false)

  // Login/logout par cart sync
  useEffect(() => {
    if (loading) return
    if (!user) {
      if (hadUser.current) {
        setItems([])
        setPromo(null)
        hadUser.current = false
      }
      ready.current = true
      return
    }
    hadUser.current = true
    ready.current = false
    let cancelled = false
    api('/cart')
      .then(async (server) => {
        const merged = merge(server.items, loadLocal())
        const saved = await api('/cart', { method: 'PUT', body: { items: merged } })
        if (cancelled) return
        localStorage.removeItem(LS_KEY)
        setItems(saved.items)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) ready.current = true
      })
    return () => {
      cancelled = true
    }
  }, [user?.id, loading])

  // Har change par save: guest => localStorage, user => server
  useEffect(() => {
    if (!ready.current) return
    if (!user) {
      localStorage.setItem(LS_KEY, JSON.stringify(items))
      return
    }
    const t = setTimeout(() => {
      api('/cart', { method: 'PUT', body: { items } }).catch(() => {})
    }, 400)
    return () => clearTimeout(t)
  }, [items, user])

  const addItem = (product, { size, color, qty = 1 }) => {
    const line = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stock: product.stock,
      size,
      color,
      qty,
    }
    setItems((prev) => merge(prev, [line]))
  }
  const updateQty = (key, delta) =>
    setItems((prev) =>
      prev.map((l) => (lineKey(l) === key ? { ...l, qty: Math.max(1, Math.min(l.stock || 99, l.qty + delta)) } : l)),
    )
  const removeItem = (key) => setItems((prev) => prev.filter((l) => lineKey(l) !== key))
  const clear = () => {
    setItems([])
    setPromo(null)
  }
  const applyPromo = async (code) => {
    const d = await api('/cart/promo', { method: 'POST', body: { code, items } })
    setPromo({ code: d.promo.code, percent: d.promo.percent })
  }

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, l) => s + l.price * l.qty, 0)
    const discount = promo ? Math.round(((subtotal * promo.percent) / 100) * 100) / 100 : 0
    const deliveryFee = items.length ? DELIVERY_FEE : 0
    return { subtotal, discount, deliveryFee, total: subtotal - discount + deliveryFee }
  }, [items, promo])

  const count = items.reduce((s, l) => s + l.qty, 0)

  return (
    <CartCtx.Provider value={{ items, count, totals, promo, setPromo, addItem, updateQty, removeItem, clear, applyPromo }}>
      {children}
    </CartCtx.Provider>
  )
}
