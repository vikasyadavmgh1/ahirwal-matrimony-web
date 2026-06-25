import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MapPin, GraduationCap, Shield, Crown, Heart } from 'lucide-react'
import type { MatchResultDTO } from '../types'
import { shortlistApi } from '../api/shortlist'

interface Props {
  match: MatchResultDTO
}

export default function ProfileCard({ match }: Props) {
  const p = match.profile
  const initial = p.fullName?.charAt(0)?.toUpperCase() ?? '?'
  const [shortlisted, setShortlisted] = useState(false)
  const [slLoading, setSlLoading] = useState(false)

  const handleShortlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (slLoading) return
    setSlLoading(true)
    try {
      if (shortlisted) {
        await shortlistApi.remove(p.id)
        setShortlisted(false)
      } else {
        await shortlistApi.add(p.id)
        setShortlisted(true)
      }
    } catch { /* ignore */ }
    setSlLoading(false)
  }

  return (
    <Link
      to={`/profile/${p.id}`}
      className="block bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Photo */}
      <div className="relative h-52 bg-gradient-to-br from-primary-50 via-rose-50 to-primary-100">
        {p.avatarUrl ? (
          <img src={p.avatarUrl} alt={p.fullName ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
              <span className="text-2xl font-black text-white">{initial}</span>
            </div>
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {p.isPremium && (
            <span className="flex items-center gap-0.5 text-[10px] font-black bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full shadow-sm">
              <Crown size={8} /> PRO
            </span>
          )}
          {p.isVerified && (
            <span className="flex items-center gap-0.5 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
              <Shield size={8} /> Verified
            </span>
          )}
        </div>

        {/* Shortlist heart top-right */}
        <button
          onClick={handleShortlist}
          disabled={slLoading}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors disabled:opacity-60"
        >
          <Heart
            size={15}
            className={shortlisted ? 'text-primary-500 fill-primary-500' : 'text-gray-400'}
          />
        </button>
      </div>

      {/* Info */}
      <div className="px-3.5 pt-3 pb-3.5">
        {/* Name + age */}
        <p className="font-bold text-gray-900 text-sm leading-tight">
          {p.fullName ?? 'Unknown'}
          {p.age > 0 && <span className="font-normal text-gray-500">, {p.age}</span>}
        </p>

        {/* Location + education */}
        <div className="mt-1.5 space-y-0.5">
          {p.nativeDistrict && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={9} className="text-gray-400 flex-shrink-0" />
              {p.nativeDistrict}
            </p>
          )}
          {p.educationLevel && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <GraduationCap size={9} className="text-gray-400 flex-shrink-0" />
              {p.educationLevel.replace(/_/g, ' ')}
            </p>
          )}
        </div>

        {/* Match score */}
        {match.matchScore > 0 && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Match</span>
              <span className="text-xs font-black text-primary-600">{match.matchScore}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                style={{ width: `${Math.min(100, match.matchScore)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
