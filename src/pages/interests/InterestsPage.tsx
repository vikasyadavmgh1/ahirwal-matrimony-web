import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, X, Clock, MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { interestsApi } from '../../api/interests'
import type { InterestResponse } from '../../types'
import { formatDistanceToNow } from '../../utils/date'

type Tab = 'received' | 'sent'

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

  const statusBadge = (status: InterestResponse['status']) => {
    const map = {
      PENDING: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      ACCEPTED: 'bg-green-50 text-green-700 border border-green-200',
      DECLINED: 'bg-red-50 text-red-700 border border-red-200',
    }
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status]}`}>{status}</span>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Interests</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-5">
        {(['received', 'sent'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors capitalize ${
              tab === t ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600'
            }`}
          >
            {t} {t === 'received' ? `(${received?.filter((i) => i.status === 'PENDING').length ?? 0})` : ''}
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
          {interests.map((interest) => (
            <div key={interest.id} className="card p-4 flex items-center gap-4">
              {/* Avatar placeholder */}
              <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0 text-primary-600 font-bold">
                {(interest.senderName ?? interest.senderPhone ?? '?').charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {interest.senderName ?? interest.senderPhone ?? 'Unknown'}
                  </p>
                  {statusBadge(interest.status)}
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
                      className="w-8 h-8 rounded-full bg-green-100 hover:bg-green-200 text-green-600 flex items-center justify-center transition-colors"
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
                    to={`/chat`}
                    className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 flex items-center justify-center transition-colors"
                    title="Open chat"
                  >
                    <MessageCircle size={16} />
                  </Link>
                )}
                {tab === 'sent' && interest.status === 'PENDING' && (
                  <button
                    onClick={() => withdrawMut.mutate(interest.id)}
                    className="text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>No {tab} interests yet</p>
        </div>
      )}
    </div>
  )
}
