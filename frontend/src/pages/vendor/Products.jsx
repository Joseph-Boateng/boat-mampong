import { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import api from '../../api/client'

const emptyForm = { name: '', description: '', price: '', category: '', image_url: '' }

export default function VendorProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [editId, setEditId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchProducts = async () => {
    try {
      const shop = await api.get('/vendors/my/shop')
      const res = await api.get(`/products?shop_id=${shop.data.id}`)
      setProducts(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.price) return setError('Name and price are required.')
    setSaving(true)
    try {
      if (editId) {
        await api.put(`/products/${editId}`, form)
      } else {
        await api.post('/products', form)
      }
      setForm(emptyForm)
      setEditId(null)
      setShowForm(false)
      fetchProducts()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (product) => {
    setEditId(product.id)
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      image_url: product.image_url || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return
    await api.delete(`/products/${id}`)
    fetchProducts()
  }

  const handleToggle = async (product) => {
    await api.put(`/products/${product.id}`, { is_available: !product.is_available })
    fetchProducts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Products</h1>
          <button
            onClick={() => { setShowForm(true); setForm(emptyForm); setEditId(null) }}
            className="btn-primary"
          >
            + Add Product
          </button>
        </div>

        {/* Add/Edit form */}
        {showForm && (
          <div className="card p-6 mb-6">
            <h2 className="font-semibold mb-4">{editId ? 'Edit Product' : 'New Product'}</h2>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded mb-3 text-sm">{error}</div>}
            <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Product Name *</label>
                <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jollof Rice" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Price (GHS) *</label>
                <input type="number" step="0.01" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="15.00" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                <input className="input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g. Main Dish, Drinks" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Image URL (optional)</label>
                <input className="input" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the product..." />
              </div>
              <div className="md:col-span-2 flex gap-3">
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? 'Saving...' : editId ? 'Save Changes' : 'Add Product'}
                </button>
                <button type="button" onClick={() => { setShowForm(false); setEditId(null) }} className="btn-secondary">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Product list */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-gray-500">No products yet. Add your first product above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className={`card p-4 flex items-center gap-4 ${!product.is_available ? 'opacity-60' : ''}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{product.name}</p>
                    {!product.is_available && <span className="badge bg-gray-100 text-gray-500">Hidden</span>}
                  </div>
                  {product.description && <p className="text-sm text-gray-500 truncate">{product.description}</p>}
                  {product.category && <p className="text-xs text-gray-400">{product.category}</p>}
                </div>
                <p className="font-bold text-brand-600 flex-shrink-0">GHS {parseFloat(product.price).toFixed(2)}</p>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => handleToggle(product)} className="text-xs btn-secondary py-1 px-2">
                    {product.is_available ? 'Hide' : 'Show'}
                  </button>
                  <button onClick={() => handleEdit(product)} className="text-xs btn-secondary py-1 px-2">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="text-xs text-red-600 border border-red-200 rounded-lg py-1 px-2 hover:bg-red-50">Del</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
