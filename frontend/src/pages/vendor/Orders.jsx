import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import PaymentBadge from '../../components/PaymentBadge'
import api from '../../api/client'

const STATUS_ACTIONS = {
  pending: { next: 'confirmed', label: 'Confirm Order', color: 'bg-blue-500 text-white' },
  confirmed: { next: 'ready', label: 'Mark Ready for Pickup', color: 'bg-purple-500 text-white' },
}

const STATUS_COLOR = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  ready: 'bg-purple-100 text-purple-700',
  picked_up: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function VendorOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('active')

  const fetchOrders = async () => {
    const res = await api.get('/orders')
    setOrders(res.data)
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 20000) // refresh every 20s
    return () => clearInterval(interval)
  }, [])

  const updateStatus = async (orderId, status) => {
    await api.patch(`/orders/${orderId}/status`, { status })
    fetchOrders()
  }

  const activeStatuses = ['pending', 'confirmed', 'ready']
  const filtered = filter === 'active'
    ? orders.filter((o) => activeStatuses.includes(o.status))
    : orders.filter((o) => !activeStatuses.includes(o.status))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('active')}
              className={`btn-secondary text-sm py-1 ${filter === 'active' ? 'bg-brand-50 border-brand-300' : ''}`}
            >Active</button>
            <button
              onClick={() => setFilter('past')}
              className={`btn-secondary text-sm py-1 ${filter === 'past' ? 'bg-brand-50 border-brand-300' : ''}`}
            >Past</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500">{filter === 'active' ? 'No active orders right now.' : 'No past orders.'}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <div key={order.id} className="card p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{order.customer_name}</p>
                    <p className="text-sm text-gray-500">📞 {order.customer_phone}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.created_at).toLocaleString('en-GH')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <PaymentBadge order={order} />
                    <span className={`badge ${STATUS_COLOR[order.status] || ''}`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3 mb-3">
                  <p className="text-sm text-gray-600 font-medium mb-1">Delivery to:</p>
                  <p className="text-sm">📍 {order.delivery_address}</p>
                  {order.delivery_notes && (
                    <p className="text-sm text-gray-500 mt-1">Note: {order.delivery_notes}</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <p className="font-bold text-brand-600">GHS {parseFloat(order.total).toFixed(2)}</p>
                  <div className="flex gap-2">
                    {STATUS_ACTIONS[order.status] && (
                      <button
                        onClick={() => updateStatus(order.id, STATUS_ACTIONS[order.status].next)}
                        className={`text-sm font-medium py-1.5 px-4 rounded-lg ${STATUS_ACTIONS[order.status].color}`}
                      >
                        {STATUS_ACTIONS[order.status].label}
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order.id, 'cancelled')}
                        className="text-sm py-1.5 px-3 rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    )}
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
