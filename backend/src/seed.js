import bcrypt from 'bcryptjs'
import { config } from './config.js'
import { db, loadDb, resetDb, save, nextId } from './db.js'

const SIZES = ['Small', 'Medium', 'Large', 'X-Large']
const DESC =
  'This product is perfect for any occasion. Crafted from a soft and breathable fabric, it offers superior comfort and style.'

// image paths frontend/public/images ke andar hain
const P = (n) => `/images/p${n}.png`

const seedProducts = [
  { name: 'T-shirt with Tape Details', price: 120, oldPrice: null, rating: 4.5, category: 'T-shirts', style: 'Casual', colors: ['#000000', '#3b82f6', '#22c55e'], image: P(1), images: ['/images/detail-1.png', '/images/detail-2.png', '/images/detail-3.png', '/images/detail-4.png'], sold: 90 },
  { name: 'Skinny Fit Jeans', price: 240, oldPrice: 260, rating: 3.5, category: 'Jeans', style: 'Casual', colors: ['#1d4ed8', '#000000'], image: P(2), sold: 120 },
  { name: 'Checkered Shirt', price: 180, oldPrice: null, rating: 4.5, category: 'Shirts', style: 'Casual', colors: ['#ef4444', '#1d4ed8'], image: P(3), sold: 110 },
  { name: 'Sleeve Striped T-shirt', price: 130, oldPrice: 160, rating: 4.5, category: 'T-shirts', style: 'Casual', colors: ['#f97316', '#000000'], image: P(4), sold: 100 },
  { name: 'Vertical Striped Shirt', price: 212, oldPrice: 232, rating: 5.0, category: 'Shirts', style: 'Formal', colors: ['#22c55e', '#3b82f6'], image: P(5), sold: 320 },
  { name: 'Courage Graphic T-shirt', price: 145, oldPrice: null, rating: 4.0, category: 'T-shirts', style: 'Casual', colors: ['#f97316', '#000000'], image: P(6), sold: 290 },
  { name: 'Loose Fit Bermuda Shorts', price: 80, oldPrice: null, rating: 3.0, category: 'Shorts', style: 'Casual', colors: ['#22c55e', '#1d4ed8'], image: P(7), sold: 260 },
  { name: 'Faded Skinny Jeans', price: 210, oldPrice: null, rating: 4.5, category: 'Jeans', style: 'Casual', colors: ['#3b82f6', '#1d4ed8'], image: P(8), sold: 240 },
  { name: 'Loose Fit Bermuda Shorts', price: 80, oldPrice: null, rating: 3.0, category: 'Shorts', style: 'Gym', colors: ['#3b82f6', '#000000'], image: P(9), sold: 60 },
  { name: 'Polo with Contrast Trims', price: 212, oldPrice: 242, rating: 4.0, category: 'T-shirts', style: 'Formal', colors: ['#000000', '#ef4444'], image: P(10), sold: 70 },
  { name: 'Gradient Graphic T-shirt', price: 145, oldPrice: null, rating: 3.5, category: 'T-shirts', style: 'Party', colors: ['#3b82f6', '#a855f7'], image: P(11), sold: 50 },
  { name: 'Polo with Tipping Details', price: 180, oldPrice: null, rating: 4.5, category: 'T-shirts', style: 'Formal', colors: ['#eab308', '#000000'], image: P(12), sold: 80 },
  { name: 'Black Striped T-shirt', price: 120, oldPrice: 150, rating: 3.5, category: 'T-shirts', style: 'Gym', colors: ['#000000', '#ec4899'], image: P(13), sold: 40 },
]

const seedReviews = [
  { name: 'Samantha D.', rating: 5, text: 'Great quality fabric, fits exactly as described. Would definitely order again.' },
  { name: 'Alex M.', rating: 4, text: 'Good product overall, delivery was a bit slow but the item itself is worth it.' },
  { name: 'Ethan R.', rating: 3.5, text: 'Color is slightly different from the photos, but material quality is solid.' },
  { name: 'Olivia P.', rating: 4, text: 'Comfortable and stylish, perfect for everyday wear.' },
  { name: 'Liam K.', rating: 4, text: 'Great fit and comfortable material. Would recommend to friends.' },
  { name: 'Ava H.', rating: 4.5, text: 'Exceeded my expectations, the quality is amazing for the price.' },
]

export function seed() {
  const d = db()
  const now = Date.now()

  d.users.push({
    id: nextId('users'),
    name: 'Admin',
    email: config.adminEmail.toLowerCase(),
    passwordHash: bcrypt.hashSync(config.adminPassword, 10),
    role: 'admin',
    createdAt: new Date(now).toISOString(),
  })

  seedProducts.forEach((p, i) => {
    const id = nextId('products')
    d.products.push({
      id,
      name: p.name,
      description: DESC,
      price: p.price,
      oldPrice: p.oldPrice,
      rating: p.rating,
      reviewCount: seedReviews.length,
      category: p.category,
      style: p.style,
      colors: p.colors,
      sizes: SIZES,
      image: p.image,
      images: p.images && p.images.length ? p.images : [p.image],
      stock: 100,
      sold: p.sold,
      // pehle products sab se naye (New Arrivals)
      createdAt: new Date(now - i * 86400000).toISOString(),
    })
    seedReviews.forEach((r, k) => {
      d.reviews.push({
        id: nextId('reviews'),
        productId: id,
        userId: null,
        name: r.name,
        rating: r.rating,
        text: r.text,
        createdAt: new Date(now - (k + 20) * 86400000).toISOString(),
      })
    })
  })
  save()
}

// `npm run seed` => sab kuch reset karke dobara seed
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  loadDb()
  resetDb()
  seed()
  console.log('Database reset + seeded. Admin:', config.adminEmail)
}
