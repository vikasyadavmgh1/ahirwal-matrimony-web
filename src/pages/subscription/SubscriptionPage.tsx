import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Crown, Zap, Star, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { subscriptionsApi, type PlanDTO, type OrderResponse } from '../../api/subscriptions'

const PLAN_META: Record<string, { icon: React.ReactNode; color: string; badge?: string }> = {
  SILVER: { icon: <Star size={20} />, color: 'text-gray-500' },
  GOLD:   { icon: <Crown size={20} />, color: 'text-amber-500', badge: 'Most Popular' },
  PLATINUM: { icon: <Zap size={20} />, color: 'text-purple-500' },
}

const FEATURE_LABELS: Record<string, string> = {
  unlimitedInterests: 'Unlimited interests',
  priorityBrowse:     'Priority in browse results',
  seeWhoLiked:        'See who liked you',
  verifiedBadge:      'Verified badge on profile',
}

function durationLabel(days: number) {
  if (days >= 365) return '1 year'
  if (days >= 180) return '6 months'
  return '1 month'
}

function MockPaymentModal({
  plan, order, onSuccess, onClose,
}: {
  plan: PlanDTO; order: OrderResponse; onSuccess: () => void; onClose: () => void
}) {
  const qc = useQueryClient()
  const [step, setStep] = useState<'confirm' | 'processing' | 'done'>('confirm')

  const verifyMut = useMutation({
    mutationFn: () =>
      subscriptionsApi.verifyPayment(order.orderId, `mock_pay_${Date.now()}`, 'mock_signature'),
    onSuccess: () => { setStep('done'); qc.invalidateQueries({ queryKey: ['my-subscription'] }) },
    onError: () => toast.error('Payment verification failed'),
  })

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={step === 'confirm' ? onClose : undefined} />
      <div className="relative bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-sm p-6 shadow-float">

        {step === 'confirm' && (
          <>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-1">Demo mode</p>
            <h2 className="text-lg font-black text-gray-900 mb-1">Confirm Subscription</h2>
            <p className="text-sm text-gray-500 mb-5">
              No real payment — Razorpay keys not yet configured.
            </p>
            <div className="bg-gray-50 rounded-2xl p-4 mb-5 flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-900">{plan.displayName} Plan</p>
                <p className="text-sm text-gray-500">{durationLabel(plan.durationDays)}</p>
              </div>
              <p className="text-2xl font-black text-gray-900">₹{plan.priceInr}</p>
            </div>
            <button
              onClick={() => { setStep('processing'); verifyMut.mutate() }}
              className="btn-primary w-full py-3.5"
            >
              Activate {plan.displayName} (Demo)
            </button>
          </>
        )}

        {step === 'processing' && (
          <div className="flex flex-col items-center py-10 gap-4">
            <Loader2 size={36} className="animate-spin text-primary-500" />
            <p className="font-bold text-gray-700">Activating subscription…</p>
          </div>
        )}

        {step === 'done' && (
          <div className="flex flex-col items-center py-8 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <Check size={28} className="text-green-600" />
            </div>
            <div>
              <p className="text-xl font-black text-gray-900">You're Premium!</p>
              <p className="text-sm text-gray-500 mt-1">
                {plan.displayName} active for {durationLabel(plan.durationDays)}.
              </p>
            </div>
            <button onClick={onSuccess} className="btn-primary w-full py-3">Continue</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SubscriptionPage() {
  const qc = useQueryClient()
  const [selectedPlan, setSelectedPlan] = useState<PlanDTO | null>(null)
  const [activeOrder, setActiveOrder] = useState<OrderResponse | null>(null)

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.getPlans().then((r) => r.data.data as PlanDTO[]),
  })

  const { data: mySubscription } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionsApi.getMySubscription().then((r) => r.data.data),
  })

  const createOrderMut = useMutation({
    mutationFn: (planId: string) => subscriptionsApi.createOrder(planId).then((r) => r.data.data),
    onSuccess: (order) => setActiveOrder(order),
    onError: () => toast.error('Could not initiate payment. Try again.'),
  })

  const isPremium = mySubscription?.status === 'ACTIVE'

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 text-sm font-bold px-4 py-1.5 rounded-full mb-4">
          <Crown size={14} className="fill-amber-600" /> Premium Plans
        </div>
        <h1 className="text-3xl font-black text-gray-900">Upgrade your account</h1>
        <p className="text-gray-500 mt-2">Unlock more connections with a premium plan</p>
      </div>

      {/* Active subscription banner */}
      {isPremium && (
        <div className="card p-4 mb-6 bg-green-50 border border-green-200 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
            <Check size={18} className="text-green-600" />
          </div>
          <div>
            <p className="font-bold text-green-800">Active subscription</p>
            <p className="text-sm text-green-600">
              {mySubscription?.planName ?? 'Premium'} plan
              {mySubscription?.expiresAt &&
                ` · expires ${new Date(mySubscription.expiresAt).toLocaleDateString('en-IN')}`}
            </p>
          </div>
        </div>
      )}

      {/* Plan cards */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 bg-gray-100 rounded-3xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map((plan) => {
            const meta = PLAN_META[plan.name] ?? { icon: <Star size={20} />, color: 'text-gray-500' }
            const features = Object.entries(plan.features)
              .filter(([, v]) => v === true)
              .map(([k]) => FEATURE_LABELS[k] ?? k)
            const isCreating = createOrderMut.isPending && selectedPlan?.id === plan.id

            return (
              <div key={plan.id} className={`card p-5 relative ${meta.badge ? 'ring-2 ring-primary-400' : ''}`}>
                {meta.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {meta.badge}
                  </span>
                )}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <span className={meta.color}>{meta.icon}</span>
                    <div>
                      <h3 className="font-black text-gray-900 text-lg">{plan.displayName}</h3>
                      <p className="text-xs text-gray-400">{durationLabel(plan.durationDays)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-gray-900">₹{plan.priceInr}</p>
                    <p className="text-xs text-gray-400">
                      ₹{Math.round(plan.priceInr / (plan.durationDays / 30))}/mo
                    </p>
                  </div>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <Check size={14} className="text-green-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => { setSelectedPlan(plan); createOrderMut.mutate(plan.id) }}
                  disabled={isPremium || isCreating}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
                    isPremium
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : meta.badge ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Preparing…
                    </span>
                  ) : isPremium ? 'Currently subscribed' : `Get ${plan.displayName}`}
                </button>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center mt-6">
        Plans auto-renew. Cancel anytime. Secure payments via Razorpay.
      </p>

      {activeOrder && selectedPlan && (
        <MockPaymentModal
          plan={selectedPlan}
          order={activeOrder}
          onSuccess={() => {
            setActiveOrder(null); setSelectedPlan(null)
            qc.invalidateQueries({ queryKey: ['my-subscription'] })
          }}
          onClose={() => { setActiveOrder(null); setSelectedPlan(null) }}
        />
      )}
    </div>
  )
}
