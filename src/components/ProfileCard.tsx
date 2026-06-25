import { Link } from 'react-router-dom'
import { MapPin, GraduationCap, Shield, Crown } from 'lucide-react'
import type { MatchResultDTO } from '../types'


interface Props {
  match: MatchResultDTO
}

export default function ProfileCard({ match }: Props) {
  const age = match.age ? `${match.age} yrs` : null

  return (
    <Link to={`/profile/${match.profileId}`} className="card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 block">
      {/* Avatar */}
      <div className="relative h-44 bg-gradient-to-br from-primary-100 to-primary-50">
        {match.avatarUrl ? (
          <img src={match.avatarUrl} alt={match.fullName ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-primary-200 font-bold">
            {match.fullName?.charAt(0) ?? '?'}
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {match.isPremium && (
            <span className="bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
              <Crown size={9} /> PRO
            </span>
          )}
          {match.isVerified && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
              <Shield size={9} /> ✓
            </span>
          )}
        </div>
        {/* Name on photo */}
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="font-semibold text-white text-sm drop-shadow truncate">{match.fullName ?? 'Profile'}</p>
          {age && <p className="text-white/70 text-xs">{age}</p>}
        </div>
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        {match.district && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <MapPin size={10} className="text-gray-400" /> {match.district}
          </p>
        )}
        {match.educationLevel && (
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <GraduationCap size={10} className="text-gray-400" /> {match.educationLevel.replace('_', ' ')}
          </p>
        )}
        {/* Match score */}
        {match.score > 0 && (
          <div className="pt-1">
            <span className="text-[10px] text-gray-400">{match.score}% match</span>
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
              <div
                className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                style={{ width: `${Math.min(100, (match.score / 98) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
