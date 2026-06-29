import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, SlidersHorizontal, Users, X } from 'lucide-react'
import { matchesApi } from '../../api/matches'
import ProfileCard from '../../components/ProfileCard'

type Tab = 'suggestions' | 'nearby' | 'premium'

const tabs: { key: Tab; label: string }[] = [
  { key: 'suggestions', label: 'For You' },
  { key: 'nearby',      label: 'Nearby'  },
  { key: 'premium',     label: 'Premium' },
]

interface Filters {
  minAge: string
  maxAge: string
  minHeightCm: string
  maxHeightCm: string
  educationLevel: string
  manglik: string
  familyType: string
  minIncomeLpa: string
}

const EMPTY_FILTERS: Filters = {
  minAge: '', maxAge: '', minHeightCm: '', maxHeightCm: '',
  educationLevel: '', manglik: '', familyType: '', minIncomeLpa: '',
}

function hasFilters(f: Filters) {
  return Object.values(f).some((v) => v !== '')
}

export default function MatchesPage() {
  const [tab, setTab] = useState<Tab>('suggestions')
  const [searchName, setSearchName] = useState('')
  const [showFilterPanel, setShowFilterPanel] = useState(false)
  const [pendingFilters, setPendingFilters] = useState<Filters>(EMPTY_FILTERS)
  const [activeFilters, setActiveFilters] = useState<Filters>(EMPTY_FILTERS)

  const setF = (k: keyof Filters, v: string) =>
    setPendingFilters((f) => ({ ...f, [k]: v }))

  const applyFilters = () => {
    setActiveFilters({ ...pendingFilters })
    setShowFilterPanel(false)
  }

  const clearFilters = () => {
    setPendingFilters(EMPTY_FILTERS)
    setActiveFilters(EMPTY_FILTERS)
  }

  const filtersActive = hasFilters(activeFilters)

  const { data: matches, isLoading } = useQuery({
    queryKey: ['matches', tab, activeFilters],
    queryFn: () => {
      // If filters are active, always use the search endpoint
      if (filtersActive) {
        const params: Record<string, string | number> = {}
        if (activeFilters.minAge) params.minAge = Number(activeFilters.minAge)
        if (activeFilters.maxAge) params.maxAge = Number(activeFilters.maxAge)
        if (activeFilters.minHeightCm) params.minHeightCm = Number(activeFilters.minHeightCm)
        if (activeFilters.maxHeightCm) params.maxHeightCm = Number(activeFilters.maxHeightCm)
        if (activeFilters.educationLevel) params.educationLevel = activeFilters.educationLevel
        if (activeFilters.manglik) params.manglik = activeFilters.manglik
        if (activeFilters.familyType) params.familyType = activeFilters.familyType
        if (activeFilters.minIncomeLpa) params.minIncomeLpa = Number(activeFilters.minIncomeLpa)
        return matchesApi.search(params).then((r) => r.data.data)
      }
      if (tab === 'suggestions') return matchesApi.getSuggestions(0, 30).then((r) => r.data.data)
      if (tab === 'nearby')      return matchesApi.getNearby(0, 30).then((r) => r.data.data)
      return matchesApi.getPremiumPicks(0, 30).then((r) => r.data.data)
    },
  })

  const filtered = matches?.filter(
    (m) => !searchName || m.profile.fullName?.toLowerCase().includes(searchName.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-black text-gray-900">Browse</h1>
        <div className="flex items-center gap-2">
          {filtersActive && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full"
            >
              <X size={12} /> Clear filters
            </button>
          )}
          <button
            onClick={() => { setPendingFilters({ ...activeFilters }); setShowFilterPanel(true) }}
            className={`flex items-center gap-1.5 text-sm font-bold px-3 py-2 rounded-full border-2 transition-colors ${
              filtersActive
                ? 'text-primary-600 bg-primary-50 border-primary-300'
                : 'text-gray-600 bg-white border-gray-200 hover:border-primary-300'
            }`}
          >
            <SlidersHorizontal size={14} /> Filter
          </button>
        </div>
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

      {/* Tab chips (hidden when filters active) */}
      {!filtersActive && (
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
      )}

      {/* Result count */}
      {!isLoading && filtered != null && (
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
          {filtered.length} profiles {filtersActive && '· filtered'}
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
            <ProfileCard key={m.profile.id} match={m} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Users size={24} className="text-gray-300" />
          </div>
          <p className="font-bold text-gray-700">No profiles found</p>
          <p className="text-sm text-gray-400 text-center">
            {filtersActive ? 'Try relaxing your filters' : 'Try a different tab or check back later'}
          </p>
        </div>
      )}

      {/* Filter panel overlay */}
      {showFilterPanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilterPanel(false)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-float animate-fade-up">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-5 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-bold text-gray-900">Filters</h2>
              <button onClick={() => setShowFilterPanel(false)}>
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 space-y-5">
              {/* Age */}
              <div>
                <label className="label">Age Range</label>
                <div className="flex gap-3">
                  <input type="number" className="input" placeholder="Min age" value={pendingFilters.minAge}
                    onChange={(e) => setF('minAge', e.target.value)} />
                  <input type="number" className="input" placeholder="Max age" value={pendingFilters.maxAge}
                    onChange={(e) => setF('maxAge', e.target.value)} />
                </div>
              </div>
              {/* Height */}
              <div>
                <label className="label">Height (cm)</label>
                <div className="flex gap-3">
                  <input type="number" className="input" placeholder="Min height" value={pendingFilters.minHeightCm}
                    onChange={(e) => setF('minHeightCm', e.target.value)} />
                  <input type="number" className="input" placeholder="Max height" value={pendingFilters.maxHeightCm}
                    onChange={(e) => setF('maxHeightCm', e.target.value)} />
                </div>
              </div>
              {/* Education */}
              <div>
                <label className="label">Minimum Education</label>
                <select className="input" value={pendingFilters.educationLevel} onChange={(e) => setF('educationLevel', e.target.value)}>
                  <option value="">Any</option>
                  <option value="TENTH">10th Pass</option>
                  <option value="TWELFTH">12th Pass</option>
                  <option value="GRADUATE">Graduate</option>
                  <option value="POST_GRADUATE">Post Graduate</option>
                  <option value="DOCTORATE">Doctorate</option>
                </select>
              </div>
              {/* Manglik */}
              <div>
                <label className="label">Manglik</label>
                <select className="input" value={pendingFilters.manglik} onChange={(e) => setF('manglik', e.target.value)}>
                  <option value="">Any</option>
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>
              {/* Family Type */}
              <div>
                <label className="label">Family Type</label>
                <select className="input" value={pendingFilters.familyType} onChange={(e) => setF('familyType', e.target.value)}>
                  <option value="">Any</option>
                  <option value="JOINT">Joint Family</option>
                  <option value="NUCLEAR">Nuclear Family</option>
                </select>
              </div>
              {/* Income */}
              <div>
                <label className="label">Minimum Income (LPA)</label>
                <input type="number" className="input" placeholder="e.g., 5" value={pendingFilters.minIncomeLpa}
                  onChange={(e) => setF('minIncomeLpa', e.target.value)} />
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4 flex gap-3">
              <button onClick={clearFilters} className="btn-secondary flex-1 py-3">Clear</button>
              <button onClick={applyFilters} className="btn-primary flex-1 py-3">Apply Filters</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
