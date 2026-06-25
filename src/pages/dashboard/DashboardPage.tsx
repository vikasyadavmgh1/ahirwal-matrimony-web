import { useQuery } from '@tanstack/react-query'
import { Heart, Search, Users, Crown, Bell, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { profileApi } from '../../api/profile'
import { matchesApi } from '../../api/matches'
import ProfileCard from '../../components/ProfileCard'

export default function DashboardPage() {
  const { data: profile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => profileApi.getMyProfile().then((r) => r.data.data),
  })

  const { data: suggestions, isLoading } = useQuery({
    queryKey: ['suggestions'],
    queryFn: () => matchesApi.getSuggestions(0, 6).then((r) => r.data.data),
  })

  const firstName = profile?.fullName?.split(' ')[0] ?? ''
  const completePct = profile?.profileCompletePct ?? 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-5 pb-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{greeting}</p>
          <h1 className="text-2xl font-black text-gray-900 mt-0.5">
            {firstName ? `${firstName} 👋` : 'Welcome 👋'}
          </h1>
        </div>
        <button className="relative w-10 h-10 rounded-full bg-white shadow-soft flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-500" />
        </button>
      </div>

      <div className="px-4 pb-8 space-y-6">

        {/* Profile completion card — only if incomplete */}
        {completePct > 0 && completePct < 80 && (
          <Link to="/profile/edit" className="block bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-4 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-white font-bold text-sm">Complete your profile</p>
                <p className="text-primary-100 text-xs mt-0.5">Get 3× more matches by filling in more details</p>
              </div>
              <ChevronRight size={20} className="text-white/70 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${completePct}%` }} />
              </div>
              <span className="text-white font-black text-sm">{completePct}%</span>
            </div>
          </Link>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            { to: '/matches',      icon: Search, label: 'Browse',    bg: 'bg-blue-50',   icon_color: 'text-blue-600'   },
            { to: '/interests',    icon: Heart,  label: 'Interests', bg: 'bg-rose-50',   icon_color: 'text-rose-600'   },
            { to: '/shortlist',    icon: Users,  label: 'Saved',     bg: 'bg-teal-50',   icon_color: 'text-teal-600'   },
            { to: '/subscription', icon: Crown,  label: 'Premium',   bg: 'bg-amber-50',  icon_color: 'text-amber-600'  },
          ].map(({ to, icon: Icon, label, bg, icon_color }) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-2">
              <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center shadow-soft hover:shadow-md transition-shadow`}>
                <Icon size={22} className={icon_color} />
              </div>
              <span className="text-xs font-semibold text-gray-600">{label}</span>
            </Link>
          ))}
        </div>

        {/* Suggested matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-black text-gray-900">Today's Picks</h2>
            <Link to="/matches" className="text-sm font-bold text-primary-600 flex items-center gap-0.5 hover:underline">
              See all <ChevronRight size={14} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl h-64 animate-pulse shadow-card" />
              ))}
            </div>
          ) : suggestions?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {suggestions.map((match) => (
                <ProfileCard key={match.profileId} match={match} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-card p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-3">
                <Heart size={28} className="text-primary-400" />
              </div>
              <p className="font-bold text-gray-900 mb-1">No suggestions yet</p>
              <p className="text-sm text-gray-500 mb-4">Complete your profile to start seeing matches</p>
              <Link to="/profile/edit" className="btn-primary text-sm py-2.5 px-5">
                Complete Profile
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
