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
  const firstName = profile?.fullName?.split(' ')[0] ?? ''
  const completePct = profile?.profileCompletePct ?? 0

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Welcome banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 rounded-2xl p-6 text-white mb-6">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 right-16 w-52 h-52 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-2 right-28 w-16 h-16 rounded-full bg-white/10 pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-primary-200 text-xs font-medium mb-1">शुभ विवाह 🙏</p>
            <h1 className="text-xl font-bold leading-tight">
              Namaste{firstName ? `, ${firstName}` : ''}!
            </h1>
            <p className="text-primary-100 text-sm mt-1">
              {completePct > 0 && completePct < 80
                ? `Complete your profile to get more matches (${completePct}% done)`
                : 'Here are your best matches today'}
            </p>
            {completePct > 0 && completePct < 80 && (
              <Link
                to="/profile"
                className="mt-3 inline-block bg-white text-primary-600 text-sm font-semibold px-4 py-1.5 rounded-full hover:bg-primary-50 transition-colors"
              >
                Complete Profile
              </Link>
            )}
          </div>

          {/* Profile completion indicator */}
          {completePct > 0 && (
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-sm">{completePct}%</span>
              </div>
              <span className="text-white/70 text-xs">Profile</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
        {[
          {
            to: '/matches',
            icon: Search,
            label: 'Browse Matches',
            gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
          },
          {
            to: '/interests',
            icon: Heart,
            label: 'My Interests',
            gradient: 'bg-gradient-to-br from-rose-500 to-primary-600',
          },
          {
            to: '/shortlist',
            icon: Users,
            label: 'Shortlisted',
            gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600',
          },
          {
            to: '/subscription',
            icon: Crown,
            label: 'Go Premium',
            gradient: 'bg-gradient-to-br from-amber-400 to-orange-500',
          },
        ].map(({ to, icon: Icon, label, gradient }) => (
          <Link
            key={to}
            to={to}
            className={`${gradient} rounded-2xl p-4 flex flex-col items-center gap-2 text-center hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200`}
          >
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Icon size={20} className="text-white" />
            </div>
            <span className="text-xs font-semibold text-white leading-tight">{label}</span>
          </Link>
        ))}
      </div>

      {/* Suggested matches */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            <h2 className="font-semibold text-gray-900">Suggested for You</h2>
            {suggestions?.length ? (
              <span className="text-xs font-semibold bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full">
                {suggestions.length}
              </span>
            ) : null}
          </div>
          <Link to="/matches" className="text-sm text-primary-600 font-medium hover:underline">
            View all
          </Link>
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
