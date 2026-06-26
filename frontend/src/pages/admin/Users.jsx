import { useEffect, useState } from 'react'
import api from '../../api/client'

const ROLE_COLORS = {
  customer: 'bg-blue-100 text-blue-700',
  vendor: 'bg-purple-100 text-purple-700',
  rider: 'bg-green-100 text-green-700',
  admin: 'bg-red-100 text-red-700',
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('')
  const [search, setSearch] = useState('')

  function load() {
    const params = new URLSearchParams()
    if (roleFilter) params.set('role', roleFilter)
    if (search) params.set('search', search)
    api.get(`/admin/users?${params}`)
      .then(r => setUsers(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [roleFilter])

  function handleSearch(e) {
    e.preventDefault()
    load()
  }

  async function toggleActive(user) {
    try {
      const res = await api.patch(`/admin/users/${user.id}`, { is_active: !user.is_active })
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: res.data.is_active } : u))
    } catch {
      alert('Failed to update user.')
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Users</h2>

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-56"
          />
          <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium">Search</button>
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

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
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
                <th className="p-4"></th>
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
                    <button
                      onClick={() => toggleActive(u)}
                      className={`text-xs px-3 py-1 rounded font-medium ${u.is_active !== false ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {u.is_active !== false ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
