import express from 'express'
import cors from 'cors'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { loadDb } from './db.js'
import { seed } from './seed.js'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import cartRoutes from './routes/cart.js'
import orderRoutes from './routes/orders.js'
import miscRoutes from './routes/misc.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

if (!loadDb()) {
  seed()
  console.log('✔ Database pehli baar bana aur seed ho gaya')
  console.log(`✔ Admin login: ${config.adminEmail} / ${config.adminPassword}`)
}

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))
app.get('/', (req, res) => {
  res.json({message: "E-Commerce Backend API is running successfully!"});
});
app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api', miscRoutes)

app.use('/api', (_req, res) => res.status(404).json({ message: 'API route not found' }))

// Production: frontend/dist ko isi server se serve karo
// const dist = path.join(__dirname, '..', '..', 'frontend', 'dist')
// if (fs.existsSync(dist)) {
  // app.use(express.static(dist))
  // app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))
// }

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Server error' })
})

app.listen(config.port, () => console.log(`🚀 API chal rahi hai: http://localhost:${config.port}`))
export default app;