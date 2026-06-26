import { useEffect, useState } from 'react'
import api from '../../api/client'

export default function AdminRiders() {
  const [riders, setRiders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/riders')
      .then(r => setRiders(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  async function toggleVerify(rider) {
    try {
      await api.patch(`/admin/riders/${rider.id}/verify`, { is_verified: !rider.is_verified })
      setRiders(prev => prev.map(r => r.id === rider.id ? { ...r, is_verified: !r.is_verified } : r))
    } catch {
      alert('Failed to update rider.')
    }
  }

  async function toggleActive(rider) {
    try {
      const res = await api.patch(`/admin/users/${rider.id}`, { is_active: !rider.is_active })
      setRiders(prev => prev.map(r => r.id === rider.id ? { ...r, is_active: res.data.is_active } : r))
    } catch {
      alert('Failed to update rider.')
    }
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Riders ({riders.length})</h2>

      {loading ? (
        <p className="text-gray-500">Loading…</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left p-4 font-semibold text-gray-600">Rider</th>
                <th className="text-left p-4 font-semibold text-gray-600">Phone</th>
                <th className="text-left p-4 font-semibold text-gray-600">Area</th>
                <th className="text-left p-4 font-semibold text-gray-600">Bicycle</th>
                <th className="text-left p-4 font-semibold text-gray-600">Deliveries</th>
                <th className="text-left p-4 font-semibold text-gray-600">Earned (GHS)</th>
                <th className="text-left p-4 font-semibold text-gray-600">Verified</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {riders.map(r => (
                <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{r.name}</p>
                    <p className="text-xs text-gray-400">{r.email}</p>
                  </td>
                  <td className="p-4 text-gray-600">{r.phone || '—'}</td>
                  <td className="p-4 text-gray-600">{r.area_covered || '—'}</td>
                  <td className="p-4 text-gray-600">{r.bicycle_type || '—'}</td>
                  <td className="p-4 text-center font-semibold">{r.total_deliveries}</td>
                  <td className="p-4 font-semibold text-green-600">{parseFloat(r.total_earned || 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.is_verified ? 'Verified' : 'Unverified'}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleVerify(r)}
                      className={`text-xs px-3 py-1 rounded font-medium ${r.is_verified ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                    >
                      {r.is_verified ? 'Unverify' : 'Verify'}
                    </button>
                  </td>
                </tr>
              ))}
              {riders.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-gray-400">No riders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
