import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function AdminShops() {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/shops')
      .then(r => setShops(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function toggleShop(shop, field) {
    try {
      const payload = field === 'is_active'
        ? { is_active: !shop.is_active }
        : { is_open: !shop.is_open }
      const res = await api.patch(`/admin/shops/${shop.id}`, payload)
      setShops(prev => prev.map(s => s.id === shop.id ? { ...s, ...res.data } : s))
    } catch {
      alert('Failed to update shop.')
    }
  }

  async function deleteShop(shop) {
    if (!window.confirm(`Delete "${shop.name}"? This will permanently remove the shop, all its products, and associated orders.`)) return
    try {
      await api.delete(`/admin/shops/${shop.id}`)
      setShops(prev => prev.filter(s => s.id !== shop.id))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete shop.')
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shops ({shops.length})</h2>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Shop Name</th>
                <th className="text-left p-4 font-semibold text-gray-600">Owner</th>
                <th className="text-left p-4 font-semibold text-gray-600">Phone</th>
                <th className="text-left p-4 font-semibold text-gray-600">Products</th>
                <th className="text-left p-4 font-semibold text-gray-600">Orders</th>
                <th className="text-left p-4 font-semibold text-gray-600">Open</th>
                <th className="text-left p-4 font-semibold text-gray-600">Active</th>
                <th className="p-4" colSpan={2}></th>
              </tr>
            </thead>
            <tbody>
              {shops.map(s => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.category}</p>
                  </td>
                  <td className="p-4 text-gray-600">{s.owner_name}</td>
                  <td className="p-4 text-gray-600">{s.owner_phone || '—'}</td>
                  <td className="p-4 text-center">{s.product_count}</td>
                  <td className="p-4 text-center">{s.order_count}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleShop(s, 'is_open')}
                      className={`text-xs px-3 py-1 rounded font-medium ${s.is_open ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {s.is_open ? 'Open' : 'Closed'}
                    </button>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {s.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleShop(s, 'is_active')}
                      className={`text-xs px-3 py-1 rounded font-medium ${s.is_active !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {s.is_active !== false ? 'Suspend' : 'Restore'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => deleteShop(s)}
                      className="text-xs px-3 py-1 rounded font-medium bg-red-50 text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {shops.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-gray-400">No shops yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
