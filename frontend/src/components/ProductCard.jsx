import { Link } from 'react-router-dom'
import Rating from './Rating'

export default function ProductCard({ product }) {
  const off = product.oldPrice ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) : 0
  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-thumb">
        <img src={product.image} alt={product.name} loading="lazy" />
        {product.stock <= 0 && <span className="soldout">Sold out</span>}
      </div>
      <h4 className="product-name">{product.name}</h4>
      <Rating value={product.rating} />
      <div className="price-row">
        <span>${product.price}</span>
        {product.oldPrice && <span className="price-old">${product.oldPrice}</span>}
        {off > 0 && <span className="discount-badge">-{off}%</span>}
      </div>
    </Link>
  )
}
