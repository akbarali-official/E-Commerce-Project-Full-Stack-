import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/ProductCard'
import Rating from '../components/Rating'
import Newsletter from '../components/Newsletter'

export default function ProductDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addItem } = useCart()
  const toast = useToast()

  const [product, setProduct] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [reviews, setReviews] = useState([])
  const [related, setRelated] = useState([])
  const [img, setImg] = useState(0)
  const [color, setColor] = useState(0)
  const [size, setSize] = useState(1)
  const [qty, setQty] = useState(1)
  const [tab, setTab] = useState('reviews')
  const [form, setForm] = useState({ rating: 5, text: '' })
  const [shown, setShown] = useState(6)

  useEffect(() => {
    setProduct(null)
    setNotFound(false)
    setImg(0); setColor(0); setSize(1); setQty(1); setShown(6)
    api(`/products/${id}`)
      .then((p) => {
        setProduct(p)
        api('/products', { params: { category: p.category, limit: 5 } })
          .then((d) => setRelated(d.items.filter((x) => x.id !== p.id).slice(0, 4)))
          .catch(() => {})
      })
      .catch(() => setNotFound(true))
    api(`/products/${id}/reviews`).then(setReviews).catch(() => {})
  }, [id])

  if (notFound) return <div className="container section">Product not found. <Link to="/category"><u>Shop</u></Link></div>
  if (!product) return <div className="container section">Loading...</div>

  const out = product.stock <= 0
  const sizes = product.sizes
  const add = () => {
    addItem(product, { size: sizes[size], color: product.colors[color], qty })
    toast(`${product.name} cart me add ho gaya 🛒`)
  }

  const submitReview = async (e) => {
    e.preventDefault()
    try {
      const r = await api(`/products/${id}/reviews`, { method: 'POST', body: form })
      setReviews([r, ...reviews])
      setForm({ rating: 5, text: '' })
      api(`/products/${id}`).then(setProduct)
      toast('Review submit ho gaya, shukriya!')
    } catch (err) {
      toast(err.message, 'err')
    }
  }

  return (
    <div className="container">
      <div className="breadcrumb">
        <Link to="/">Home</Link> &gt; <Link to="/category">Shop</Link> &gt; <Link to={`/category?category=${product.category}`}>{product.category}</Link> &gt; {product.name}
      </div>
      <div className="pdp-layout">
        <div className="pdp-thumbs">
          {product.images.map((src, i) => (
            <div key={i} className={`pdp-thumb ${img === i ? 'active' : ''}`} onClick={() => setImg(i)}>
              <img src={src} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
        <div className="pdp-main-image">
          <img src={product.images[img]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 20 }} />
        </div>
        <div className="pdp-info">
          <h1>{product.name}</h1>
          <Rating value={product.rating} />
          <div className="pdp-price">
            <span>${product.price}</span>
            {product.oldPrice && <span className="price-old">${product.oldPrice}</span>}
          </div>
          <p className="pdp-desc">{product.description}</p>

          <div className="pdp-section">
            <h5>Select Colors</h5>
            <div className="color-dots">
              {product.colors.map((c, i) => (
                <span key={c} className={`color-dot${color === i ? ' active' : ''}`} style={{ background: c }} onClick={() => setColor(i)} />
              ))}
            </div>
          </div>

          <div className="pdp-section">
            <h5>Choose Size</h5>
            <div className="size-options">
              {sizes.map((s, i) => (
                <span key={s} className={size === i ? 'active' : ''} onClick={() => setSize(i)}>{s}</span>
              ))}
            </div>
          </div>

          <p className="muted" style={{ marginBottom: 12, fontSize: 13 }}>
            {out ? 'Out of stock' : product.stock <= 10 ? `Sirf ${product.stock} bache hain` : 'In stock'}
          </p>
          <div className="pdp-cart-row">
            <div className="qty-control">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock || 1, q + 1))}>+</button>
            </div>
            <button className="btn" onClick={add} disabled={out}>{out ? 'Sold Out' : 'Add to Cart'}</button>
          </div>
        </div>
      </div>

      <div className="tabs">
        <span className={tab === 'details' ? 'active' : ''} onClick={() => setTab('details')}>Product Details</span>
        <span className={tab === 'reviews' ? 'active' : ''} onClick={() => setTab('reviews')}>Rating & Reviews ({reviews.length})</span>
        <span className={tab === 'faqs' ? 'active' : ''} onClick={() => setTab('faqs')}>FAQs</span>
      </div>

      {tab === 'reviews' && (
        <>
          {user ? (
            <form className="review-form" onSubmit={submitReview}>
              <h4>Write a review</h4>
              <div className="star-pick">
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={n <= form.rating ? 'on' : ''} onClick={() => setForm({ ...form, rating: n })}>★</span>
                ))}
              </div>
              <textarea required minLength={3} rows={3} placeholder="Apna tajurba likho..." value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} />
              <button className="btn" type="submit">Submit Review</button>
            </form>
          ) : (
            <p className="muted" style={{ marginBottom: 20 }}><Link to={`/login?next=/product/${id}`}><u>Login</u></Link> karke review likho.</p>
          )}
          <div className="review-grid">
            {reviews.slice(0, shown).map((r) => (
              <div className="review-card" key={r.id}>
                <span className="stars">{'★'.repeat(Math.round(r.rating))}</span>
                <div className="reviewer">{r.name}</div>
                <p>{r.text}</p>
                <div className="review-date">Posted on {new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            ))}
          </div>
          {shown < reviews.length && (
            <div style={{ textAlign: 'center', margin: '40px 0' }}>
              <button className="btn btn-outline" onClick={() => setShown(shown + 6)}>Load More Reviews</button>
            </div>
          )}
        </>
      )}
      {tab === 'details' && (
        <p className="muted" style={{ marginBottom: 30 }}>
          Category: {product.category} · Style: {product.style}. Material: 100% cotton. Machine washable, tumble dry low. Available in multiple colors and sizes.
        </p>
      )}
      {tab === 'faqs' && (
        <p className="muted" style={{ marginBottom: 30 }}>
          Shipping takes 3-5 business days. Returns accepted within 30 days of delivery. Cash on delivery available.
        </p>
      )}

      {related.length > 0 && (
        <>
          <h2 className="section-title">YOU MIGHT ALSO LIKE</h2>
          <div className="product-grid" style={{ marginBottom: 40 }}>
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </>
      )}
      <Newsletter />
    </div>
  )
}
