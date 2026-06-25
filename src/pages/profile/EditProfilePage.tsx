import { useEffect, useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Camera, ChevronLeft, Images, Save, Sparkles, X,
  User, Heart, MapPin, GraduationCap, Briefcase, Users, Leaf,
} from 'lucide-react'
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

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
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
      await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type }, withCredentials: false })
      set('avatarUrl', downloadUrl)
      toast.success('Photo uploaded! Save profile to confirm.')
    } catch (err: any) {
      toast.error(`Photo upload failed: ${err?.response?.data?.message ?? err?.message ?? 'Unknown error'}`)
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
    if ((form.galleryUrls ?? []).length >= 5) {
      toast.error('Maximum 5 gallery photos allowed')
      return
    }
    setUploadingGallery(true)
    try {
      const { data: presignData } = await profileApi.galleryPresignedUrl(file.type)
      const { uploadUrl, downloadUrl } = presignData.data
      await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type }, withCredentials: false })
      const { data: updatedProfile } = await profileApi.addGalleryPhoto(downloadUrl)
      if (!updatedProfile?.data) throw new Error('Please save your profile first before adding gallery photos')
      qc.setQueryData(['profile', 'me'], updatedProfile.data)
      set('galleryUrls', updatedProfile.data.galleryUrls ?? [])
      toast.success('Gallery photo added!')
    } catch (err: any) {
      toast.error(`Gallery upload failed: ${err?.response?.data?.message ?? err?.message ?? 'Unknown error'}`)
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
  const [isCustomGotra, setIsCustomGotra] = useState(false)
  const [isCustomMotherGotra, setIsCustomMotherGotra] = useState(false)
  const [isCustomGrandmotherGotra, setIsCustomGrandmotherGotra] = useState(false)

  useEffect(() => {
    if (existingProfile) {
      setForm(existingProfile)
      setIsCustomGotra(!existingProfile.gotraId && !!existingProfile.gotraCustom)
      setIsCustomMotherGotra(!existingProfile.motherGotraId && !!existingProfile.motherGotraCustom)
      setIsCustomGrandmotherGotra(!existingProfile.grandmotherGotraId && !!existingProfile.grandmotherGotraCustom)
    }
  }, [existingProfile])

  const set = <K extends keyof ProfileDTO>(k: K, v: ProfileDTO[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const buildPayload = () => ({
    ...form,
    gotraId: isCustomGotra ? null : (form.gotraId ?? null),
    gotraCustom: isCustomGotra ? (form.gotraCustom ?? null) : null,
    motherGotraId: isCustomMotherGotra ? null : (form.motherGotraId ?? null),
    motherGotraCustom: isCustomMotherGotra ? (form.motherGotraCustom ?? null) : null,
    grandmotherGotraId: isCustomGrandmotherGotra ? null : (form.grandmotherGotraId ?? null),
    grandmotherGotraCustom: isCustomGrandmotherGotra ? (form.grandmotherGotraCustom ?? null) : null,
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
      toast.error(e?.response?.data?.message ?? 'Failed to save profile')
    },
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {isNewUser && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl p-5 mb-6 flex items-start gap-3 shadow-sm">
          <Sparkles size={20} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Welcome to Ahirwal Matrimony! 🙏</p>
            <p className="text-primary-100 text-sm mt-0.5">Complete your profile so potential matches can find you. The more you fill, the better your matches.</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mb-6">
        {!isNewUser && (
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors">
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {existingProfile ? 'Edit Profile' : 'Create Profile'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">Fill in your details to attract the right match</p>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate() }} className="space-y-4">

        {/* Profile Photo */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-rose-50 to-white">
            <div className="section-icon bg-primary-100">
              <Camera size={15} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Profile Photo</h2>
              <p className="text-xs text-gray-400">Your main photo shown to matches</p>
            </div>
          </div>
          <div className="section-body">
            <div className="flex items-center gap-5">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 overflow-hidden border-2 border-white shadow-md">
                  {form.avatarUrl
                    ? <img src={form.avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl text-primary-300">
                        {form.fullName?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                  }
                </div>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white shadow-sm hover:bg-primary-700 transition-colors"
                >
                  <Camera size={13} />
                </button>
              </div>
              <div>
                <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarSelect} />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  {uploadingAvatar ? 'Uploading…' : form.avatarUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                <p className="text-xs text-gray-400 mt-2">JPG, PNG or WebP · Max 5 MB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Gallery Photos */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-rose-50 to-white">
            <div className="section-icon bg-primary-100">
              <Images size={15} className="text-primary-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Photo Gallery</h2>
              <p className="text-xs text-gray-400">Add up to 5 photos to boost visibility</p>
            </div>
          </div>
          <div className="section-body">
            <div className="grid grid-cols-3 gap-3">
              {(form.galleryUrls ?? []).map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 shadow-sm group">
                  <img src={url} alt={`gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryPhoto(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {(form.galleryUrls ?? []).length < 5 && (
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  disabled={uploadingGallery}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                >
                  {uploadingGallery
                    ? <span className="text-xs">Uploading…</span>
                    : <><Images size={20} /><span className="text-xs font-medium">Add Photo</span></>
                  }
                </button>
              )}
            </div>
            <input ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleGallerySelect} />
          </div>
        </div>

        {/* Basic Info */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-blue-50 to-white">
            <div className="section-icon bg-blue-100">
              <User size={15} className="text-blue-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">Basic Information</h2>
          </div>
          <div className="section-body">
            <Field label="Full Name">
              <input className="input" value={form.fullName ?? ''} onChange={(e) => set('fullName', e.target.value)} placeholder="Your full name" />
            </Field>
            <Field label="Full Name (Hindi)" optional>
              <input className="input" value={form.fullNameHindi ?? ''} onChange={(e) => set('fullNameHindi', e.target.value)} placeholder="हिंदी में नाम" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Gender">
                <select className="input" value={form.gender ?? ''} onChange={(e) => set('gender', e.target.value as Gender)}>
                  <option value="">Select</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
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
              <p className="text-xs text-gray-400 mt-1.5">Minimum age: 21 years</p>
            </Field>
          </div>
        </div>

        {/* Gotra & Community */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-orange-50 to-white">
            <div className="section-icon bg-orange-100">
              <Heart size={15} className="text-orange-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">Gotra & Community</h2>
          </div>
          <div className="section-body">
            <Field label="Your Gotra">
              <GotraPicker
                label="Your Gotra"
                gotras={gotras}
                selectedId={isCustomGotra ? '__custom__' : (form.gotraId ?? '')}
                customValue={form.gotraCustom ?? ''}
                isCustom={isCustomGotra}
                onSelect={(val) => {
                  if (val === '__custom__') { setIsCustomGotra(true); set('gotraId', null as any) }
                  else { setIsCustomGotra(false); set('gotraCustom', null as any); set('gotraId', val || null as any) }
                }}
                onCustomChange={(val) => set('gotraCustom', val || null as any)}
              />
            </Field>
            <Field label="Mother's Gotra">
              <GotraPicker
                label="Mother's Gotra"
                gotras={gotras}
                selectedId={isCustomMotherGotra ? '__custom__' : (form.motherGotraId ?? '')}
                customValue={form.motherGotraCustom ?? ''}
                isCustom={isCustomMotherGotra}
                onSelect={(val) => {
                  if (val === '__custom__') { setIsCustomMotherGotra(true); set('motherGotraId', null as any) }
                  else { setIsCustomMotherGotra(false); set('motherGotraCustom', null as any); set('motherGotraId', val || null as any) }
                }}
                onCustomChange={(val) => set('motherGotraCustom', val || null as any)}
              />
            </Field>
            <Field label="Grandmother's Gotra">
              <GotraPicker
                label="Grandmother's Gotra"
                gotras={gotras}
                selectedId={isCustomGrandmotherGotra ? '__custom__' : (form.grandmotherGotraId ?? '')}
                customValue={form.grandmotherGotraCustom ?? ''}
                isCustom={isCustomGrandmotherGotra}
                onSelect={(val) => {
                  if (val === '__custom__') { setIsCustomGrandmotherGotra(true); set('grandmotherGotraId', null as any) }
                  else { setIsCustomGrandmotherGotra(false); set('grandmotherGotraCustom', null as any); set('grandmotherGotraId', val || null as any) }
                }}
                onCustomChange={(val) => set('grandmotherGotraCustom', val || null as any)}
              />
            </Field>
            <Field label="Kuldevi" optional>
              <input className="input" value={form.kuldevi ?? ''} onChange={(e) => set('kuldevi', e.target.value)} placeholder="e.g., Shila Mata, Bala Sundari" />
            </Field>
            <Field label="Manglik">
              <select className="input" value={form.manglik ?? 'NO'} onChange={(e) => set('manglik', e.target.value as any)}>
                <option value="NO">No</option>
                <option value="YES">Yes</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Location */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-green-50 to-white">
            <div className="section-icon bg-green-100">
              <MapPin size={15} className="text-green-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">Location</h2>
          </div>
          <div className="section-body">
            <Field label="Native Village" optional>
              <input className="input" value={form.nativeVillage ?? ''} onChange={(e) => set('nativeVillage', e.target.value || null as any)} placeholder="e.g., Dhanaunda, Bawal, Nangal Mundi" />
            </Field>
            <Field label="Current City">
              <input className="input" value={form.currentCity ?? ''} onChange={(e) => set('currentCity', e.target.value)} placeholder="e.g., Rewari, Gurugram, Delhi" />
            </Field>
            <Field label="Full Address" optional>
              <textarea className="input resize-none" rows={3} value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} placeholder="House no., street, village, tehsil…" />
            </Field>
          </div>
        </div>

        {/* Education & Career */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-indigo-50 to-white">
            <div className="section-icon bg-indigo-100">
              <GraduationCap size={15} className="text-indigo-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">Education & Career</h2>
          </div>
          <div className="section-body">
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
            <Field label="College / School Name" optional>
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
            <div className="grid grid-cols-2 gap-4">
              <Field label="Job Title / Role" optional>
                <input className="input" value={form.occupationDetail ?? ''} onChange={(e) => set('occupationDetail', e.target.value)} placeholder="e.g., Software Engineer" />
              </Field>
              <Field label="Company / Org" optional>
                <input className="input" value={form.companyName ?? ''} onChange={(e) => set('companyName', e.target.value)} placeholder="e.g., TCS, CRPF" />
              </Field>
            </div>
            <Field label="Annual Income (LPA)" optional>
              <input type="number" className="input" value={form.annualIncomeLpa ?? ''} onChange={(e) => set('annualIncomeLpa', parseFloat(e.target.value) as any)} placeholder="e.g., 5.5" />
            </Field>
          </div>
        </div>

        {/* Physical Details */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-teal-50 to-white">
            <div className="section-icon bg-teal-100">
              <Leaf size={15} className="text-teal-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">Physical Details</h2>
          </div>
          <div className="section-body">
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
                      <option value="">Feet</option>
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
                      <option value="">Inches</option>
                      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => (
                        <option key={i} value={i}>{i} in</option>
                      ))}
                    </select>
                  </div>
                )
              })()}
              {form.heightCm ? <p className="text-xs text-gray-400 mt-1.5">{form.heightCm} cm</p> : null}
            </Field>
            <Field label="Weight (kg)" optional>
              <input type="number" className="input" value={form.weightKg ?? ''} onChange={(e) => set('weightKg', parseInt(e.target.value) as any)} placeholder="e.g., 65" />
            </Field>
          </div>
        </div>

        {/* Family */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-amber-50 to-white">
            <div className="section-icon bg-amber-100">
              <Users size={15} className="text-amber-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">Family</h2>
          </div>
          <div className="section-body">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Father's Name" optional>
                <input className="input" value={form.fatherName ?? ''} onChange={(e) => set('fatherName', e.target.value)} placeholder="Father's full name" />
              </Field>
              <Field label="Father's Occupation" optional>
                <input className="input" value={form.fatherOccupation ?? ''} onChange={(e) => set('fatherOccupation', e.target.value)} placeholder="e.g., Farmer, Govt. Job" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Mother's Name" optional>
                <input className="input" value={form.motherName ?? ''} onChange={(e) => set('motherName', e.target.value)} placeholder="Mother's full name" />
              </Field>
              <Field label="Siblings Count" optional>
                <input type="number" className="input" value={form.siblingsCount ?? ''} onChange={(e) => set('siblingsCount', parseInt(e.target.value) as any)} placeholder="e.g., 2" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Family Type">
                <select className="input" value={form.familyType ?? 'JOINT'} onChange={(e) => set('familyType', e.target.value)}>
                  <option value="JOINT">Joint Family</option>
                  <option value="NUCLEAR">Nuclear Family</option>
                </select>
              </Field>
              <Field label="Land (Acres)" optional>
                <input type="number" className="input" value={form.landAcres ?? ''} onChange={(e) => set('landAcres', parseFloat(e.target.value) as any)} placeholder="e.g., 5" />
              </Field>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="section-card">
          <div className="section-header bg-gradient-to-r from-purple-50 to-white">
            <div className="section-icon bg-purple-100">
              <Briefcase size={15} className="text-purple-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">About & Expectations</h2>
          </div>
          <div className="section-body">
            <Field label="About Me">
              <textarea className="input resize-none" rows={4} value={form.aboutMe ?? ''} onChange={(e) => set('aboutMe', e.target.value)} placeholder="Tell something about yourself — your personality, hobbies, values…" />
            </Field>
            <Field label="Partner Expectations">
              <textarea className="input resize-none" rows={4} value={form.partnerExpectations ?? ''} onChange={(e) => set('partnerExpectations', e.target.value)} placeholder="Describe qualities you're looking for in a partner…" />
            </Field>
          </div>
        </div>

        <button
          type="submit"
          disabled={saveMut.isPending}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3.5"
        >
          <Save size={16} />
          {saveMut.isPending ? 'Saving…' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children, optional }: { label: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
        {optional && <span className="normal-case font-normal text-gray-400 ml-1">(optional)</span>}
      </label>
      {children}
    </div>
  )
}

interface GotraPickerProps {
  label: string
  gotras: { id: string; name: string; nameHindi: string | null }[] | undefined
  selectedId: string
  customValue: string
  isCustom: boolean
  onSelect: (val: string) => void
  onCustomChange: (val: string) => void
}

function GotraPicker({ gotras, selectedId, customValue, isCustom, onSelect, onCustomChange }: GotraPickerProps) {
  return (
    <>
      <select className="input" value={selectedId} onChange={(e) => onSelect(e.target.value)}>
        <option value="">Select Gotra</option>
        {gotras?.map((g) => (
          <option key={g.id} value={g.id}>{g.name}</option>
        ))}
        <option value="__custom__">Other (not in list)</option>
      </select>
      {isCustom && (
        <input
          className="input mt-2"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder="Enter gotra name"
          autoFocus
        />
      )}
    </>
  )
}
