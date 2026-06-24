import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { Edit2, MapPin, GraduationCap, Briefcase, Heart, Shield, Crown, BookHeart, Send, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { profileApi } from '../../api/profile'
import { interestsApi } from '../../api/interests'
import { shortlistApi } from '../../api/shortlist'

export default function ProfilePage() {
  const { id } = useParams()
  const isOwn = !id
  const qc = useQueryClient()
  const [interestMsg, setInterestMsg] = useState('')
  const [showMsgBox, setShowMsgBox] = useState(false)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id ?? 'me'],
    queryFn: () =>
      isOwn
        ? profileApi.getMyProfile().then((r) => r.data.data)
        : profileApi.getProfile(id!).then((r) => r.data.data),
  })

  const { data: slStatus } = useQuery({
    queryKey: ['shortlist-status', id],
    queryFn: () => shortlistApi.isShortlisted(id!).then((r) => r.data.data),
    enabled: !!id && !isOwn,
  })

  const interestMut = useMutation({
    mutationFn: () => interestsApi.sendInterest(id!, interestMsg || undefined),
    onSuccess: () => {
      toast.success('Interest sent!')
      setShowMsgBox(false)
      qc.invalidateQueries({ queryKey: ['interests'] })
    },
    onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Could not send interest'),
  })

  const shortlistMut = useMutation({
    mutationFn: () =>
      slStatus ? shortlistApi.remove(id!) : shortlistApi.add(id!),
    onSuccess: () => {
      toast.success(slStatus ? 'Removed from shortlist' : 'Added to shortlist')
      qc.invalidateQueries({ queryKey: ['shortlist-status', id] })
      qc.invalidateQueries({ queryKey: ['shortlist'] })
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="card h-96 animate-pulse" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 px-4">
        {isOwn ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 mb-1">No profile yet</p>
            <p className="text-sm text-gray-500 mb-5">Create your profile to start finding matches</p>
            <Link to="/profile/edit" className="btn-primary inline-block">Create Profile</Link>
          </div>
        ) : (
          <p>Profile not found</p>
        )}
      </div>
    )
  }

  const age = profile.dateOfBirth
    ? Math.floor((Date.now() - new Date(profile.dateOfBirth).getTime()) / 31557600000)
    : null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="relative h-56 bg-gradient-to-br from-primary-100 to-saffron-400/20">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-primary-300">
              {profile.fullName?.charAt(0) ?? '?'}
            </div>
          )}
          <div className="absolute bottom-3 right-3 flex gap-2">
            {profile.isPremium && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Crown size={12} /> Premium
              </span>
            )}
            {profile.isVerified && (
              <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">
                <Shield size={12} /> Verified
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {profile.fullName ?? 'No name'}
                {age && <span className="text-gray-500 font-normal ml-2 text-base">{age} yrs</span>}
              </h1>
              {profile.fullNameHindi && (
                <p className="text-gray-500 text-sm">{profile.fullNameHindi}</p>
              )}
            </div>
            {isOwn && (
              <Link to="/profile/edit" className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-3">
                <Edit2 size={14} /> Edit
              </Link>
            )}
          </div>

          {/* Completion bar (own profile only) */}
          {isOwn && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Profile completion</span>
                <span>{profile.profileCompletePct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full">
                <div className="h-2 bg-primary-500 rounded-full" style={{ width: `${profile.profileCompletePct}%` }} />
              </div>
            </div>
          )}

          {/* Actions for other profiles */}
          {!isOwn && (
            <div className="flex gap-2 mt-4">
              {/* Shortlist toggle */}
              <button
                onClick={() => shortlistMut.mutate()}
                disabled={shortlistMut.isPending}
                className={`flex items-center gap-1.5 text-sm py-2 px-3 rounded-lg border transition-colors ${
                  slStatus
                    ? 'bg-primary-50 text-primary-600 border-primary-200'
                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <BookHeart size={15} />
                {slStatus ? 'Shortlisted' : 'Shortlist'}
              </button>

              {/* Send Interest */}
              {!showMsgBox ? (
                <button
                  onClick={() => setShowMsgBox(true)}
                  className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4 flex-1"
                >
                  <Send size={15} /> Send Interest
                </button>
              ) : (
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    className="input text-sm resize-none"
                    rows={2}
                    placeholder="Add a personal message (optional)..."
                    value={interestMsg}
                    onChange={(e) => setInterestMsg(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => interestMut.mutate()}
                      disabled={interestMut.isPending}
                      className="btn-primary flex items-center gap-1.5 text-sm py-1.5 px-3"
                    >
                      <Check size={14} /> {interestMut.isPending ? 'Sending…' : 'Send'}
                    </button>
                    <button
                      onClick={() => setShowMsgBox(false)}
                      className="btn-secondary text-sm py-1.5 px-3"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Details */}
      <div className="card p-5 space-y-3">
        <h2 className="font-semibold text-gray-900">Basic Details</h2>
        {[
          { icon: MapPin, label: 'Location', value: [profile.nativeDistrict, profile.nativeState].filter(Boolean).join(', ') || null },
          { icon: GraduationCap, label: 'Education', value: profile.educationLevel?.replace(/_/g, ' ') ?? null },
          { icon: Briefcase, label: 'Occupation', value: profile.occupation?.replace(/_/g, ' ') ?? null },
          { icon: Heart, label: 'Gotra', value: profile.gotraName ?? null },
        ].map(({ icon: Icon, label, value }) =>
          value ? (
            <div key={label} className="flex items-center gap-3 text-sm">
              <Icon size={16} className="text-gray-400 flex-shrink-0" />
              <span className="text-gray-500 w-24 flex-shrink-0">{label}</span>
              <span className="text-gray-900">{value}</span>
            </div>
          ) : null
        )}
      </div>

      {(profile.aboutMe || profile.partnerExpectations) && (
        <div className="card p-5 space-y-4">
          {profile.aboutMe && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">About Me</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.aboutMe}</p>
            </div>
          )}
          {profile.partnerExpectations && (
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Partner Expectations</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{profile.partnerExpectations}</p>
            </div>
          )}
        </div>
      )}

      {profile.galleryUrls && profile.galleryUrls.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Gallery</h2>
          <div className="grid grid-cols-3 gap-2">
            {profile.galleryUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="aspect-square object-cover rounded-lg" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
