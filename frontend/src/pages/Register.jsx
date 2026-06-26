import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roles = [
  { value: 'customer', label: '🛒 Customer', desc: 'I want to order from local vendors' },
  { value: 'vendor', label: '🏪 Vendor', desc: 'I want to sell my products' },
  { value: 'rider', label: '🚲 Rider', desc: 'I want to deliver orders and earn' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    role: params.get('role') || 'customer',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      const user = await register(form)
      if (user.role === 'customer') navigate('/shop')
      else if (user.role === 'vendor') navigate('/vendor')
      else if (user.role === 'rider') navigate('/rider')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8" style={{ background: 'radial-gradient(ellipse at center top, #1a1200 0%, #0C0C0C 70%)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold" style={{ color: '#D4AF37' }}>🚲 BOAT</Link>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>

        <div className="bg-dark-700 rounded-2xl p-8 border border-dark-500" style={{ boxShadow: '0 0 40px rgba(212,175,55,0.05)' }}>
          {/* Role selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-400 mb-3">I am joining as</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  className={`p-3 rounded-xl border-2 text-center transition-all ${
                    form.role === r.value
                      ? 'border-yellow-500 bg-dark-600'
                      : 'border-dark-400 hover:border-dark-300'
                  }`}
                >
                  <div className="text-xl">{r.label.split(' ')[0]}</div>
                  <div className="text-xs font-medium mt-1 text-gray-400">{r.label.split(' ')[1]}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              {roles.find((r) => r.value === form.role)?.desc}
            </p>
          </div>

          {error && (
            <div className="bg-red-900 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input type="text" className="input" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Kwame Mensah" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
              <input type="email" className="input" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="kwame@email.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone (Ghana)</label>
              <input type="tel" className="input" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="0241234567" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Password</label>
              <input type="password" className="input" value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 6 characters" required />
            </div>
            <button type="submit" className="btn-primary w-full py-3" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#D4AF37' }} className="font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
