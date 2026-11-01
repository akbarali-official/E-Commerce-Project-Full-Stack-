import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import ProductCard from '../components/ProductCard'
import Newsletter from '../components/Newsletter'

const brands = ['VERSACE', 'ZARA', 'GUCCI', 'PRADA', 'Calvin Klein']
const styles = [
  { name: 'Casual', img: '/images/casual.png', cls: 'small' },
  { name: 'Formal', img: '/images/formal.png', cls: 'large' },
  { name: 'Party', img: '/images/party.png', cls: 'large' },
  { name: 'Gym', img: '/images/gym.png', cls: 'small' },
]
const reviews = [
  { name: 'Sarah M.', text: "I'm blown away by the quality and style of the clothes I received from Shop.co. From casual wear to elegant dresses, every piece I've bought has exceeded my expectations." },
  { name: 'Alex K.', text: 'Finding clothes that align with my personal style used to be a challenge until I discovered Shop.co. The range of options they offer is truly remarkable, catering to a variety of tastes and occasions.' },
  { name: 'James L.', text: "As someone who's always on the lookout for unique fashion pieces, I'm thrilled to have stumbled upon Shop.co. The selection of clothes is not only diverse but also on-point with the latest trends." },
  { name: 'Mina R.', text: 'Fast delivery and the fabric feels premium. The sizing guide was spot on, I will definitely order again.' },
  { name: 'Hamza N.', text: 'Great prices and the checkout was super smooth. Customer support answered my question within minutes.' },
]

function Section({ title, query, viewAll }) {
  const [items, setItems] = useState(null)
  useEffect(() => {
    api('/products', { params: { ...query, limit: 4 } }).then((d) => setItems(d.items)).catch(() => setItems([]))
  }, [])
  return (
    <section className="section container">
      <h2 className="section-title">{title}</h2>
      {items === null ? (
        <p style={{ textAlign: 'center' }}>Loading...</p>
      ) : (
        <div className="product-grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      )}
      <div className="view-all-wrap"><Link to={viewAll} className="btn btn-outline">View All</Link></div>
    </section>
  )
}

export default function Home() {
  const [start, setStart] = useState(0)
  const shown = [0, 1, 2].map((i) => reviews[(start + i) % reviews.length])

  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            <h1>FIND CLOTHES THAT MATCHES YOUR STYLE</h1>
            <p>
              Browse through our diverse range of meticulously crafted garments, designed
              to bring out your individuality and cater to your sense of style.
            </p>
            <Link to="/category" className="btn">Shop Now</Link>
            <div className="hero-stats">
              <div className="stat"><b>200+</b><span>International Brands</span></div>
              <div className="stat"><b>2,000+</b><span>High-Quality Products</span></div>
              <div className="stat"><b>30,000+</b><span>Happy Customers</span></div>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/hero.png" alt="Hero" />
          </div>
        </div>
      </section>

      <section className="brand-strip">
        <div className="container">{brands.map((b) => <span key={b}>{b}</span>)}</div>
      </section>

      <Section title="NEW ARRIVALS" query={{ sort: 'newest' }} viewAll="/category?sort=newest" />
      <Section title="TOP SELLING" query={{ sort: 'popular' }} viewAll="/category?sort=popular" />

      <section className="section container">
        <div className="dress-style-box">
          <h2 className="section-title">BROWSE BY DRESS STYLE</h2>
          <div className="dress-style-grid">
            {styles.map((s) => (
              <Link key={s.name} to={`/category?style=${s.name}`} className={`dress-card ${s.cls}`}>
                <span className="dress-card-title">{s.name}</span>
                <img src={s.img} alt={s.name} className="dress-card-img" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="customers-section container">
        <div className="customers-header">
          <h2 className="customers-title">OUR HAPPY CUSTOMERS</h2>
          <div className="customers-arrows">
            <button className="arrow-btn" aria-label="Previous" onClick={() => setStart((start - 1 + reviews.length) % reviews.length)}>←</button>
            <button className="arrow-btn" aria-label="Next" onClick={() => setStart((start + 1) % reviews.length)}>→</button>
          </div>
        </div>
        <div className="customers-grid">
          {shown.map((r) => (
            <div className="customer-card" key={r.name}>
              <div className="stars">★★★★★</div>
              <div className="customer-name"><span>{r.name}</span><span className="verified-badge">✓</span></div>
              <p className="customer-review">"{r.text}"</p>
            </div>
          ))}
        </div>
      </section>

      <Newsletter />
    </>
  )
}
