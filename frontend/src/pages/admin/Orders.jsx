import { useEffect, useState } from 'react'
import api from '../../api/client'

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  ready: 'bg-purple-100 text-purple-700',
  picked_up: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    const params = statusFilter ? `?status=${statusFilter}` : ''
    api.get(`/admin/orders${params}`)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [statusFilter])

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders</h2>

      <div className="mb-5">
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setLoading(true) }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="ready">Ready</option>
          <option value="picked_up">Picked Up</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Order ID</th>
                <th className="text-left p-4 font-semibold text-gray-600">Customer</th>
                <th className="text-left p-4 font-semibold text-gray-600">Shop</th>
                <th className="text-left p-4 font-semibold text-gray-600">Rider</th>
                <th className="text-left p-4 font-semibold text-gray-600">Total (GHS)</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="text-left p-4 font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 text-gray-400 font-mono text-xs">{o.id.slice(0, 8)}…</td>
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{o.customer_name}</p>
                    <p className="text-xs text-gray-400">{o.customer_phone}</p>
                  </td>
                  <td className="p-4 text-gray-600">{o.shop_name}</td>
                  <td className="p-4 text-gray-600">{o.rider_name || '—'}</td>
                  <td className="p-4 font-semibold">{parseFloat(o.total).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ''}`}>
                      {o.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(o.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
