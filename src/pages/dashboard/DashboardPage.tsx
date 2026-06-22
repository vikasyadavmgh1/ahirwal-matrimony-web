import { useQuery } from '@tanstack/react-query'
import { Heart, Search, Users, Crown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { profileApi } from '../../api/profile'
import { matchesApi } from '../../api/matches'
import ProfileCard from '../../components/ProfileCard'

export default function DashboardPage() {
  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profileApi.getMyProfile().then((r) => r.data.data),
  })

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => matchesApi.getSuggestions(0, 6).then((r) => r.data.data),
  })

  const profile = profileData

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white mb-6">
        <h1 className="text-xl font-bold">
          Namaste{profile?.fullName ? `, ${profile.fullName.split(' ')[0]}` : ''}! 🙏
        </h1>
        <p className="text-primary-100 text-sm mt-1">
          {profile?.profileCompletePct != null && profile.profileCompletePct < 80
            ? `Complete your profile to get more matches (${profile.profileCompletePct}% done)`
            : 'Here are your best matches today'}
        </p>
        {profile?.profileCompletePct != null && profile.profileCompletePct < 80 && (
          <Link to="/profile" className="mt-3 inline-block bg-white text-primary-600 text-sm font-semibold px-4 py-1.5 rounded-full">
            Complete Profile
          </Link>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          { to: '/matches', icon: Search, label: 'Browse Matches', color: 'bg-blue-50 text-blue-600' },
          { to: '/interests', icon: Heart, label: 'My Interests', color: 'bg-pink-50 text-pink-600' },
          { to: '/shortlist', icon: Users, label: 'Shortlisted', color: 'bg-green-50 text-green-600' },
          { to: '/subscription', icon: Crown, label: 'Go Premium', color: 'bg-yellow-50 text-yellow-600' },
        ].map(({ to, icon: Icon, label, color }) => (
          <Link key={to} to={to} className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow text-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
              <Icon size={20} />
            </div>
            <span className="text-xs font-medium text-gray-700">{label}</span>
          </Link>
        ))}
      </div>

      {/* Suggested matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Suggested for You</h2>
          <Link to="/matches" className="text-sm text-primary-600 font-medium">View all</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-52 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : suggestions?.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {suggestions.map((match) => (
              <ProfileCard key={match.profileId} match={match} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-gray-500">
            <p>Complete your profile to start seeing matches</p>
            <Link to="/profile" className="btn-primary mt-4 inline-block">
              Complete Profile
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
