import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, MapPin, BookHeart } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { shortlistApi } from '../../api/shortlist'

// Gradient combos for avatar backgrounds
const avatarGradients = [
  'bg-gradient-to-br from-pink-400 to-rose-500',
  'bg-gradient-to-br from-violet-400 to-purple-500',
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-emerald-400 to-teal-500',
  'bg-gradient-to-br from-amber-400 to-orange-500',
]

function getAvatarGradient(name: string) {
  return avatarGradients[(name.charCodeAt(0) ?? 0) % 5]
}

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
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2.5 mb-6">
        <h1 className="text-xl font-bold text-gray-900">Shortlisted</h1>
        {data?.length != null && (
          <span className="text-xs font-semibold bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">
            {data.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-44 animate-pulse bg-gray-100 rounded-2xl" />
          ))}
        </div>
      ) : data?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {data.map((entry) => {
            // API returns full ProfileDTO — use entry.id (not profileId), entry.nativeDistrict (not district)
            const initial = entry.fullName?.charAt(0)?.toUpperCase() ?? '?'
            const gradient = getAvatarGradient(entry.fullName ?? '?')
            return (
              <div key={entry.id} className="card rounded-2xl overflow-hidden relative group">
                {/* Remove button */}
                <button
                  onClick={() => removeMut.mutate(entry.id)}
                  className="absolute top-2 right-2 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                  title="Remove from shortlist"
                >
                  <Trash2 size={14} />
                </button>

                {/* Avatar area */}
                <div className={`h-32 flex items-center justify-center ${gradient}`}>
                  {entry.avatarUrl ? (
                    <img
                      src={entry.avatarUrl}
                      alt={entry.fullName ?? ''}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-bold text-3xl">{initial}</span>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <Link
                    to={`/profile/${entry.id}`}
                    className="block font-semibold text-gray-900 text-sm hover:text-primary-600 truncate"
                  >
                    {entry.fullName ?? 'Profile'}
                  </Link>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-2 mt-0.5">
                    {entry.age > 0 && <span>{entry.age} yrs</span>}
                    {entry.nativeDistrict && (
                      <span className="flex items-center gap-0.5">
                        <MapPin size={10} />
                        {entry.nativeDistrict}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center">
            <BookHeart size={24} className="text-rose-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No profiles shortlisted yet</p>
          <p className="text-xs text-gray-400">Save profiles you like to revisit them later</p>
          <Link to="/matches" className="btn-primary mt-2 inline-block text-sm">
            Browse Matches
          </Link>
        </div>
      )}
    </div>
  )
}
