import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'

const CATEGORIES = [
  { value: '', label: '🌍 All', },
  { value: 'food', label: '🍛 Food' },
  { value: 'groceries', label: '🛒 Groceries' },
  { value: 'pharmacy', label: '💊 Pharmacy' },
  { value: 'fashion', label: '👗 Fashion' },
  { value: 'parcel', label: '📦 Parcels' },
  { value: 'general', label: '🏪 General' },
]

export default function CustomerHome() {
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true)
      try {
        const params = {}
        if (category) params.category = category
        if (search) params.search = search
        const res = await api.get('/vendors', { params })
        setVendors(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    const timer = setTimeout(fetchVendors, 300)
    return () => clearTimeout(timer)
  }, [search, category])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Search bar */}
      <div className="bg-brand-500 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-white text-2xl font-bold mb-4">What do you need today?</h1>
          <input
            type="text"
            className="w-full rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
            placeholder="Search vendors or items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.value
                  ? 'bg-brand-500 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:border-brand-300'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vendor grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading vendors...</div>
        ) : vendors.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-3">🏪</div>
            <p>No vendors found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/shop/vendor/${vendor.id}`}
                className="card hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="h-36 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  {vendor.image_url
                    ? <img src={vendor.image_url} alt={vendor.name} className="h-full w-full object-cover" />
                    : <span className="text-5xl">🏪</span>
                  }
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">{vendor.name}</h3>
                    <span className={`badge ${vendor.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {vendor.is_open ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  {vendor.description && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-2">{vendor.description}</p>
                  )}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span className="capitalize">{vendor.category}</span>
                    <span>{vendor.product_count} item{vendor.product_count !== 1 ? 's' : ''}</span>
                  </div>
                  {vendor.address && (
                    <p className="text-xs text-gray-400 mt-1 truncate">📍 {vendor.address}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
