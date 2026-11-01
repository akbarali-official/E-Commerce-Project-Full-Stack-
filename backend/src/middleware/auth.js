import jwt from 'jsonwebtoken'
import { config } from '../config.js'
import { db } from '../db.js'

export function signToken(user) {
  return jwt.sign({ id: user.id }, config.jwtSecret, { expiresIn: '7d' })
}

export function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, role: u.role }
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Login required' })
  try {
    const payload = jwt.verify(token, config.jwtSecret)
    const user = db().users.find((u) => u.id === payload.id)
    if (!user) return res.status(401).json({ message: 'User not found' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ message: 'Session expired, please login again' })
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
    next()
  })
}
