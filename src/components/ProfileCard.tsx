import { Link } from 'react-router-dom'
import { MapPin, GraduationCap, Shield, Crown } from 'lucide-react'
import type { MatchResultDTO } from '../types'

interface Props {
  match: MatchResultDTO
}

export default function ProfileCard({ match }: Props) {
  const age = match.age ? `${match.age} yrs` : null

  return (
    <Link to={`/profile/${match.profileId}`} className="card overflow-hidden hover:shadow-md transition-shadow block">
      {/* Avatar */}
      <div className="relative h-40 bg-gradient-to-br from-primary-100 to-primary-50">
        {match.avatarUrl ? (
          <img src={match.avatarUrl} alt={match.fullName ?? ''} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-primary-300">
            {match.fullName?.charAt(0) ?? '?'}
          </div>
        )}
        {/* Badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {match.isPremium && (
            <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Crown size={10} /> PRO
            </span>
          )}
          {match.isVerified && (
            <span className="bg-green-500 text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <Shield size={10} /> ✓
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-sm truncate">{match.fullName ?? 'Profile'}</p>
        {age && <p className="text-xs text-gray-500">{age}</p>}
        {match.district && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <MapPin size={10} /> {match.district}
          </p>
        )}
        {match.educationLevel && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            <GraduationCap size={10} /> {match.educationLevel.replace('_', ' ')}
          </p>
        )}
        {/* Match score bar */}
        {match.score > 0 && (
          <div className="mt-2">
            <div className="h-1 bg-gray-100 rounded-full">
              <div
                className="h-1 bg-primary-500 rounded-full"
                style={{ width: `${Math.min(100, (match.score / 98) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-0.5">{match.score}% match</p>
          </div>
        )}
      </div>
    </Link>
  )
}
