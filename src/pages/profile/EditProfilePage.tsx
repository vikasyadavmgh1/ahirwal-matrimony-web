import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, ChevronLeft, Images, Save, Sparkles, X } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { profileApi } from '../../api/profile'
import { masterApi } from '../../api/master'
import type { ProfileDTO, Gender, EducationLevel, Occupation, MatrimonialStatus } from '../../types'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isNewUser = searchParams.get('new') === '1'
  const qc = useQueryClient()

  // Avatar upload
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Gallery upload
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [uploadingGallery, setUploadingGallery] = useState(false)

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }

    setUploadingAvatar(true)
    try {
      const { data: presignData } = await profileApi.avatarPresignedUrl(file.type)
      const { uploadUrl, downloadUrl } = presignData.data
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        withCredentials: false,
      })
      set('avatarUrl', downloadUrl)
      toast.success('Photo uploaded! Save profile to confirm.')
    } catch {
      toast.error('Photo upload failed. Please try again.')
    } finally {
      setUploadingAvatar(false)
      if (avatarInputRef.current) avatarInputRef.current.value = ''
    }
  }

  const handleGallerySelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }

    if (!existingProfile) {
      toast.error('Please save your profile first before adding gallery photos')
      if (galleryInputRef.current) galleryInputRef.current.value = ''
      return
    }

    const currentGallery = form.galleryUrls ?? []
    if (currentGallery.length >= 5) {
      toast.error('Maximum 5 gallery photos allowed')
      return
    }

    setUploadingGallery(true)
    try {
      const { data: presignData } = await profileApi.galleryPresignedUrl(file.type)
      const { uploadUrl, downloadUrl } = presignData.data

      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        withCredentials: false,
      })

      const { data: updatedProfile } = await profileApi.addGalleryPhoto(downloadUrl)
      qc.setQueryData(['profile', 'me'], updatedProfile.data)
      set('galleryUrls', updatedProfile.data.galleryUrls)
      toast.success('Gallery photo added!')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Unknown error'
      toast.error(`Gallery upload failed: ${msg}`)
    } finally {
      setUploadingGallery(false)
      if (galleryInputRef.current) galleryInputRef.current.value = ''
    }
  }

  const handleRemoveGalleryPhoto = async (index: number) => {
    try {
      const { data: updatedProfile } = await profileApi.removeGalleryPhoto(index)
      qc.setQueryData(['profile', 'me'], updatedProfile.data)
      set('galleryUrls', updatedProfile.data.galleryUrls)
      toast.success('Photo removed')
    } catch {
      toast.error('Failed to remove photo')
    }
  }

  const { data: existingProfile } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => profileApi.getMyProfile().then((r) => r.data.data).catch(() => null),
  })

  const { data: gotras } = useQuery({
    queryKey: ['gotras'],
    queryFn: () => masterApi.getGotras().then((r) => r.data.data),
  })

  const [form, setForm] = useState<Partial<ProfileDTO>>({})

  useEffect(() => {
    if (existingProfile) setForm(existingProfile)
  }, [existingProfile])

  const set = <K extends keyof ProfileDTO>(k: K, v: ProfileDTO[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  // Backend expects gotraId as plain UUID string
  const buildPayload = () => ({
    ...form,
    gotraId: form.gotraId ?? null,
    prefMotherGotraId: form.prefMotherGotraId ?? null,
  })

  const saveMut = useMutation({
    mutationFn: () => {
      const payload = buildPayload()
      return existingProfile
        ? profileApi.updateProfile(payload).then((r) => r.data.data)
        : profileApi.createProfile(payload).then((r) => r.data.data)
    },
    onSuccess: (savedProfile) => {
      toast.success('Profile saved!')
      qc.setQueryData(['profile', 'me'], savedProfile)
      qc.invalidateQueries({ queryKey: ['profile'] })
      navigate(isNewUser ? '/dashboard' : '/profile')
    },
    onError: (e: any) => {
      const msg = e?.response?.data?.message ?? 'Failed to save profile'
      toast.error(msg)
    },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {isNewUser && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-xl p-4 mb-5 flex items-start gap-3">
          <Sparkles size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Welcome to Ahirwal Matrimony! 🙏</p>
            <p className="text-primary-100 text-sm mt-0.5">Complete your profile so potential matches can find you. The more you fill, the better your matches.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        {!isNewUser && (
          <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={24} />
          </button>
        )}
        <h1 className="text-xl font-bold text-gray-900">
          {existingProfile ? 'Edit Profile' : 'Create Profile'}
        </h1>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); saveMut.mutate() }}
        className="space-y-5"
      >
        {/* Profile Photo */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Profile Photo <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-primary-100 flex-shrink-0 overflow-hidden border-2 border-primary-200">
              {form.avatarUrl
                ? <img src={form.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-3xl text-primary-300">
                    {form.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                  </div>
              }
            </div>
            <div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarSelect}
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
              >
                <Camera size={15} />
                {uploadingAvatar ? 'Uploading…' : form.avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or WebP · Max 5 MB</p>
            </div>
          </div>
        </div>

        {/* Gallery Photos */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Photo Gallery <span className="text-gray-400 font-normal text-sm">(up to 5 photos)</span></h2>
          <p className="text-xs text-gray-400 mb-3">Add more photos to improve your profile visibility</p>
          <div className="grid grid-cols-3 gap-3">
            {(form.galleryUrls ?? []).map((url, idx) => (
              <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                <img src={url} alt={`gallery ${idx + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryPhoto(idx)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            {(form.galleryUrls ?? []).length < 5 && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={uploadingGallery}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
              >
                {uploadingGallery ? (
                  <span className="text-xs">Uploading…</span>
                ) : (
                  <>
                    <Images size={20} />
                    <span className="text-xs">Add Photo</span>
                  </>
                )}
              </button>
            )}
          </div>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleGallerySelect}
          />
        </div>

        {/* Basic */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          <Field label="Full Name">
            <input className="input" value={form.fullName ?? ''} onChange={(e) => set('fullName', e.target.value)} placeholder="Your full name" />
          </Field>

          <Field label="Gender">
            <select className="input" value={form.gender ?? ''} onChange={(e) => set('gender', e.target.value as Gender)}>
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </Field>

          <Field label="Date of Birth">
            <input
              type="date"
              className="input"
              value={form.dateOfBirth ?? ''}
              max={new Date(Date.now() - 21 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              onChange={(e) => {
                const dob = e.target.value
                if (dob) {
                  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
                  if (age < 21) { toast.error('Minimum age is 21 years'); return }
                }
                set('dateOfBirth', dob)
              }}
            />
            <p className="text-xs text-gray-400 mt-1">Minimum age: 21 years</p>
          </Field>

          <Field label="Marital Status">
            <select className="input" value={form.maritalStatus ?? 'NEVER_MARRIED'} onChange={(e) => set('maritalStatus', e.target.value as MatrimonialStatus)}>
              <option value="NEVER_MARRIED">Never Married</option>
              <option value="DIVORCED">Divorced</option>
              <option value="WIDOWED">Widowed</option>
              <option value="SEPARATED">Separated</option>
            </select>
          </Field>
        </div>

        {/* Gotra & Religious */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Gotra & Community</h2>

          <Field label="Gotra">
            <select
              className="input"
              value={form.gotraId ?? ''}
              onChange={(e) => set('gotraId', e.target.value || null as any)}
            >
              <option value="">Select Gotra</option>
              {gotras?.map((g) => (
                <option key={g.id} value={g.id}>{g.name}{g.nameHindi ? ` (${g.nameHindi})` : ''}</option>
              ))}
            </select>
          </Field>

          <Field label="Manglik">
            <select className="input" value={form.manglik ?? 'NO'} onChange={(e) => set('manglik', e.target.value as any)}>
              <option value="NO">No</option>
              <option value="YES">Yes</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </Field>
        </div>

        {/* Education & Career */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Education & Career</h2>

          <Field label="Education Level">
            <select className="input" value={form.educationLevel ?? ''} onChange={(e) => set('educationLevel', e.target.value as EducationLevel)}>
              <option value="">Select</option>
              {[
                { v: 'BELOW_10TH', l: 'Below 10th' },
                { v: 'TENTH', l: '10th Pass' },
                { v: 'TWELFTH', l: '12th Pass' },
                { v: 'GRADUATE', l: 'Graduate (B.A / B.Sc / B.Com / B.Tech etc.)' },
                { v: 'POST_GRADUATE', l: 'Post Graduate (M.A / M.Sc / MBA etc.)' },
                { v: 'DOCTORATE', l: 'Doctorate (PhD)' },
              ].map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>

          <Field label="College / School Name">
            <input className="input" value={form.educationDetail ?? ''} onChange={(e) => set('educationDetail', e.target.value)} placeholder="e.g., IIT Delhi, St. Mary's School" />
          </Field>

          <Field label="Occupation">
            <select className="input" value={form.occupation ?? ''} onChange={(e) => set('occupation', e.target.value as Occupation)}>
              <option value="">Select</option>
              {[
                { v: 'FARMER', l: 'Farmer / Agriculture' },
                { v: 'BUSINESS', l: 'Business / Self-employed' },
                { v: 'GOVERNMENT_JOB', l: 'Government Job' },
                { v: 'PRIVATE_JOB', l: 'Private Job / Corporate' },
                { v: 'SELF_EMPLOYED', l: 'Professional (Doctor / Lawyer / CA etc.)' },
                { v: 'STUDENT', l: 'Student' },
                { v: 'OTHER', l: 'Other' },
              ].map(({ v, l }) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Field>

          <Field label="Job Title / Role">
            <input className="input" value={form.occupationDetail ?? ''} onChange={(e) => set('occupationDetail', e.target.value)} placeholder="e.g., Software Engineer, Inspector, Doctor" />
          </Field>

          <Field label="Company / Organization">
            <input className="input" value={form.companyName ?? ''} onChange={(e) => set('companyName', e.target.value)} placeholder="e.g., TCS, CRPF, Self-employed" />
          </Field>

          <Field label="Annual Income (LPA)">
            <input type="number" className="input" value={form.annualIncomeLpa ?? ''} onChange={(e) => set('annualIncomeLpa', parseFloat(e.target.value) as any)} placeholder="e.g., 5.5" />
          </Field>
        </div>

        {/* Physical */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Physical Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Height">
              {(() => {
                const totalIn = form.heightCm ? Math.round(form.heightCm / 2.54) : null
                const dispFt  = totalIn != null ? Math.floor(totalIn / 12) : ''
                const dispIn  = totalIn != null ? totalIn % 12 : ''
                return (
                  <div className="flex gap-2">
                    <select
                      className="input"
                      value={dispFt}
                      onChange={(e) => {
                        const ft = parseInt(e.target.value)
                        if (isNaN(ft)) { set('heightCm', null as any); return }
                        const inVal = typeof dispIn === 'number' ? dispIn : 0
                        set('heightCm', Math.round((ft * 12 + inVal) * 2.54) as any)
                      }}
                    >
                      <option value="">Select feet</option>
                      {[4,5,6,7].map(f => <option key={f} value={f}>{f} ft</option>)}
                    </select>
                    <select
                      className="input"
                      value={dispIn}
                      onChange={(e) => {
                        const inch = parseInt(e.target.value)
                        if (isNaN(inch)) return
                        const ftVal = typeof dispFt === 'number' ? dispFt : 5
                        set('heightCm', Math.round((ftVal * 12 + inch) * 2.54) as any)
                      }}
                    >
                      <option value="">Select inches</option>
                      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                        <option key={i} value={i}>{i} inch{i !== 1 ? 'es' : ''}</option>
                      ))}
                    </select>
                  </div>
                )
              })()}
              {form.heightCm ? <p className="text-xs text-gray-400 mt-1">{form.heightCm} cm</p> : null}
            </Field>
            <Field label="Weight (kg)">
              <input type="number" className="input" value={form.weightKg ?? ''} onChange={(e) => set('weightKg', parseInt(e.target.value) as any)} placeholder="e.g., 65" />
            </Field>
          </div>
        </div>

        {/* About */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">About Me</h2>
          <Field label="About Me">
            <textarea className="input" rows={3} value={form.aboutMe ?? ''} onChange={(e) => set('aboutMe', e.target.value)} placeholder="Tell about yourself..." />
          </Field>
        </div>

        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Partner Expectations</h2>
          <Field label="What you're looking for">
            <textarea className="input" rows={3} value={form.partnerExpectations ?? ''} onChange={(e) => set('partnerExpectations', e.target.value)} placeholder="Describe your ideal partner..." />
          </Field>
        </div>

        <button type="submit" disabled={saveMut.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
          <Save size={16} />
          {saveMut.isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
