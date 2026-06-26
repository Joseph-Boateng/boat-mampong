import { useEffect, useState } from 'react'
import api from '../../api/client'

function StatCard({ label, value, sub, gold }) {
  return (
    <div className="rounded-xl p-5 border" style={{ background: '#1A1A1A', borderColor: gold ? '#3a2d00' : '#2C2C2C' }}>
      <p className="text-xs text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold mt-2" style={{ color: gold ? '#D4AF37' : '#ffffff' }}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
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
    <div className="p-8 text-gray-600">Loading stats…</div>
  )

  const u = stats?.users
  const o = stats?.orders
  const s = stats?.shops
  const r = stats?.riders

  return (
    <div className="p-8">
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#D4AF37' }}>Dashboard</p>
      <h2 className="text-2xl font-bold text-white mb-8">Platform Overview</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={u?.total} sub={`+${u?.new_this_week} this week`} gold />
        <StatCard label="Total Orders" value={o?.total} sub={`+${o?.new_this_week} this week`} />
        <StatCard label="Revenue (GHS)" value={parseFloat(o?.total_revenue || 0).toFixed(2)} sub="delivered orders" gold />
        <StatCard label="Active Shops" value={s?.open} sub={`of ${s?.total} total`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Customers" value={u?.customers} />
        <StatCard label="Vendors" value={u?.vendors} />
        <StatCard label="Riders" value={u?.riders} sub={`${r?.verified} verified`} />
        <StatCard label="Pending Orders" value={o?.pending} gold />
      </div>

      {/* Gold divider */}
      <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)', marginBottom: '2rem' }} />

      <div className="grid grid-cols-2 gap-6">
        <div className="rounded-xl p-6 border" style={{ background: '#1A1A1A', borderColor: '#2C2C2C' }}>
          <h3 className="font-semibold text-white mb-4">Order Status</h3>
          <div className="space-y-3">
            {[
              { label: 'Pending', value: o?.pending, color: '#D4AF37' },
              { label: 'Delivered', value: o?.delivered, color: '#4ade80' },
              { label: 'Cancelled', value: o?.cancelled, color: '#f87171' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full" style={{ background: color }}></span>
                <span className="text-sm text-gray-500 flex-1">{label}</span>
                <span className="text-sm font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl p-6 border" style={{ background: '#1A1A1A', borderColor: '#2C2C2C' }}>
          <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3 text-sm">
            {[
              { href: '/admin/users', label: 'Manage users & roles' },
              { href: '/admin/shops', label: 'Activate or suspend shops' },
              { href: '/admin/riders', label: 'Verify riders' },
              { href: '/admin/orders', label: 'View all orders' },
            ].map(({ href, label }) => (
              <p key={href}>
                <span style={{ color: '#D4AF37' }}>→ </span>
                <a href={href} style={{ color: '#D4AF37' }} className="hover:underline">{label}</a>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
