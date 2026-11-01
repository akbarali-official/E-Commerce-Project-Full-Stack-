import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { db, nextId, save } from '../db.js'
import { signToken, publicUser, requireAuth } from '../middleware/auth.js'

const router = Router()
const emailOk = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

router.post('/register', (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || String(name).trim().length < 2) return res.status(400).json({ message: 'Name kam az kam 2 characters ka ho' })
  if (!emailOk(email)) return res.status(400).json({ message: 'Valid email likho' })
  if (!password || String(password).length < 6) return res.status(400).json({ message: 'Password kam az kam 6 characters ka ho' })

  const mail = String(email).trim().toLowerCase()
  if (db().users.some((u) => u.email === mail)) return res.status(409).json({ message: 'Ye email pehle se registered hai' })

  const user = {
    id: nextId('users'),
    name: String(name).trim(),
    email: mail,
    passwordHash: bcrypt.hashSync(String(password), 10),
    role: 'customer',
    createdAt: new Date().toISOString(),
  }
  db().users.push(user)
  save()
  res.status(201).json({ token: signToken(user), user: publicUser(user) })
})

router.post('/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = db().users.find((u) => u.email === String(email || '').trim().toLowerCase())
  if (!user || !bcrypt.compareSync(String(password || ''), user.passwordHash)) {
    return res.status(401).json({ message: 'Email ya password ghalat hai' })
  }
  res.json({ token: signToken(user), user: publicUser(user) })
})

router.get('/me', requireAuth, (req, res) => res.json({ user: publicUser(req.user) }))

export default router
