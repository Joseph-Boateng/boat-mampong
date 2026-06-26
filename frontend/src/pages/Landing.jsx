import { Link } from 'react-router-dom'
import BOATLogo from '../components/BOATLogo'

const steps = [
  { icon: '🏪', title: 'Browse Local Vendors', desc: 'Find food, groceries, medicine, and more from shops in your area.' },
  { icon: '🛒', title: 'Place Your Order', desc: 'Add items to your cart and checkout in seconds.' },
  { icon: '🚲', title: 'We Deliver Fast', desc: 'A local rider picks up your order and delivers it by bicycle.' },
]

const categories = [
  { icon: '🍛', label: 'Food & Drinks', value: 'food' },
  { icon: '🛒', label: 'Groceries', value: 'groceries' },
  { icon: '💊', label: 'Pharmacy', value: 'pharmacy' },
  { icon: '👗', label: 'Fashion', value: 'fashion' },
  { icon: '📦', label: 'Parcels', value: 'parcel' },
  { icon: '🔌', label: 'Electronics', value: 'electronics' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-dark-900">
      {/* Hero */}
      <div style={{ background: 'radial-gradient(ellipse at center top, #2a1f00 0%, #0C0C0C 60%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-24 text-center">
          <BOATLogo style={{ width: '100%', maxWidth: 480 }} className="mx-auto mb-6" />
          <p className="text-lg text-gray-400 mb-10 max-w-xl mx-auto">
            Order from local vendors in your community. Delivered fast by bicycle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              style={{ background: 'linear-gradient(135deg, #B07A12, #C8952C)', color: '#0C0C0C' }}
              className="font-bold py-3 px-10 rounded-xl hover:opacity-90 transition-opacity text-lg"
            >
              Start Ordering
            </Link>
            <Link
              to="/register?role=vendor"
              className="border border-brand-600 text-brand-400 font-bold py-3 px-10 rounded-xl hover:bg-brand-600 hover:text-black transition-all text-lg"
            >
              Sell on BOAT
            </Link>
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <p style={{ color: '#D4AF37' }} className="text-center text-sm font-semibold uppercase tracking-widest mb-3">How it works</p>
        <h2 className="text-3xl font-bold text-center text-white mb-12">Simple. Fast. Local.</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center bg-dark-700 rounded-2xl p-8 border border-dark-500 hover:border-brand-600 transition-colors">
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="font-bold text-white text-lg mb-2">{step.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gold divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

      {/* Categories */}
      <div className="py-20 bg-dark-800">
        <div className="max-w-5xl mx-auto px-4">
          <p style={{ color: '#D4AF37' }} className="text-center text-sm font-semibold uppercase tracking-widest mb-3">Categories</p>
          <h2 className="text-3xl font-bold text-center text-white mb-12">What you can order</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to="/register"
                className="bg-dark-700 rounded-xl p-5 text-center border border-dark-500 hover:border-brand-500 hover:bg-dark-600 transition-all group"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm font-medium text-gray-400 group-hover:text-brand-400 transition-colors">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Gold divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />

      {/* Vendor & Rider CTA */}
      <div className="max-w-5xl mx-auto px-4 py-20 grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl p-8 border" style={{ background: 'linear-gradient(135deg, #1a1200, #111111)', borderColor: '#3a2d00' }}>
          <div className="text-4xl mb-4">🏪</div>
          <h3 className="text-xl font-bold text-white mb-2">Are you a vendor?</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">List your products and start receiving orders from customers in your area.</p>
          <Link to="/register?role=vendor" className="btn-primary inline-block">Register as Vendor</Link>
        </div>
        <div className="rounded-2xl p-8 border border-dark-500 bg-dark-700">
          <div className="text-4xl mb-4">🚲</div>
          <h3 className="text-xl font-bold text-white mb-2">Want to earn money?</h3>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">Sign up as a rider, accept deliveries nearby, and earn GHS per delivery.</p>
          <Link to="/register?role=rider" className="btn-secondary inline-block">Become a Rider</Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-dark-600 text-center py-8 text-sm text-gray-600">
        <BOATLogo style={{ width: 180 }} className="mx-auto mb-2" />
        <p>© 2026 Built for the people of Mampong, Ghana.</p>
      </footer>
    </div>
  )
}
