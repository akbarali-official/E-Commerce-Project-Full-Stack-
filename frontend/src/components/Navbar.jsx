import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [q, setQ] = useState('')
  const { user, logout } = useAuth()
  const { count } = useCart()
  const navigate = useNavigate()

  const close = () => {
    setIsOpen(false)
    setMenu(false)
  }
  const onSearch = (e) => {
    e.preventDefault()
    close()
    navigate(q.trim() ? `/category?search=${encodeURIComponent(q.trim())}` : '/category')
  }

  return (
    <>
      <div className="topbar">
        Sign up and get 20% off your first order — use code <b>SHOP20</b>{' '}
        {!user && <Link to="/login">Sign Up Now</Link>}
      </div>
      <header className="navbar">
        <div className="container">
          <Link to="/" className="logo" onClick={close}>SHOP.CO</Link>

          <button className="hamburger" onClick={() => setIsOpen(!isOpen)} aria-label="Menu">
            {isOpen ? '✕' : '☰'}
          </button>

          <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
            <li><Link to="/category" onClick={close}>Shop</Link></li>
            <li><Link to="/category?sale=1" onClick={close}>On Sale</Link></li>
            <li><Link to="/category?sort=newest" onClick={close}>New Arrivals</Link></li>
            <li><Link to="/category?sort=popular" onClick={close}>Top Selling</Link></li>
          </ul>

          <form className="nav-search" onSubmit={onSearch}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search for products..." />
          </form>

          <div className="nav-icons">
            <Link to="/cart" className="cart-link" onClick={close} aria-label="Cart">
              🛒{count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
            {user ? (
              <div className="user-menu">
                <button className="user-btn" onClick={() => setMenu(!menu)}>👤 <small>{user.name.split(' ')[0]}</small></button>
                {menu && (
                  <div className="user-dropdown">
                    <Link to="/orders" onClick={close}>My Orders</Link>
                    {user.role === 'admin' && <Link to="/admin" onClick={close}>Admin Panel</Link>}
                    <button onClick={() => { logout(); close(); navigate('/') }}>Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" onClick={close} aria-label="Login">👤</Link>
            )}
          </div>
        </div>
      </header>
    </>
  )
}
