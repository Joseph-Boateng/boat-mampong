import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/client'

export default function RiderDashboard() {
  const [available, setAvailable] = useState([])
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(null)

  const fetchData = async () => {
    try {
      const [availRes, myRes] = await Promise.all([
        api.get('/orders/available'),
        api.get('/orders'),
      ])
      setAvailable(availRes.data)
      // Find the rider's currently active delivery
      const current = myRes.data.find((o) => o.status === 'picked_up')
      setActive(current || null)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleAccept = async (orderId) => {
    setAccepting(orderId)
    try {
      await api.patch(`/orders/${orderId}/accept`)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to accept order.')
    } finally {
      setAccepting(null)
    }
  }

  const handleComplete = async (orderId) => {
    if (!window.confirm('Confirm delivery completed?')) return
    await api.patch(`/orders/${orderId}/status`, { status: 'delivered' })
    fetchData()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Rider Dashboard</h1>

        {/* Active delivery */}
        {active && (
          <div className="card p-5 mb-6 border-2 border-brand-400 bg-orange-50">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🚲</span>
              <h2 className="font-bold text-brand-700">Active Delivery</h2>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Pickup:</strong> {active.shop_name} — {active.shop_address}</p>
              <p><strong>Deliver to:</strong> 📍 {active.delivery_address}</p>
              <p><strong>Customer:</strong> {active.customer_name}</p>
              {active.customer_phone && (
                <a href={`tel:${active.customer_phone}`} className="text-brand-600 block">
                  📞 Call: {active.customer_phone}
                </a>
              )}
              <p><strong>Delivery fee:</strong> GHS {parseFloat(active.delivery_fee).toFixed(2)}</p>
            </div>
            <button
              onClick={() => handleComplete(active.id)}
              className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg w-full"
            >
              ✅ Mark as Delivered
            </button>
          </div>
        )}

        {/* Available deliveries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Available Deliveries</h2>
            <button onClick={fetchData} className="text-sm text-brand-600 hover:underline">Refresh</button>
          </div>

          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : available.length === 0 ? (
            <div className="text-center py-12 card">
              <div className="text-5xl mb-3">🔍</div>
              <p className="text-gray-500">No deliveries available right now.</p>
              <p className="text-sm text-gray-400 mt-1">Check back in a few minutes.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {available.map((order) => (
                <div key={order.id} className="card p-5">
                  <div className="space-y-2 text-sm mb-4">
                    <p><strong>🏪 Pickup:</strong> {order.shop_name}</p>
                    {order.shop_address && <p className="text-gray-500 ml-5">{order.shop_address}</p>}
                    <p><strong>📍 Deliver to:</strong> {order.delivery_address}</p>
                    {order.delivery_notes && (
                      <p className="text-gray-500 text-xs">Note: {order.delivery_notes}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">You earn</p>
                      <p className="text-lg font-bold text-green-600">GHS {parseFloat(order.delivery_fee).toFixed(2)}</p>
                    </div>
                    <button
                      onClick={() => handleAccept(order.id)}
                      disabled={!!active || accepting === order.id}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-semibold py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {accepting === order.id ? 'Accepting...' : 'Accept Delivery'}
                    </button>
                  </div>
                  {active && (
                    <p className="text-xs text-gray-400 mt-2">Complete your current delivery first.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
