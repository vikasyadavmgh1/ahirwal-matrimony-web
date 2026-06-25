// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  userId: string
  isNewUser: boolean
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

// ─── User / Profile ───────────────────────────────────────────────────────────
export type Gender = 'MALE' | 'FEMALE'
export type ProfileVisibility = 'PUBLIC' | 'CONTACTS_ONLY' | 'HIDDEN'
export type ManglikStatus = 'YES' | 'NO' | 'PARTIAL'
export type EducationLevel = 'BELOW_10TH' | 'TENTH' | 'TWELFTH' | 'GRADUATE' | 'POST_GRADUATE' | 'DOCTORATE'
export type Occupation = 'FARMER' | 'BUSINESS' | 'GOVERNMENT_JOB' | 'PRIVATE_JOB' | 'SELF_EMPLOYED' | 'STUDENT' | 'OTHER'
export type MatrimonialStatus = 'NEVER_MARRIED' | 'DIVORCED' | 'WIDOWED' | 'SEPARATED'

export interface Gotra {
  id: string
  name: string
  nameHindi: string | null
}

export interface Location {
  id: string
  village: string | null
  tehsil: string
  district: string
  state: string
}

export interface ProfileDTO {
  id: string
  userId: string
  fullName: string | null
  fullNameHindi: string | null
  gender: Gender | null
  dateOfBirth: string | null
  age: number
  profileFor: string
  gotraId: string | null
  gotraName: string | null
  gotraCustom: string | null
  motherGotraId: string | null
  motherGotraName: string | null
  motherGotraCustom: string | null
  grandmotherGotraId: string | null
  grandmotherGotraName: string | null
  grandmotherGotraCustom: string | null
  kuldevi: string | null
  nativeDistrict: string | null
  nativeTehsil: string | null
  nativeState: string | null
  nativeVillage: string | null
  currentCity: string | null
  address: string | null
  heightCm: number | null
  weightKg: number | null
  complexion: string
  bodyType: string
  disability: string | null
  educationLevel: EducationLevel | null
  educationDetail: string | null
  occupation: Occupation | null
  occupationDetail: string | null
  companyName: string | null
  annualIncomeLpa: number | null
  fatherName: string | null
  fatherOccupation: string | null
  motherName: string | null
  siblingsCount: number | null
  familyType: string
  familyStatus: string
  landAcres: number | null
  manglik: ManglikStatus
  horoscopeMatchReq: boolean
  rashi: string | null
  nakshatra: string | null
  diet: string
  smoking: string
  drinking: string
  maritalStatus: MatrimonialStatus
  aboutMe: string | null
  partnerExpectations: string | null
  avatarUrl: string | null
  avatarApproved: boolean
  galleryUrls: string[] | null
  videoUrl: string | null
  prefMinAge: number | null
  prefMaxAge: number | null
  prefMinHeightCm: number | null
  prefMaxHeightCm: number | null
  prefEducation: EducationLevel | null
  prefOccupation: string[] | null
  prefDistricts: string[] | null
  prefMotherGotraId: string | null
  prefExcludeMotherGotra: boolean
  profileCompletePct: number
  isVerified: boolean
  isPremium: boolean
  visibility: ProfileVisibility
  lastActiveAt: string | null
  createdAt: string | null
  updatedAt: string | null
}

// ─── Match ────────────────────────────────────────────────────────────────────
export interface MatchResultDTO {
  profile: ProfileDTO
  matchScore: number
  matchedFields: string[]
}

// ─── Interest ─────────────────────────────────────────────────────────────────
export type InterestStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED'

export interface InterestResponse {
  id: string
  senderPhone: string | null
  senderName: string | null
  receiverId: string | null
  status: InterestStatus
  message: string | null
  matchId: string | null
  createdAt: string
  updatedAt: string
}

// ─── Shortlist ────────────────────────────────────────────────────────────────
// API returns full ProfileDTO objects for each shortlisted profile
export type ShortlistEntry = ProfileDTO

// ─── Subscription ─────────────────────────────────────────────────────────────
export interface PlanDTO {
  id: string
  name: string
  displayName: string
  priceInr: number
  durationDays: number
  features: Record<string, unknown>
}

export interface SubscriptionResponse {
  status: string
  planName: string | null
  expiresAt: string | null
  razorpayOrderId: string | null
}

export interface RazorpayOrderResponse {
  orderId: string
  currency: string
  amountInr: number
}

// ─── Chat ─────────────────────────────────────────────────────────────────────
export interface ConversationDTO {
  conversationId: string
  matchId: string
  otherUserName: string | null
  otherUserAvatar: string | null
  lastMessage: string | null
  lastMessageAt: string | null
  unreadCount: number
}

export interface ChatMessage {
  id: string
  senderId: string
  content: string
  type: string
  sentAt: string        // backend field name (was createdAt, renamed to sentAt)
  readAt: string | null
}

// ─── Master data ──────────────────────────────────────────────────────────────
export interface GotraOption {
  id: string
  name: string
  nameHindi: string | null
}

// ─── API wrapper ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
  timestamp: string
}
