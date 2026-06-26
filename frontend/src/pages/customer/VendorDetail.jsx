import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { useCart } from '../../context/CartContext'
import api from '../../api/client'

export default function VendorDetail() {
  const { id } = useParams()
  const { addToCart, cart, itemCount } = useCart()
  const [vendor, setVendor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [added, setAdded] = useState({})

  useEffect(() => {
    api.get(`/vendors/${id}`).then((res) => {
      setVendor(res.data)
      setLoading(false)
    })
  }, [id])

  const handleAdd = (product) => {
    addToCart(product, id)
    setAdded((prev) => ({ ...prev, [product.id]: true }))
    setTimeout(() => setAdded((prev) => ({ ...prev, [product.id]: false })), 800)
  }

  const getQtyInCart = (productId) => {
    const item = cart.find((i) => i.product.id === productId)
    return item ? item.quantity : 0
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-500">Loading...</div>
    </div>
  )

  if (!vendor) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-500">Vendor not found.</div>
    </div>
  )

  // Group products by category
  const grouped = vendor.products.reduce((acc, p) => {
    const cat = p.category || 'Other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(p)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Vendor header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <div className="w-16 h-16 bg-orange-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
            🏪
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{vendor.name}</h1>
            {vendor.description && <p className="text-gray-600 text-sm">{vendor.description}</p>}
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              {vendor.address && <span>📍 {vendor.address}</span>}
              <span className={`badge ${vendor.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {vendor.is_open ? '● Open' : '● Closed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {vendor.products.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-4xl mb-3">🍽️</p>
            <p>No products listed yet.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([category, products]) => (
            <div key={category} className="mb-8">
              <h2 className="text-lg font-semibold text-gray-800 mb-3 capitalize">{category}</h2>
              <div className="space-y-3">
                {products.map((product) => {
                  const qty = getQtyInCart(product.id)
                  return (
                    <div key={product.id} className="card p-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="object-cover w-full h-full" />
                          : <span className="text-2xl">🍽️</span>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium">{product.name}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-500 truncate">{product.description}</p>
                        )}
                        <p className="text-brand-600 font-semibold mt-1">GHS {parseFloat(product.price).toFixed(2)}</p>
                      </div>
                      <button
                        onClick={() => handleAdd(product)}
                        disabled={!vendor.is_open}
                        className={`flex-shrink-0 w-9 h-9 rounded-full font-bold text-lg flex items-center justify-center transition-all ${
                          added[product.id]
                            ? 'bg-green-500 text-white'
                            : qty > 0
                            ? 'bg-brand-500 text-white'
                            : 'bg-brand-100 text-brand-600 hover:bg-brand-500 hover:text-white'
                        } disabled:opacity-40`}
                      >
                        {added[product.id] ? '✓' : qty > 0 ? qty : '+'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating cart button */}
      {itemCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center px-4">
          <Link
            to="/shop/cart"
            className="bg-brand-500 text-white px-6 py-4 rounded-xl shadow-lg font-semibold flex items-center gap-3 hover:bg-brand-600 transition-colors"
          >
            <span className="bg-white text-brand-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              {itemCount}
            </span>
            View Cart
          </Link>
        </div>
      )}
    </div>
  )
}
