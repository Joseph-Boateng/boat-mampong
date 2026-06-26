import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/admin', label: '📊 Overview', end: true },
  { to: '/admin/users', label: '👥 Users' },
  { to: '/admin/shops', label: '🏪 Shops' },
  { to: '/admin/orders', label: '📦 Orders' },
  { to: '/admin/riders', label: '🚲 Riders' },
]

export default function AdminLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#0C0C0C' }}>
      {/* Sidebar */}
      <aside className="w-56 flex flex-col border-r" style={{ background: '#111111', borderColor: '#2C2C2C' }}>
        <div className="p-5 border-b" style={{ borderColor: '#2C2C2C' }}>
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Admin Panel</p>
          <h1 className="text-base font-bold text-white">BOAT</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-dark-900 font-bold'
                    : 'text-gray-500 hover:text-white hover:bg-dark-600'
                }`
              }
              style={({ isActive }) => isActive ? { background: 'linear-gradient(135deg, #B07A12, #C8952C)', color: '#0C0C0C' } : {}}
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t" style={{ borderColor: '#2C2C2C' }}>
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm text-gray-600 hover:text-white transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
