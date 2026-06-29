import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Edit2, MapPin, GraduationCap, Briefcase, Heart, Shield, Crown,
  BookHeart, Send, Check, Home, Users, MoreVertical, Flag, UserX,
  Star, Eye, Lock,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { profileApi } from '../../api/profile'
import { interestsApi } from '../../api/interests'
import { shortlistApi } from '../../api/shortlist'
import { reportApi } from '../../api/report'

const REPORT_REASONS = [
  { value: 'FAKE_PROFILE', label: 'Fake Profile' },
  { value: 'INAPPROPRIATE_PHOTO', label: 'Inappropriate Photos' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'OTHER', label: 'Other' },
]

export default function ProfilePage() {
  const { id } = useParams()
  const isOwn = !id
  const qc = useQueryClient()
  const navigate = useNavigate()
  const [interestMsg, setInterestMsg] = useState('')
  const [showMsgBox, setShowMsgBox] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportReason, setReportReason] = useState('FAKE_PROFILE')
  const [reportDesc, setReportDesc] = useState('')
  const menuRef = useRef<HTMLDivElement>(null)

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id ?? 'me'],
    queryFn: () =>
      isOwn
        ? profileApi.getMyProfile().then((r) => r.data.data)
        : profileApi.getProfile(id!).then((r) => r.data.data),
  })

  // Record profile view (fire and forget)
  useEffect(() => {
    if (!isOwn && id && profile) {
      profileApi.recordView(id)
    }
  }, [isOwn, id, profile])

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
    onError: (e: any) => {
      const status = e?.response?.status
      if (status === 402 || e?.response?.data?.code === 'INTEREST_LIMIT_REACHED') {
        toast((t) => (
          <span className="flex items-center gap-2">
            Monthly limit reached.{' '}
            <a href="/subscription" className="font-bold text-primary-600 underline" onClick={() => toast.dismiss(t.id)}>
              Upgrade to Premium
            </a>
          </span>
        ), { duration: 5000 })
      } else {
        toast.error(e?.response?.data?.message ?? 'Could not send interest')
      }
    },
  })

  const shortlistMut = useMutation({
    mutationFn: () => slStatus ? shortlistApi.remove(id!) : shortlistApi.add(id!),
    onSuccess: () => {
      toast.success(slStatus ? 'Removed from shortlist' : 'Added to shortlist')
      qc.invalidateQueries({ queryKey: ['shortlist-status', id] })
      qc.invalidateQueries({ queryKey: ['shortlist'] })
    },
  })

  const blockMut = useMutation({
    mutationFn: () => profileApi.blockProfile(id!),
    onSuccess: () => {
      toast.success('Profile blocked')
      setMenuOpen(false)
      navigate('/matches')
    },
    onError: () => toast.error('Failed to block'),
  })

  const reportMut = useMutation({
    mutationFn: () => reportApi.submit(id!, reportReason, reportDesc || undefined),
    onSuccess: () => {
      toast.success('Report submitted. Thank you.')
      setShowReportModal(false)
      setReportDesc('')
    },
    onError: () => toast.error('Failed to submit report'),
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

  // Completeness nudge sections for own profile
  const missingItems = isOwn ? [
    !profile.avatarUrl && 'Add a profile photo',
    !profile.aboutMe && 'Write an About Me',
    !profile.heightCm && 'Add your height',
    !profile.educationLevel && 'Add education details',
    !profile.fatherName && 'Add family details',
    !profile.rashi && 'Add horoscope details (Rashi)',
  ].filter(Boolean) : []

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

      {/* Hero Card */}
      <div className="card overflow-hidden">
        <div className="relative h-64 bg-gradient-to-br from-primary-200 to-primary-50">
          {profile.photosPrivate ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 gap-3">
              <div className="w-16 h-16 rounded-2xl bg-gray-200 flex items-center justify-center">
                <Lock size={28} className="text-gray-400" />
              </div>
              <p className="text-sm font-semibold text-gray-500">Photos visible after interest accepted</p>
            </div>
          ) : profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-7xl text-primary-200 font-bold">
              {profile.fullName?.charAt(0) ?? '?'}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute top-3 right-3 flex gap-1.5 items-center">
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
            {/* Three-dot menu for other profiles */}
            {!isOwn && (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 bg-black/40 hover:bg-black/60 rounded-lg flex items-center justify-center text-white transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-float border border-gray-100 py-1 min-w-[160px] z-50 animate-scale-in">
                    <button
                      onClick={() => { setMenuOpen(false); setShowReportModal(true) }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      <Flag size={15} className="text-amber-500" /> Report
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Block this profile? They will no longer appear in your browse.')) {
                          blockMut.mutate()
                        }
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <UserX size={15} /> Block
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
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
            <div className="flex gap-2">
              <Link to="/profile/edit" className="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
                <Edit2 size={14} /> Edit Profile
              </Link>
              <Link to="/profile/viewers" className="flex items-center gap-1.5 text-sm py-2.5 px-4 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all">
                <Eye size={15} /> Viewers
              </Link>
            </div>
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

      {/* Completeness nudges (own profile, < 80%) */}
      {isOwn && missingItems.length > 0 && profile.profileCompletePct < 80 && (
        <div className="card p-4 border-l-4 border-l-amber-400">
          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-2">Complete your profile</p>
          <ul className="space-y-1">
            {missingItems.slice(0, 4).map((item) => (
              <li key={item as string} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <Link to="/profile/edit" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 mt-3 hover:underline">
            <Edit2 size={11} /> Complete now
          </Link>
        </div>
      )}

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
          {profile.heightCm && (
            <DetailRow icon={Star} label="Height" value={cmToFeet(profile.heightCm)} />
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
          {profile.annualIncomeLpa && (
            <DetailRow icon={Briefcase} label="Annual Income" value={`₹${profile.annualIncomeLpa} LPA`} />
          )}
          {profile.gotraName && (
            <DetailRow icon={Heart} label="Gotra" value={profile.gotraName} />
          )}
          {profile.maritalStatus && (
            <DetailRow icon={Users} label="Marital Status" value={profile.maritalStatus.replace(/_/g, ' ')} />
          )}
        </div>
      </div>

      {/* Family Details */}
      {(profile.fatherName || profile.motherName || profile.siblingsCount != null || profile.familyType) && (
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Family Details</h2>
          <div className="space-y-3">
            {profile.fatherName && (
              <DetailRow icon={Users} label="Father" value={[profile.fatherName, profile.fatherOccupation].filter(Boolean).join(' · ')} />
            )}
            {profile.motherName && (
              <DetailRow icon={Users} label="Mother" value={profile.motherName} />
            )}
            {profile.siblingsCount != null && (
              <DetailRow icon={Users} label="Siblings" value={String(profile.siblingsCount)} />
            )}
            {profile.familyType && (
              <DetailRow icon={Home} label="Family Type" value={profile.familyType.replace(/_/g, ' ')} />
            )}
            {profile.landAcres && (
              <DetailRow icon={MapPin} label="Land" value={`${profile.landAcres} acres`} />
            )}
          </div>
        </div>
      )}

      {/* Horoscope */}
      {(profile.manglik || profile.rashi || profile.nakshatra) && (
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Horoscope</h2>
          <div className="space-y-3">
            {profile.manglik && (
              <DetailRow icon={Star} label="Manglik" value={profile.manglik} />
            )}
            {profile.rashi && (
              <DetailRow icon={Star} label="Rashi" value={profile.rashi} />
            )}
            {profile.nakshatra && (
              <DetailRow icon={Star} label="Nakshatra" value={profile.nakshatra} />
            )}
          </div>
        </div>
      )}

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
      {!profile.photosPrivate && profile.galleryUrls && profile.galleryUrls.length > 0 && (
        <div className="card p-5">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Photo Gallery</h2>
          <div className="grid grid-cols-3 gap-2">
            {profile.galleryUrls.map((url, i) => (
              <img key={i} src={url} alt="" className="aspect-square object-cover rounded-xl" />
            ))}
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center">
                <Flag size={16} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Report Profile</h3>
                <p className="text-xs text-gray-400">Help us keep the community safe</p>
              </div>
            </div>
            <div>
              <label className="label">Reason</label>
              <select className="input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Details <span className="normal-case font-normal text-gray-400">(optional)</span></label>
              <textarea
                className="input resize-none"
                rows={3}
                placeholder="Describe the issue…"
                value={reportDesc}
                onChange={(e) => setReportDesc(e.target.value)}
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => reportMut.mutate()}
                disabled={reportMut.isPending}
                className="btn-primary flex-1 py-3"
              >
                {reportMut.isPending ? 'Submitting…' : 'Submit Report'}
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="btn-secondary px-5 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function cmToFeet(cm: number) {
  const totalIn = Math.round(cm / 2.54)
  const ft = Math.floor(totalIn / 12)
  const inch = totalIn % 12
  return `${ft}'${inch}" (${cm} cm)`
}

function DetailRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-7 h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-gray-500" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-gray-900 font-medium">{value}</p>
      </div>
    </div>
  )
}
