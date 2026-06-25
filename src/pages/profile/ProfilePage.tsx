import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import {
  Edit2, MapPin, GraduationCap, Briefcase, Heart, Shield, Crown,
  BookHeart, Send, Check, Home, Users,
} from 'lucide-react'
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
    mutationFn: () => slStatus ? shortlistApi.remove(id!) : shortlistApi.add(id!),
    onSuccess: () => {
      toast.success(slStatus ? 'Removed from shortlist' : 'Added to shortlist')
      qc.invalidateQueries({ queryKey: ['shortlist-status', id] })
      qc.invalidateQueries({ queryKey: ['shortlist'] })
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="card h-72 animate-pulse bg-gray-100 rounded-2xl" />
        <div className="card h-36 animate-pulse bg-gray-100 rounded-2xl" />
        <div className="card h-24 animate-pulse bg-gray-100 rounded-2xl" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-500 px-4">
        {isOwn ? (
          <div className="text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-9 h-9 text-primary-400" />
            </div>
            <p className="text-lg font-bold text-gray-900 mb-1">No profile yet</p>
            <p className="text-sm text-gray-500 mb-5">Create your profile to start finding matches</p>
            <Link to="/profile/edit" className="btn-primary inline-flex items-center gap-2">
              <Edit2 size={15} /> Create Profile
            </Link>
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

  const locationParts = [profile.nativeVillage, profile.nativeDistrict, profile.nativeState].filter(Boolean)

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

      {/* Hero Card */}
      <div className="card overflow-hidden">
        {/* Photo */}
        <div className="relative h-64 bg-gradient-to-br from-primary-200 to-primary-50">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl text-primary-200 font-bold">
              {profile.fullName?.charAt(0) ?? '?'}
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          {/* Badges */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            {profile.isPremium && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <Crown size={11} /> Premium
              </span>
            )}
            {profile.isVerified && (
              <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                <Shield size={11} /> Verified
              </span>
            )}
          </div>
          {/* Name overlay on photo */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h1 className="text-xl font-bold text-white drop-shadow">
              {profile.fullName ?? 'No name'}
              {age && <span className="font-normal ml-2 text-white/80">{age} yrs</span>}
            </h1>
            {profile.fullNameHindi && (
              <p className="text-white/70 text-sm">{profile.fullNameHindi}</p>
            )}
          </div>
        </div>

        <div className="p-5">
          {/* Completion bar (own profile) */}
          {isOwn && (
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500 font-medium">Profile completion</span>
                <span className="text-primary-600 font-semibold">{profile.profileCompletePct}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                  style={{ width: `${profile.profileCompletePct}%` }}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          {isOwn ? (
            <Link to="/profile/edit" className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <Edit2 size={14} /> Edit Profile
            </Link>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => shortlistMut.mutate()}
                disabled={shortlistMut.isPending}
                className={`flex items-center gap-1.5 text-sm py-2.5 px-4 rounded-xl border transition-all ${
                  slStatus
                    ? 'bg-primary-50 text-primary-600 border-primary-200 font-medium'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                <BookHeart size={15} />
                {slStatus ? 'Shortlisted' : 'Shortlist'}
              </button>
              {!showMsgBox ? (
                <button
                  onClick={() => setShowMsgBox(true)}
                  className="btn-primary flex items-center gap-1.5 text-sm flex-1"
                >
                  <Send size={14} /> Send Interest
                </button>
              ) : (
                <div className="flex-1 flex flex-col gap-2">
                  <textarea
                    className="input text-sm resize-none"
                    rows={2}
                    placeholder="Add a personal message (optional)…"
                    value={interestMsg}
                    onChange={(e) => setInterestMsg(e.target.value)}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => interestMut.mutate()}
                      disabled={interestMut.isPending}
                      className="btn-primary flex items-center gap-1.5 text-sm py-2 px-4"
                    >
                      <Check size={13} /> {interestMut.isPending ? 'Sending…' : 'Send'}
                    </button>
                    <button onClick={() => setShowMsgBox(false)} className="btn-secondary text-sm py-2 px-4">
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
      <div className="card p-5">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Profile Details</h2>
        <div className="space-y-3">
          {locationParts.length > 0 && (
            <DetailRow icon={MapPin} label="From" value={locationParts.join(', ')} />
          )}
          {profile.currentCity && (
            <DetailRow icon={Home} label="Lives in" value={profile.currentCity} />
          )}
          {profile.educationLevel && (
            <DetailRow icon={GraduationCap} label="Education" value={profile.educationLevel.replace(/_/g, ' ')} />
          )}
          {profile.occupation && (
            <DetailRow
              icon={Briefcase}
              label="Occupation"
              value={[profile.occupationDetail, profile.companyName].filter(Boolean).join(' · ') || profile.occupation.replace(/_/g, ' ')}
            />
          )}
          {profile.gotraName && (
            <DetailRow icon={Heart} label="Gotra" value={profile.gotraName} />
          )}
          {profile.maritalStatus && (
            <DetailRow icon={Users} label="Marital Status" value={profile.maritalStatus.replace(/_/g, ' ')} />
          )}
        </div>
      </div>

      {/* About */}
      {(profile.aboutMe || profile.partnerExpectations) && (
        <div className="card p-5 space-y-4">
          {profile.aboutMe && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">About Me</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{profile.aboutMe}</p>
            </div>
          )}
          {profile.partnerExpectations && (
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Partner Expectations</h2>
              <p className="text-gray-700 text-sm leading-relaxed">{profile.partnerExpectations}</p>
            </div>
          )}
        </div>
      )}

      {/* Gallery */}
      {profile.galleryUrls && profile.galleryUrls.length > 0 && (
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Photo Gallery</h2>
          <div className="grid grid-cols-3 gap-2">
            {profile.galleryUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="aspect-square object-cover rounded-xl" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-gray-900 font-medium capitalize">{value.toLowerCase()}</p>
      </div>
    </div>
  )
}
