import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Camera, ChevronLeft, Save, Sparkles } from 'lucide-react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5 MB'); return }

    setUploadingPhoto(true)
    try {
      // Get presigned URL from backend (pass file MIME type so backend picks right extension)
      const { data: presignData } = await profileApi.avatarPresignedUrl(file.type)
      const { uploadUrl, downloadUrl } = presignData.data

      // Upload directly to S3 (no auth header — presigned URL handles auth)
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        withCredentials: false,
      })

      // Save the avatar URL on the profile
      set('avatarUrl', downloadUrl)
      toast.success('Photo uploaded! Save profile to confirm.')
    } catch {
      toast.error('Photo upload failed. Please try again.')
    } finally {
      setUploadingPhoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
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

  // Backend expects gotraId/prefMotherGotraId as plain UUID strings, not full objects
  const buildPayload = () => ({
    ...form,
    gotraId: (form.gotraId as any)?.id ?? form.gotraId ?? null,
    prefMotherGotraId: (form.prefMotherGotraId as any)?.id ?? form.prefMotherGotraId ?? null,
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
      // Set cache directly so profile page shows immediately without a re-fetch lag
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
      {/* New user welcome banner */}
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
        {/* Photo upload */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Profile Photo <span className="text-gray-400 font-normal text-sm">(optional)</span></h2>
          <div className="flex items-center gap-4">
            {/* Avatar preview */}
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
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
              >
                <Camera size={15} />
                {uploadingPhoto ? 'Uploading…' : form.avatarUrl ? 'Change Photo' : 'Upload Photo'}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or WebP · Max 5 MB</p>
            </div>
          </div>
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
            <select className="input" value={(form.gotraId as any)?.id ?? ''} onChange={(e) => {
              const g = gotras?.find((g) => g.id === e.target.value)
              set('gotraId', g as any)
            }}>
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

          <Field label="Job Title / Role / Company">
            <input className="input" value={form.occupationDetail ?? ''} onChange={(e) => set('occupationDetail', e.target.value)} placeholder="e.g., Software Engineer at TCS, Constable, Own shop" />
          </Field>

          <Field label="Annual Income (LPA)">
            <input type="number" className="input" value={form.annualIncomeLpa ?? ''} onChange={(e) => set('annualIncomeLpa', parseFloat(e.target.value) as any)} placeholder="e.g., 5.5" />
          </Field>
        </div>

        {/* Physical */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Physical Details</h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Height: ft/in display, cm stored.
                Fix: use Math.round(cm/2.54) to get total inches first,
                then split — avoids float rounding making 5ft→4ft */}
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
          <h2 className="font-semibold text-gray-900">About & Expectations</h2>
          <Field label="About Me">
            <textarea className="input" rows={3} value={form.aboutMe ?? ''} onChange={(e) => set('aboutMe', e.target.value)} placeholder="Tell about yourself..." />
          </Field>
          <Field label="Partner Expectations">
            <textarea className="input" rows={3} value={form.partnerExpectations ?? ''} onChange={(e) => set('partnerExpectations', e.target.value)} placeholder="What you're looking for..." />
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
