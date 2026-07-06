import { useEffect, useState } from 'react'
import api from '../../api/client'

const STATUS_COLORS = {
  pending:   'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-700',
  ready:     'bg-purple-100 text-purple-700',
  assigned:  'bg-indigo-100 text-indigo-700',
  picked_up: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const STATUSES = ['pending', 'confirmed', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled']

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  function load() {
    setLoading(true)
    const params = statusFilter ? `?status=${statusFilter}` : ''
    api.get(`/admin/orders${params}`)
      .then(r => setOrders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [statusFilter])

  async function changeStatus(order, status) {
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status })
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status } : o))
    } catch {
      alert('Failed to update status.')
    }
  }

  async function deleteOrder(order) {
    if (!window.confirm(`Delete order ${order.id.slice(0, 8)}…? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/orders/${order.id}`)
      setOrders(prev => prev.filter(o => o.id !== order.id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete order.')
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders ({orders.length})</h2>

      <div className="mb-5">
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
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
                <th className="p-4" colSpan={2}></th>
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
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={e => changeStatus(o, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-xs text-gray-700"
                    >
                      {STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace('_', ' ')}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteOrder(o)}
                      className="text-xs px-3 py-1 rounded font-medium bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-gray-400">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
