import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    api.get('/admin/products')
      .then(r => setProducts(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function toggleAvailable(product) {
    try {
      const res = await api.patch(`/admin/products/${product.id}`, { is_available: !product.is_available })
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, ...res.data } : p))
    } catch { alert('Failed to update product.') }
  }

  async function deleteProduct(product) {
    if (!window.confirm(`Delete "${product.name}" from ${product.shop_name}? This cannot be undone.`)) return
    try {
      await api.delete(`/admin/products/${product.id}`)
      setProducts(prev => prev.filter(p => p.id !== product.id))
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete product.') }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.shop_name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Products ({filtered.length})</h2>
        <input
          type="text"
          placeholder="Search by name, shop, or category…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-72"
        />
      </div>

      {loading ? <p className="text-gray-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Product</th>
                <th className="text-left p-4 font-semibold text-gray-600">Shop</th>
                <th className="text-left p-4 font-semibold text-gray-600">Category</th>
                <th className="text-left p-4 font-semibold text-gray-600">Price (GHS)</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4" colSpan={2}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{p.name}</p>
                    {p.description && <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>}
                  </td>
                  <td className="p-4 text-gray-600">{p.shop_name}</td>
                  <td className="p-4 text-gray-500">{p.category || '—'}</td>
                  <td className="p-4 font-semibold">{parseFloat(p.price).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {p.is_available ? 'Available' : 'Hidden'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleAvailable(p)}
                      className={`text-xs px-3 py-1 rounded font-medium ${p.is_available ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {p.is_available ? 'Hide' : 'Show'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteProduct(p)} className="text-xs px-3 py-1 rounded font-medium bg-red-50 text-red-700 hover:bg-red-100">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No products found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
