import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Clock, MessageCircle, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { interestsApi } from '../../api/interests'
import type { InterestResponse } from '../../types'
import { formatDistanceToNow } from '../../utils/date'

type Tab = 'received' | 'sent'

// Pick one of 5 gradient combos based on name's char code
const avatarGradients = [
  'bg-gradient-to-br from-pink-400 to-rose-500',
  'bg-gradient-to-br from-violet-400 to-purple-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
]

function getAvatarGradient(name: string) {
  return avatarGradients[name.charCodeAt(0) % 5]
}

function StatusBadge({ status }: { status: InterestResponse['status'] }) {
  const map: Record<InterestResponse['status'], string> = {
    PENDING: 'badge badge-pending',
    ACCEPTED: 'badge badge-accepted',
    DECLINED: 'badge badge-declined',
  }
  const labels: Record<InterestResponse['status'], string> = {
    PENDING: 'Pending',
    ACCEPTED: 'Accepted',
    DECLINED: 'Declined',
  }
  return <span className={map[status]}>{labels[status]}</span>
}

export default function InterestsPage() {
  const [tab, setTab] = useState<Tab>('received')
  const qc = useQueryClient()

  const { data: received, isLoading: loadingReceived } = useQuery({
    queryKey: ['interests', 'received'],
    queryFn: () => interestsApi.getReceived().then((r) => r.data.data),
  })

  const { data: sent, isLoading: loadingSent } = useQuery({
    queryKey: ['interests', 'sent'],
    queryFn: () => interestsApi.getSent().then((r) => r.data.data),
  })

  const acceptMut = useMutation({
    mutationFn: (id: string) => interestsApi.acceptInterest(id),
    onSuccess: () => {
      toast.success('Interest accepted! You can now chat.')
      qc.invalidateQueries({ queryKey: ['interests'] })
    },
    onError: () => toast.error('Failed to accept'),
  })

  const declineMut = useMutation({
    mutationFn: (id: string) => interestsApi.declineInterest(id),
    onSuccess: () => {
      toast.success('Interest declined')
      qc.invalidateQueries({ queryKey: ['interests'] })
    },
    onError: () => toast.error('Failed to decline'),
  })

  const withdrawMut = useMutation({
    mutationFn: (id: string) => interestsApi.withdrawInterest(id),
    onSuccess: () => {
      toast.success('Interest withdrawn')
      qc.invalidateQueries({ queryKey: ['interests'] })
    },
    onError: () => toast.error('Failed to withdraw'),
  })

  const interests = tab === 'received' ? received : sent
  const isLoading = tab === 'received' ? loadingReceived : loadingSent
  const pendingCount = received?.filter((i) => i.status === 'PENDING').length ?? 0

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Interests</h1>

      {/* Tabs */}
      <div className="tab-bar mb-5">
        {(['received', 'sent'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`tab-btn capitalize ${tab === t ? 'tab-active' : 'tab-inactive'}`}
          >
            {t === 'received' ? (
              <span className="flex items-center justify-center gap-1.5">
                Received
                {pendingCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary-500 text-white rounded-full">
                    {pendingCount}
                  </span>
                )}
              </span>
            ) : (
              'Sent'
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card h-20 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : interests?.length ? (
        <div className="space-y-3">
          {interests.map((interest) => {
            const displayName = interest.senderName ?? interest.senderPhone ?? 'Unknown'
            const initial = displayName.charAt(0).toUpperCase()
            const isAccepted = interest.status === 'ACCEPTED'
            return (
              <div
                key={interest.id}
                className={`card p-4 flex items-center gap-4 ${
                  isAccepted ? 'border-l-4 border-l-emerald-400' : ''
                }`}
              >
                {/* Colorful avatar */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-lg ${getAvatarGradient(displayName)}`}
                >
                  {initial}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900 text-sm truncate">{displayName}</p>
                    <StatusBadge status={interest.status} />
                  </div>
                  {interest.message && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">"{interest.message}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <Clock size={10} /> {formatDistanceToNow(interest.createdAt)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {tab === 'received' && interest.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => acceptMut.mutate(interest.id)}
                        className="w-8 h-8 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-600 flex items-center justify-center transition-colors"
                        title="Accept"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => declineMut.mutate(interest.id)}
                        className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-200 text-red-500 flex items-center justify-center transition-colors"
                        title="Decline"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {interest.status === 'ACCEPTED' && interest.matchId && (
                    <Link
                      to="/chat"
                      className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
                      title="Open chat"
                    >
                      <MessageCircle size={16} />
                    </Link>
                  )}
                  {tab === 'sent' && interest.status === 'PENDING' && (
                    <button
                      onClick={() => withdrawMut.mutate(interest.id)}
                      className="text-xs text-gray-500 hover:text-red-500 transition-colors font-medium"
                    >
                      Withdraw
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <div className="w-14 h-14 rounded-full bg-pink-50 flex items-center justify-center">
            <Heart size={24} className="text-pink-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No {tab} interests yet</p>
          <p className="text-xs text-gray-400">
            {tab === 'received'
              ? 'When someone sends you interest, it will appear here'
              : 'Browse matches and send interests to connect'}
          </p>
        </div>
      )}
    </div>
  )
}
