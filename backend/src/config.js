import 'dotenv/config'

export const config = {
  port: Number(process.env.PORT) || 5000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@shop.co',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@123',
  deliveryFee: 15,
}

export const PROMO_CODES = {
  SHOP20: { percent: 20, label: '20% off' },
  WELCOME10: { percent: 10, label: '10% off' },
}
