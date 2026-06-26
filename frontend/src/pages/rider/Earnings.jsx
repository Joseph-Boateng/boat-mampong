import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/client'

export default function RiderEarnings() {
  const [earnings, setEarnings] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/riders/earnings'),
      api.get('/riders/deliveries'),
    ]).then(([e, d]) => {
      setEarnings(e.data)
      setDeliveries(d.data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-500">Loading...</div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">My Earnings</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-brand-600">
              GHS {parseFloat(earnings?.today_earned || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Today</p>
            <p className="text-sm font-medium text-gray-700">{earnings?.today_deliveries || 0} deliveries</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-brand-600">
              GHS {parseFloat(earnings?.week_earned || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">This Week</p>
            <p className="text-sm font-medium text-gray-700">{earnings?.week_deliveries || 0} deliveries</p>
          </div>
          <div className="card p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              GHS {parseFloat(earnings?.total_earned || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 mt-1">All Time</p>
            <p className="text-sm font-medium text-gray-700">{earnings?.total_deliveries || 0} deliveries</p>
          </div>
        </div>

        {/* Delivery history */}
        <h2 className="font-semibold mb-3">Delivery History</h2>
        {deliveries.length === 0 ? (
          <div className="text-center py-12 card">
            <div className="text-5xl mb-3">🚲</div>
            <p className="text-gray-500">No deliveries completed yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliveries.map((d) => (
              <div key={d.id} className="card p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{d.shop_name}</p>
                    <p className="text-sm text-gray-500 truncate">→ {d.delivery_address}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {d.delivered_at
                        ? new Date(d.delivered_at).toLocaleString('en-GH')
                        : new Date(d.created_at).toLocaleString('en-GH')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+ GHS {parseFloat(d.delivery_fee).toFixed(2)}</p>
                    <span className={`badge text-xs ${
                      d.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {d.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
