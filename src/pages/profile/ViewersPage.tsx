import { useQuery } from '@tanstack/react-query'
import { Eye, ChevronLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { profileApi } from '../../api/profile'
import type { ProfileDTO } from '../../types'

export default function ViewersPage() {
  const navigate = useNavigate()

  const { data: viewers, isLoading } = useQuery({
    queryKey: ['profile-viewers'],
    queryFn: () => profileApi.getViewers().then((r) => r.data.data),
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-5">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-gray-900">Who Viewed Me</h1>
          <p className="text-xs text-gray-400 mt-0.5">Profiles that viewed your profile recently</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : !viewers?.length ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Eye size={24} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-700">No profile views yet</p>
          <p className="text-sm text-gray-400 text-center">When someone views your profile it will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {viewers.map((p: ProfileDTO) => (
            <Link
              key={p.id}
              to={`/profile/${p.id}`}
              className="flex items-center gap-4 card p-4 hover:shadow-card-hover transition-all"
            >
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary-100 flex-shrink-0">
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl font-bold text-primary-300">
                    {p.fullName?.charAt(0) ?? '?'}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 truncate">{p.fullName ?? 'Unknown'}</p>
                <p className="text-sm text-gray-500 truncate">
                  {[p.age && `${p.age} yrs`, p.nativeDistrict].filter(Boolean).join(' · ')}
                </p>
                {p.occupation && (
                  <p className="text-xs text-gray-400 truncate">{p.occupation.replace(/_/g, ' ')}</p>
                )}
              </div>
              <Eye size={16} className="text-gray-300 flex-shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
