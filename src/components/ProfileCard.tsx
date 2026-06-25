import { Link } from 'react-router-dom'
import { MapPin, GraduationCap, Shield, Crown, Heart } from 'lucide-react'
import type { MatchResultDTO } from '../types'

interface Props {
  match: MatchResultDTO
}

export default function ProfileCard({ match }: Props) {
  const initial = match.fullName?.charAt(0)?.toUpperCase() ?? '?'

  return (
    <Link
      to={`/profile/${match.profileId}`}
      className="block bg-white rounded-2xl shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Photo */}
      <div className="relative h-52 bg-gradient-to-br from-primary-50 via-rose-50 to-primary-100">
        {match.avatarUrl ? (
          <img src={match.avatarUrl} alt={match.fullName ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-md">
              <span className="text-2xl font-black text-white">{initial}</span>
            </div>
          </div>
        )}

        {/* Badges top-left */}
        <div className="absolute top-2.5 left-2.5 flex gap-1">
          {match.isPremium && (
            <span className="flex items-center gap-0.5 text-[10px] font-black bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full shadow-sm">
              <Crown size={8} /> PRO
            </span>
          )}
          {match.isVerified && (
            <span className="flex items-center gap-0.5 text-[10px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full shadow-sm">
              <Shield size={8} /> Verified
            </span>
          )}
        </div>

        {/* Shortlist heart top-right */}
        <button
          onClick={(e) => e.preventDefault()}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <Heart size={15} className="text-gray-400 hover:text-primary-500" />
        </button>
      </div>

      {/* Info */}
      <div className="px-3.5 pt-3 pb-3.5">
        {/* Name + age */}
        <p className="font-bold text-gray-900 text-sm leading-tight">
          {match.fullName ?? 'Profile'}
          {match.age && <span className="font-normal text-gray-500">, {match.age}</span>}
        </p>

        {/* Location + education */}
        <div className="mt-1.5 space-y-0.5">
          {match.district && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <MapPin size={9} className="text-gray-400 flex-shrink-0" />
              {match.district}
            </p>
          )}
          {match.educationLevel && (
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <GraduationCap size={9} className="text-gray-400 flex-shrink-0" />
              {match.educationLevel.replace(/_/g, ' ')}
            </p>
          )}
        </div>

        {/* Match score */}
        {match.score > 0 && (
          <div className="mt-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Match</span>
              <span className="text-xs font-black text-primary-600">{match.score}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
                style={{ width: `${Math.min(100, match.score)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
