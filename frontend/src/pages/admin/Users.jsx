import { useEffect, useState } from 'react'
import api from '../../api/client'

const ROLE_COLORS = {
  customer: 'bg-blue-100 text-blue-700',
  vendor:   'bg-purple-100 text-purple-700',
  rider:    'bg-green-100 text-green-700',
  admin:    'bg-red-100 text-red-700',
}

const EMPTY_FORM = { name: '', email: '', phone: '', password: '', role: 'customer' }

export default function AdminUsers() {
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch]       = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editTarget, setEditTarget] = useState(null)  // null = create mode, user obj = edit mode
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const [saving, setSaving]       = useState(false)

  function load() {
    setLoading(true)
    const params = new URLSearchParams()
    if (roleFilter) params.set('role', roleFilter)
    if (search)     params.set('search', search)
    api.get(`/admin/users?${params}`)
      .then(r => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [roleFilter])

  function handleSearch(e) { e.preventDefault(); load() }

  function openCreate() {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setFormError('')
    setShowModal(true)
  }

  function openEdit(user) {
    setEditTarget(user)
    setForm({ name: user.name, email: user.email, phone: user.phone || '', password: '', role: user.role })
    setFormError('')
    setShowModal(true)
  }

  async function toggleActive(user) {
    try {
      const res = await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...res.data } : u))
    } catch { alert('Failed to update user.') }
  }

  async function deleteUser(user) {
    if (!window.confirm(`Delete "${user.name}"? This will permanently remove their account and all associated data.`)) return
    try {
      await api.delete(`/admin/users/${user.id}`)
      setUsers(prev => prev.filter(u => u.id !== user.id))
    } catch (err) { alert(err.response?.data?.error || 'Failed to delete user.') }
  }

  async function submitForm(e) {
    e.preventDefault()
    setFormError('')
    setSaving(true)
    try {
      if (editTarget) {
        const payload = { name: form.name, email: form.email, phone: form.phone, role: form.role }
        const res = await api.patch(`/admin/users/${editTarget.id}`, payload)
        setUsers(prev => prev.map(u => u.id === editTarget.id ? { ...u, ...res.data } : u))
      } else {
        const res = await api.post('/admin/users', form)
        setUsers(prev => [res.data, ...prev])
      }
      setShowModal(false)
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save user.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Users ({users.length})</h2>
        <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">
          + Add User
        </button>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56"
          />
          <button type="submit" className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium">Search</button>
        </form>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All roles</option>
          <option value="customer">Customers</option>
          <option value="vendor">Vendors</option>
          <option value="rider">Riders</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      {loading ? <p className="text-gray-500">Loading…</p> : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Name</th>
                <th className="text-left p-4 font-semibold text-gray-600">Email</th>
                <th className="text-left p-4 font-semibold text-gray-600">Phone</th>
                <th className="text-left p-4 font-semibold text-gray-600">Role</th>
                <th className="text-left p-4 font-semibold text-gray-600">Joined</th>
                <th className="text-left p-4 font-semibold text-gray-600">Status</th>
                <th className="p-4" colSpan={3}></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{u.name}</td>
                  <td className="p-4 text-gray-600">{u.email}</td>
                  <td className="p-4 text-gray-600">{u.phone || '—'}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {u.is_active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => openEdit(u)} className="text-xs px-3 py-1 rounded font-medium bg-blue-50 text-blue-700 hover:bg-blue-100">
                      Edit
                    </button>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleActive(u)}
                      className={`text-xs px-3 py-1 rounded font-medium ${u.is_active !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {u.is_active !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                  <td className="p-4">
                    <button onClick={() => deleteUser(u)} className="text-xs px-3 py-1 rounded font-medium bg-red-50 text-red-700 hover:bg-red-100">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={9} className="p-8 text-center text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editTarget ? `Edit ${editTarget.name}` : 'Add New User'}</h3>
            <form onSubmit={submitForm} className="space-y-3">
              <input
                placeholder="Full Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              <input
                placeholder="Phone (optional)"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              />
              {!editTarget && (
                <input
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              )}
              <select
                value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="customer">Customer</option>
                <option value="vendor">Vendor</option>
                <option value="rider">Rider</option>
                <option value="admin">Admin</option>
              </select>
              {formError && <p className="text-red-500 text-sm">{formError}</p>}
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {saving ? 'Saving…' : editTarget ? 'Save Changes' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
