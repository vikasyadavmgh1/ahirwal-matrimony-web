import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { shortlistApi } from '../../api/shortlist'

export default function ShortlistPage() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['shortlist'],
    queryFn: () => shortlistApi.getAll().then((r) => r.data.data),
  })

  const removeMut = useMutation({
    mutationFn: (profileId: string) => shortlistApi.remove(profileId),
    onSuccess: () => {
      toast.success('Removed from shortlist')
      qc.invalidateQueries({ queryKey: ['shortlist'] })
    },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">
        Shortlisted ({data?.length ?? 0})
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
        </div>
      ) : data?.length ? (
        <div className="space-y-3">
          {data.map((entry) => (
            <div key={entry.profileId} className="card p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary-100 flex-shrink-0 overflow-hidden">
                {entry.avatarUrl
                  ? <img src={entry.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-primary-600 font-bold">
                      {entry.fullName?.charAt(0) ?? '?'}
                    </div>
                }
              </div>
              <div className="flex-1 min-w-0">
                <Link to={`/profile/${entry.profileId}`} className="font-medium text-gray-900 hover:text-primary-600 text-sm">
                  {entry.fullName ?? 'Profile'}
                </Link>
                <div className="text-xs text-gray-500 flex gap-3 mt-0.5">
                  {entry.age && <span>{entry.age} yrs</span>}
                  {entry.district && <span className="flex items-center gap-0.5"><MapPin size={10} />{entry.district}</span>}
                </div>
              </div>
              <button
                onClick={() => removeMut.mutate(entry.profileId)}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-500">
          <p>No profiles shortlisted yet</p>
          <Link to="/matches" className="btn-primary mt-4 inline-block">Browse Matches</Link>
        </div>
      )}
    </div>
  )
}
