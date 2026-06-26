import { Link } from 'react-router-dom'

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
    <div className="min-h-screen">
      {/* Hero */}
      <div style={{background: 'linear-gradient(135deg, #f97316, #c2410c)'}} className="text-white">
        <div className="max-w-5xl mx-auto px-4 py-20 text-center">
          <div className="text-5xl mb-4">🚲</div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            BOAT Mampong
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-xl mx-auto">
            Order from local vendors in your community. Delivered fast by bicycle.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/register" className="bg-white text-brand-600 font-bold py-3 px-8 rounded-xl hover:bg-orange-50 transition-colors">
              Start Ordering
            </Link>
            <Link to="/register?role=vendor" className="bg-brand-600 border-2 border-white text-white font-bold py-3 px-8 rounded-xl hover:bg-brand-700 transition-colors">
              Sell on BOAT Mampong
            </Link>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-center mb-10">How it works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl mb-3">{step.icon}</div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-10">What you can order</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.value}
                to={`/register`}
                className="card p-4 text-center hover:border-brand-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <div className="text-sm font-medium text-gray-700">{cat.label}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Vendor & Rider CTA */}
      <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-8">
        <div className="card p-8 bg-orange-50 border-orange-200">
          <div className="text-4xl mb-4">🏪</div>
          <h3 className="text-xl font-bold mb-2">Are you a vendor?</h3>
          <p className="text-gray-600 mb-4">List your products and start receiving orders from customers in your area.</p>
          <Link to="/register?role=vendor" className="btn-primary inline-block">Register as Vendor</Link>
        </div>
        <div className="card p-8 bg-green-50 border-green-200">
          <div className="text-4xl mb-4">🚲</div>
          <h3 className="text-xl font-bold mb-2">Want to earn money?</h3>
          <p className="text-gray-600 mb-4">Sign up as a rider, accept deliveries nearby, and earn GHS per delivery.</p>
          <Link to="/register?role=rider" className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg inline-block transition-colors">
            Become a Rider
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-8 text-sm">
        <p>© 2026 BOAT Mampong. Built for the people of Mampong, Ghana.</p>
      </footer>
    </div>
  )
}
