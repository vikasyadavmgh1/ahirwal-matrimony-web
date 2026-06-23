import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ChevronLeft, Save, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { profileApi } from '../../api/profile'
import { masterApi } from '../../api/master'
import type { ProfileDTO, Gender, EducationLevel, Occupation, MatrimonialStatus } from '../../types'

export default function EditProfilePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const isNewUser = searchParams.get('new') === '1'
  const qc = useQueryClient()

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
        {/* Basic */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Basic Information</h2>

          <Field label="Full Name">
            <input className="input" value={form.fullName ?? ''} onChange={(e) => set('fullName', e.target.value)} placeholder="Your full name" />
          </Field>

          <Field label="Full Name (Hindi)">
            <input className="input" value={form.fullNameHindi ?? ''} onChange={(e) => set('fullNameHindi', e.target.value)} placeholder="हिंदी में नाम" />
          </Field>

          <Field label="Gender">
            <select className="input" value={form.gender ?? ''} onChange={(e) => set('gender', e.target.value as Gender)}>
              <option value="">Select gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </Field>

          <Field label="Date of Birth">
            <input type="date" className="input" value={form.dateOfBirth ?? ''} onChange={(e) => set('dateOfBirth', e.target.value)} />
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

          <Field label="Kuldevi">
            <input className="input" value={form.kuldevi ?? ''} onChange={(e) => set('kuldevi', e.target.value)} placeholder="e.g., Sachiya Mata" />
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
              {['BELOW_10TH', 'TENTH', 'TWELFTH', 'GRADUATE', 'POST_GRADUATE', 'DOCTORATE'].map((l) => (
                <option key={l} value={l}>{l.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </Field>

          <Field label="Occupation">
            <select className="input" value={form.occupation ?? ''} onChange={(e) => set('occupation', e.target.value as Occupation)}>
              <option value="">Select</option>
              {['FARMER', 'BUSINESS', 'GOVERNMENT_JOB', 'PRIVATE_JOB', 'SELF_EMPLOYED', 'STUDENT', 'OTHER'].map((o) => (
                <option key={o} value={o}>{o.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </Field>

          <Field label="Annual Income (LPA)">
            <input type="number" className="input" value={form.annualIncomeLpa ?? ''} onChange={(e) => set('annualIncomeLpa', parseFloat(e.target.value) as any)} placeholder="e.g., 5.5" />
          </Field>
        </div>

        {/* Physical */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Physical Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Height (cm)">
              <input type="number" className="input" value={form.heightCm ?? ''} onChange={(e) => set('heightCm', parseInt(e.target.value) as any)} placeholder="e.g., 170" />
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
