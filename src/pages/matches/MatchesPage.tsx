import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, Users } from 'lucide-react'
import { matchesApi } from '../../api/matches'
import ProfileCard from '../../components/ProfileCard'

type Tab = 'suggestions' | 'nearby' | 'premium'

const tabs: { key: Tab; label: string }[] = [
  { key: 'suggestions', label: 'For You' },
  { key: 'nearby',      label: 'Nearby'  },
  { key: 'premium',     label: 'Premium' },
]

export default function MatchesPage() {
  const [tab, setTab] = useState<Tab>('suggestions')
  const [searchName, setSearchName] = useState('')

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', tab],
    queryFn: () => {
      if (tab === 'suggestions') return matchesApi.getSuggestions(0, 30).then((r) => r.data.data)
      if (tab === 'nearby')      return matchesApi.getNearby(0, 30).then((r) => r.data.data)
      return matchesApi.getPremiumPicks(0, 30).then((r) => r.data.data)
    },
  })

  const filtered = matches?.filter(
    (m) => !searchName || m.fullName?.toLowerCase().includes(searchName.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-gray-900">Browse</h1>
        <button className="flex items-center gap-1.5 text-sm font-bold text-gray-600 bg-white border-2 border-gray-200 px-3 py-2 rounded-full hover:border-primary-300 transition-colors">
          <SlidersHorizontal size={14} /> Filter
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          className="w-full bg-white rounded-full border-2 border-gray-200 pl-11 pr-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 shadow-soft transition-all duration-200"
          placeholder="Search by name…"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
        />
      </div>

      {/* Chip filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={tab === t.key ? 'chip-active' : 'chip-inactive'}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Result count */}
      {!isLoading && filtered != null && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          {filtered.length} profiles
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse shadow-card" />
          ))}
        </div>
      ) : filtered?.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((m) => (
            <ProfileCard key={m.profileId} match={m} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={24} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-700">No profiles found</p>
          <p className="text-sm text-gray-400 text-center">Try a different filter or check back later</p>
        </div>
      )}
    </div>
  )
}
