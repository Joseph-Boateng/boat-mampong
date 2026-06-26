import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const { itemCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const dashboardLink = () => {
    if (!user) return '/'
    if (user.role === 'customer') return '/shop'
    if (user.role === 'vendor') return '/vendor'
    if (user.role === 'rider') return '/rider'
    return '/'
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to={dashboardLink()} className="text-xl font-bold text-brand-600 flex items-center gap-2">
          🚲 BOAT Mampong
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:block">
                Hi, {user.name.split(' ')[0]}
              </span>

              {user.role === 'customer' && (
                <>
                  <Link to="/shop" className="text-sm text-gray-700 hover:text-brand-600">Browse</Link>
                  <Link to="/shop/orders" className="text-sm text-gray-700 hover:text-brand-600">Orders</Link>
                  <Link to="/shop/cart" className="relative text-sm font-medium text-gray-700 hover:text-brand-600">
                    🛒 Cart
                    {itemCount > 0 && (
                      <span className="absolute -top-2 -right-3 bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {user.role === 'vendor' && (
                <>
                  <Link to="/vendor" className="text-sm text-gray-700 hover:text-brand-600">Dashboard</Link>
                  <Link to="/vendor/products" className="text-sm text-gray-700 hover:text-brand-600">Products</Link>
                  <Link to="/vendor/orders" className="text-sm text-gray-700 hover:text-brand-600">Orders</Link>
                </>
              )}

              {user.role === 'rider' && (
                <>
                  <Link to="/rider" className="text-sm text-gray-700 hover:text-brand-600">Deliveries</Link>
                  <Link to="/rider/earnings" className="text-sm text-gray-700 hover:text-brand-600">Earnings</Link>
                </>
              )}

              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-700 hover:text-brand-600">Login</Link>
              <Link to="/register" className="btn-primary text-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
