import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

type Step = 'phone' | 'otp'

export default function LoginPage() {
  const navigate = useNavigate()
  const setTokens = useAuthStore((s) => s.setTokens)

  const [step, setStep] = useState<Step>('phone')
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
      const { accessToken, refreshToken, userId } = res.data.data
      setTokens(accessToken, refreshToken, userId)
      toast.success('Welcome!')
      navigate('/dashboard')
    } catch {
      toast.error('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-saffron-400/10 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-600 mb-4">
            <Heart className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Ahirwal Matrimony</h1>
          <p className="text-gray-500 mt-1 text-sm">Find your perfect match within the community</p>
        </div>

        <div className="card p-8">
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Enter your phone</h2>
                <p className="text-sm text-gray-500 mb-4">We'll send an OTP to verify your number</p>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                    +91
                  </span>
                  <input
                    type="tel"
                    className="input rounded-l-none"
                    placeholder="10-digit mobile number"
                    value={phone.replace('+91', '')}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    maxLength={10}
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading || phone.replace('+91','').length !== 10}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Enter OTP</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Sent to {phone}. &nbsp;
                  <button type="button" className="text-primary-600 hover:underline" onClick={() => setStep('phone')}>
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
              <button type="submit" className="btn-primary w-full" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying…' : 'Verify OTP'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
