import { useEffect, useState } from 'react'
import api from '../../api/client'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-3xl font-bold mt-1 ${color || 'text-gray-800'}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminOverview() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="p-8 text-gray-500">Loading stats…</div>
  )

  const u = stats?.users
  const o = stats?.orders
  const s = stats?.shops
  const r = stats?.riders

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Platform Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={u?.total} sub={`+${u?.new_this_week} this week`} color="text-blue-600" />
        <StatCard label="Total Orders" value={o?.total} sub={`+${o?.new_this_week} this week`} color="text-orange-500" />
        <StatCard label="Revenue (GHS)" value={parseFloat(o?.total_revenue || 0).toFixed(2)} sub="delivered orders" color="text-green-600" />
        <StatCard label="Active Shops" value={s?.open} sub={`of ${s?.total} total`} color="text-purple-600" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Customers" value={u?.customers} />
        <StatCard label="Vendors" value={u?.vendors} />
        <StatCard label="Riders" value={u?.riders} sub={`${r?.verified} verified`} />
        <StatCard label="Pending Orders" value={o?.pending} color="text-yellow-600" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Order Status Breakdown</h3>
          <div className="space-y-2">
            {[
              { label: 'Pending', value: o?.pending, color: 'bg-yellow-400' },
              { label: 'Delivered', value: o?.delivered, color: 'bg-green-400' },
              { label: 'Cancelled', value: o?.cancelled, color: 'bg-red-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className={`w-3 h-3 rounded-full ${color}`}></span>
                <span className="text-sm text-gray-600 flex-1">{label}</span>
                <span className="text-sm font-semibold">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-700 mb-3">Quick Actions</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>→ <a href="/admin/users" className="text-orange-500 hover:underline">Manage users & roles</a></p>
            <p>→ <a href="/admin/shops" className="text-orange-500 hover:underline">Activate or suspend shops</a></p>
            <p>→ <a href="/admin/riders" className="text-orange-500 hover:underline">Verify riders</a></p>
            <p>→ <a href="/admin/orders" className="text-orange-500 hover:underline">View all orders</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
