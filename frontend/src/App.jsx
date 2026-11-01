import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Category from './pages/Category'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Admin from './pages/Admin'
import { useAuth } from './context/AuthContext'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
     window.scrollTo(0, 0)
  }, [pathname])
  
  return null
}

function Protected({ children, admin }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="container section">Loading...</div>
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/category" element={<Category />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/checkout" element={<Protected><Checkout /></Protected>} />
        <Route path="/orders" element={<Protected><Orders /></Protected>} />
        <Route path="/orders/:id" element={<Protected><OrderDetail /></Protected>} />
        <Route path="/admin" element={<Protected admin><Admin /></Protected>} />
        <Route path="*" element={<div className="container section">Page not found.</div>} />
      </Routes>
      <Footer />
    </>
  )
}
