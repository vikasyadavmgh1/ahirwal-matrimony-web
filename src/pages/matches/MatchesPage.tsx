import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal } from 'lucide-react'
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
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold text-gray-900">Browse Matches</h1>
        <button className="btn-secondary flex items-center gap-2 text-sm py-2">
          <SlidersHorizontal size={16} /> Filter
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          className="input pl-9"
          placeholder="Search by name…"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
              tab === t.key ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
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
        <div className="text-center py-16 text-gray-500">
          <p>No matches found</p>
        </div>
      )}
    </div>
  )
}
