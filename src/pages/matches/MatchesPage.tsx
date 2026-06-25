import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, Users } from 'lucide-react'
import { matchesApi } from '../../api/matches'
import ProfileCard from '../../components/ProfileCard'

type Tab = 'suggestions' | 'nearby' | 'premium'

export default function MatchesPage() {
  const [tab, setTab] = useState<Tab>('suggestions')
  const [searchName, setSearchName] = useState('')

  const tabs: { key: Tab; label: string }[] = [
    { key: 'suggestions', label: 'For You' },
    { key: 'nearby', label: 'Nearby' },
    { key: 'premium', label: 'Premium' },
  ]

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', tab],
    queryFn: () => {
      if (tab === 'suggestions') return matchesApi.getSuggestions(0, 30).then((r) => r.data.data)
      if (tab === 'nearby') return matchesApi.getNearby(0, 30).then((r) => r.data.data)
      return matchesApi.getPremiumPicks(0, 30).then((r) => r.data.data)
    },
  })

  const filtered = matches?.filter((m) =>
    !searchName || m.fullName?.toLowerCase().includes(searchName.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-gray-900">Browse Matches</h1>
          {filtered?.length != null && (
            <span className="text-xs font-semibold bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">
              {filtered.length}
            </span>
          )}
        </div>
        <button className="btn-secondary flex items-center gap-2 text-sm py-2">
          <SlidersHorizontal size={16} /> Filter
        </button>
      </div>

      {/* Search bar */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="w-full rounded-xl border border-gray-200 bg-white shadow-sm px-4 py-3 pl-10 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-400/30 focus:border-primary-400 transition-all duration-200"
          placeholder="Search by name…"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="tab-bar mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`tab-btn ${tab === t.key ? 'tab-active' : 'tab-inactive'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card h-52 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : filtered?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((m) => (
            <ProfileCard key={m.profileId} match={m} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">No matches found</p>
          <p className="text-xs text-gray-400">Try adjusting your filters or check back later</p>
        </div>
      )}
    </div>
  )
}
