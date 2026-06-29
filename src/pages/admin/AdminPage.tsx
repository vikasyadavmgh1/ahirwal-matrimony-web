import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Users, Crown, ShieldAlert, UserCheck, Ban, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { adminApi } from '../../api/admin'
import { formatDistanceToNow } from '../../utils/date'

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 flex-shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-black text-gray-900">{value.toLocaleString()}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
      </div>
    </div>
  )
}

type Tab = 'reports' | 'users'

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('reports')
  const [userSearch, setUserSearch] = useState('')
  const qc = useQueryClient()

  const { data: dashboard } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboard().then((r) => r.data.data),
  })

  const { data: reports = [], isLoading: loadingReports } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: () => adminApi.getPendingReports().then((r) => r.data.data),
    enabled: tab === 'reports',
  })

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-users', userSearch],
    queryFn: () => adminApi.getUsers(userSearch || undefined).then((r) => r.data.data),
    enabled: tab === 'users',
  })

  const reportActionMut = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'DISMISSED' | 'ACTIONED' }) =>
      adminApi.actionReport(id, action),
    onSuccess: () => {
      toast.success('Report updated')
      qc.invalidateQueries({ queryKey: ['admin-reports'] })
    },
    onError: () => toast.error('Action failed'),
  })

  const banMut = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      adminApi.banUser(id, banned),
    onSuccess: (_, { banned }) => {
      toast.success(banned ? 'User banned' : 'User unbanned')
      qc.invalidateQueries({ queryKey: ['admin-users'] })
    },
    onError: () => toast.error('Action failed'),
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
          <ShieldAlert size={18} className="text-red-600" />
        </div>
        <h1 className="text-xl font-black text-gray-900">Admin Panel</h1>
      </div>

      {/* Stats */}
      {dashboard && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={<Users size={18} />} label="Total Users" value={dashboard.totalUsers} />
          <StatCard icon={<UserCheck size={18} />} label="Active Profiles" value={dashboard.activeProfiles} />
          <StatCard icon={<Crown size={18} />} label="Premium" value={dashboard.premiumCount} />
          <StatCard icon={<ShieldAlert size={18} />} label="New Today" value={dashboard.newRegistrationsToday} />
        </div>
      )}

      {/* Tabs */}
      <div className="tab-bar mb-5">
        {(['reports', 'users'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-btn capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Reports tab */}
      {tab === 'reports' && (
        loadingReports ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-16 animate-pulse bg-gray-100" />)}
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Check size={32} className="mx-auto mb-2 text-green-400" />
            <p className="font-medium">No pending reports</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{r.reason}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDistanceToNow(r.createdAt)}</p>
                </div>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  {r.status}
                </span>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => reportActionMut.mutate({ id: r.id, action: 'ACTIONED' })}
                    className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition-colors"
                    title="Action (ban user)"
                  >
                    <Ban size={14} />
                  </button>
                  <button
                    onClick={() => reportActionMut.mutate({ id: r.id, action: 'DISMISSED' })}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Users tab */}
      {tab === 'users' && (
        <>
          <input
            type="search"
            placeholder="Search by phone or email…"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="input-field mb-4"
          />
          {loadingUsers ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <div key={i} className="card h-14 animate-pulse bg-gray-100" />)}
            </div>
          ) : users.length === 0 ? (
            <p className="text-center py-10 text-gray-400 text-sm">No users found</p>
          ) : (
            <div className="space-y-2">
              {users.map((u) => (
                <div key={u.id} className="card p-4 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{u.phone}</p>
                    {u.email && <p className="text-xs text-gray-400">{u.email}</p>}
                  </div>
                  {u.isBanned && (
                    <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Banned</span>
                  )}
                  {!u.isActive && !u.isBanned && (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactive</span>
                  )}
                  <button
                    onClick={() => banMut.mutate({ id: u.id, banned: !u.isBanned })}
                    className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                      u.isBanned
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-red-100 text-red-600 hover:bg-red-200'
                    }`}
                  >
                    {u.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
