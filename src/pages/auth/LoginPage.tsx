import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

type Step = 'phone' | 'otp'

const COMMUNITY_ACK_KEY = 'ahirwal_community_ack'

export default function LoginPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)

  const [step, setStep] = useState<Step>('phone')
  const [showAck, setShowAck] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem(COMMUNITY_ACK_KEY)) {
      setShowAck(true)
    }
  }, [])

  const dismissAck = () => {
    sessionStorage.setItem(COMMUNITY_ACK_KEY, '1')
    setShowAck(false)
  }
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    const normalized = phone.startsWith('+91') ? phone : `+91${phone}`
    setLoading(true)
    try {
      await authApi.sendOtp(normalized)
      toast.success('OTP sent!')
      setPhone(normalized)
      setStep('otp')
    } catch {
      toast.error('Could not send OTP. Check the number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.verifyOtp(phone, otp)
      const { accessToken, refreshToken, userId, isNewUser } = res.data.data
      setTokens(accessToken, refreshToken, userId)
      if (isNewUser) {
        toast.success('Welcome! Please complete your profile.')
        navigate('/profile/edit?new=1')
      } else {
        toast.success('Welcome back!')
        navigate('/dashboard')
      }
    } catch {
      toast.error('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const trustSignals = [
    { emoji: '🙏', text: 'Community verified' },
    { emoji: '💍', text: 'Trusted by Ahirwal families' },
    { emoji: '🔒', text: 'Private & secure' },
  ]

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Community acknowledgement modal */}
      {showAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 flex flex-col items-center text-center gap-5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-saffron-500 flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">Ahirwal Matrimony</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                This platform is exclusively for{' '}
                <span className="font-semibold text-gray-800">Yadavs (Ahirs) of the Ahirwal region</span>
                {' '}— including families from
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {['Delhi', 'Haryana', 'Rajasthan', 'NCR Region'].map((region) => (
                <span
                  key={region}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full border border-primary-100"
                >
                  <MapPin size={10} />
                  {region}
                </span>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              By continuing, you confirm that you belong to the Ahirwal Yadav (Ahir) community.
            </p>
            <button
              onClick={dismissAck}
              className="btn-primary w-full"
            >
              I belong to this community
            </button>
          </div>
        </div>
      )}
      {/* Left panel — brand (desktop) / top strip (mobile) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-800 via-primary-700 to-saffron-500/80 md:w-2/5 h-48 md:h-auto flex-shrink-0">
        {/* Decorative circles */}
        <div className="absolute -top-10 -left-10 w-52 h-52 rounded-full bg-white/10" />
        <div className="absolute top-16 -right-12 w-40 h-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 left-8 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-8 right-4 w-20 h-20 rounded-full bg-white/10" />
        <div className="absolute top-4 left-1/2 w-12 h-12 rounded-full bg-white/10" />

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-8 text-center md:justify-center gap-4">
          {/* Logo circle */}
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <Heart className="w-7 h-7 text-white fill-white" />
          </div>

          <div>
            <h1 className="text-white text-xl font-bold leading-tight">Ahirwal Matrimony</h1>
            <p className="text-white/80 text-sm mt-0.5">शुभ विवाह</p>
          </div>

          {/* Trust signals — hidden on mobile to save space */}
          <ul className="hidden md:flex flex-col gap-3 mt-6 w-full max-w-xs">
            {trustSignals.map(({ emoji, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/90 text-sm">
                <span className="text-base">{emoji}</span>
                <span>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 bg-white flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">
          {/* Mobile: small logo + tagline above form */}
          <div className="md:hidden text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">Find your perfect match within the community</p>
          </div>

          {/* Desktop heading */}
          <div className="hidden md:block mb-8">
            <h2 className="text-3xl font-black text-gray-900">Sign in</h2>
            <p className="text-gray-500 text-sm mt-1.5">Find your perfect match within the Ahirwal community</p>
          </div>

          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mobile Number</label>
                <div className="flex rounded-2xl overflow-hidden border-2 border-gray-200 bg-white focus-within:border-primary-400 focus-within:ring-4 focus-within:ring-primary-100 transition-all shadow-soft">
                  <span className="inline-flex items-center px-4 bg-gray-50 text-gray-500 text-sm font-bold border-r-2 border-gray-200 flex-shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    className="flex-1 bg-transparent px-4 py-3.5 text-sm font-medium text-gray-900 placeholder-gray-400 focus:outline-none"
                    placeholder="10-digit mobile number"
                    value={phone.replace('+91', '')}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading || phone.replace('+91', '').length !== 10}
              >
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                <p className="text-sm text-gray-500 mb-3">
                  Sent to {phone}.{' '}
                  <button
                    type="button"
                    className="text-primary-600 hover:underline font-medium"
                    onClick={() => setStep('phone')}
                  >
                    Change
                  </button>
                </p>
                <input
                  type="text"
                  className="input text-center text-2xl tracking-widest font-mono"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={loading || otp.length !== 6}
              >
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
            </form>
          )}

          <p className="text-center text-xs text-gray-400 mt-8">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
