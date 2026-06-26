import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'

const STATUS_STEPS = [
  { key: 'pending',   label: 'Order Placed',      icon: '📋' },
  { key: 'confirmed', label: 'Vendor Confirmed',   icon: '✅' },
  { key: 'ready',     label: 'Ready for Pickup',   icon: '📦' },
  { key: 'picked_up', label: 'Rider Picked Up',    icon: '🚲' },
  { key: 'delivered', label: 'Delivered!',          icon: '🎉' },
]

const STATUS_COLOR = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  ready: 'bg-purple-100 text-purple-800',
  picked_up: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}

export default function OrderTracking() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = () => {
      api.get(`/orders/${id}`).then((res) => {
        setOrder(res.data)
        setLoading(false)
      })
    }
    fetchOrder()
    // Poll every 15 seconds for live updates
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-500">Loading order...</div>
    </div>
  )

  if (!order) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="text-center py-20 text-gray-500">Order not found.</div>
    </div>
  )

  const currentStepIdx = STATUS_STEPS.findIndex((s) => s.key === order.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold">Order Tracking</h1>
          <span className={`badge ${STATUS_COLOR[order.status] || 'bg-gray-100 text-gray-600'}`}>
            {order.status.replace('_', ' ')}
          </span>
        </div>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <div className="card p-6 mb-4">
            <div className="space-y-4">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStepIdx
                const current = i === currentStepIdx
                return (
                  <div key={step.key} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg flex-shrink-0 ${
                      done ? 'bg-brand-500 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {done ? step.icon : '○'}
                    </div>
                    <div>
                      <p className={`font-medium ${done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                      {current && order.status !== 'delivered' && (
                        <p className="text-xs text-brand-600">In progress...</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {order.status === 'cancelled' && (
          <div className="card p-6 mb-4 bg-red-50 border-red-200">
            <p className="text-red-700 font-medium">This order was cancelled.</p>
          </div>
        )}

        {/* Order info */}
        <div className="card p-5 mb-4">
          <h2 className="font-semibold mb-3">From: {order.shop_name}</h2>
          <div className="space-y-2 text-sm">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>{item.quantity}x {item.name}</span>
                <span>GHS {parseFloat(item.line_total).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2 space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span>GHS {parseFloat(order.delivery_fee).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>GHS {parseFloat(order.total).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-5 mb-4">
          <h2 className="font-semibold mb-2">Delivery Address</h2>
          <p className="text-gray-600 text-sm">📍 {order.delivery_address}</p>
          {order.delivery_notes && (
            <p className="text-gray-500 text-sm mt-1">Note: {order.delivery_notes}</p>
          )}
        </div>

        {order.rider_name && (
          <div className="card p-5 mb-4 bg-orange-50 border-orange-200">
            <h2 className="font-semibold mb-1">Your Rider</h2>
            <p className="text-gray-700">🚲 {order.rider_name}</p>
            {order.rider_phone && (
              <a href={`tel:${order.rider_phone}`} className="text-brand-600 text-sm mt-1 block">
                📞 {order.rider_phone}
              </a>
            )}
          </div>
        )}

        <Link to="/shop/orders" className="btn-secondary w-full text-center block">
          ← Back to Orders
        </Link>
      </div>
    </div>
  )
}
