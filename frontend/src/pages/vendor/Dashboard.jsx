import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import api from '../../api/client'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = ['food', 'groceries', 'pharmacy', 'fashion', 'electronics', 'parcel', 'general']

export default function VendorDashboard() {
  const { user } = useAuth()
  const [shop, setShop] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get('/vendors/my/shop').then((res) => {
      setShop(res.data)
      setForm(res.data)
    })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.put('/vendors/my/shop', form)
      setShop(res.data)
      setEditing(false)
      setMsg('Shop updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setMsg('Failed to save.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>

        {/* Quick links */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <Link to="/vendor/products" className="card p-5 hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-2">📦</div>
            <p className="font-semibold">My Products</p>
            <p className="text-sm text-gray-500">Add & manage items</p>
          </Link>
          <Link to="/vendor/orders" className="card p-5 hover:shadow-md transition-shadow text-center">
            <div className="text-3xl mb-2">📋</div>
            <p className="font-semibold">Incoming Orders</p>
            <p className="text-sm text-gray-500">Manage orders</p>
          </Link>
          <div className="card p-5 text-center">
            <div className="text-3xl mb-2">👤</div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-gray-500">Vendor account</p>
          </div>
        </div>

        {/* Shop profile */}
        {shop && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Shop Profile</h2>
              <div className="flex items-center gap-3">
                {msg && <span className="text-sm text-green-600">{msg}</span>}
                <button
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className="btn-primary text-sm"
                >
                  {editing ? (saving ? 'Saving...' : 'Save Changes') : 'Edit Shop'}
                </button>
                {editing && (
                  <button onClick={() => { setEditing(false); setForm(shop) }} className="btn-secondary text-sm">
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Shop Name</label>
                {editing
                  ? <input className="input" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  : <p className="font-medium">{shop.name}</p>
                }
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Category</label>
                {editing
                  ? <select className="input" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c} value={c} className="capitalize">{c}</option>)}
                    </select>
                  : <p className="font-medium capitalize">{shop.category}</p>
                }
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Phone</label>
                {editing
                  ? <input className="input" value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  : <p className="font-medium">{shop.phone}</p>
                }
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Address</label>
                {editing
                  ? <input className="input" value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="e.g. Market Street, near the junction" />
                  : <p className="font-medium">{shop.address || '—'}</p>
                }
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-600 mb-1">Description</label>
                {editing
                  ? <textarea className="input resize-none" rows={2} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  : <p className="text-gray-700">{shop.description || '—'}</p>
                }
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Shop Status</label>
                {editing
                  ? <select className="input" value={form.is_open ? 'true' : 'false'} onChange={(e) => setForm({ ...form, is_open: e.target.value === 'true' })}>
                      <option value="true">Open</option>
                      <option value="false">Closed</option>
                    </select>
                  : <span className={`badge ${shop.is_open ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {shop.is_open ? '● Open' : '● Closed'}
                    </span>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
