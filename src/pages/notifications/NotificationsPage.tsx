import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Heart, MessageCircle, Star, CheckCheck } from 'lucide-react'
import { notificationsApi } from '../../api/notifications'
import type { AppNotification } from '../../types'

function NotifIcon({ type }: { type: AppNotification['type'] }) {
  if (type === 'NEW_MESSAGE') return <MessageCircle size={18} className="text-blue-500" />
  if (type === 'INTEREST_RECEIVED') return <Heart size={18} className="text-rose-500" />
  if (type === 'INTEREST_ACCEPTED') return <Star size={18} className="text-amber-500" />
  return <Bell size={18} className="text-primary-500" />
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationsPage() {
  const qc = useQueryClient()

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getAll().then((r) => r.data.data),
  })

  const markAllMut = useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markReadMut = useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] })
      qc.invalidateQueries({ queryKey: ['notif-count'] })
    },
  })

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-400 font-medium mt-0.5">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMut.mutate()}
            disabled={markAllMut.isPending}
            className="flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !notifications?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Bell size={24} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-700">No notifications yet</p>
          <p className="text-sm text-gray-400">Activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => { if (!n.read) markReadMut.mutate(n.id) }}
              className={`flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-colors ${
                n.read ? 'bg-white border border-gray-100' : 'bg-primary-50 border border-primary-100'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                n.read ? 'bg-gray-100' : 'bg-white shadow-soft'
              }`}>
                <NotifIcon type={n.type} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? 'font-medium text-gray-700' : 'font-bold text-gray-900'}`}>
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.body}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-1.5" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
