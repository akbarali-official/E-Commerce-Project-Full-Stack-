// Chhota sa JSON-file database (koi native dependency nahi => Windows par bhi asani se chalta hai).
// Data backend/data/db.json me save hota hai. Baad me chaho to PostgreSQL/MongoDB laga sakte ho.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'data')
const DB_FILE = path.join(DATA_DIR, 'db.json')

const empty = () => ({
  counters: { users: 0, products: 0, reviews: 0, orders: 0 },
  users: [],
  products: [],
  reviews: [],
  carts: {}, // userId -> [{ productId, qty, size, color }]
  orders: [],
  subscribers: [],
})

let data = empty()

export function loadDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  if (fs.existsSync(DB_FILE)) {
    try {
      data = { ...empty(), ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) }
      return true
    } catch (e) {
      console.error('db.json corrupt hai, naya bana raha hoon:', e.message)
      fs.copyFileSync(DB_FILE, DB_FILE + '.broken-' + Date.now())
    }
  }
  data = empty()
  return false
}

export function resetDb() {
  data = empty()
}

export function save() {
  const tmp = DB_FILE + '.tmp'
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2))
  fs.renameSync(tmp, DB_FILE)
}

export const db = () => data

export function nextId(collection) {
  data.counters[collection] = (data.counters[collection] || 0) + 1
  return data.counters[collection]
}
