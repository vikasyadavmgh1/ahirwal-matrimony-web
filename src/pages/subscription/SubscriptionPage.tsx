import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Crown, Zap, Star, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { subscriptionsApi, type PlanDTO, type OrderResponse } from '../../api/subscriptions'
import { openRazorpayCheckout } from '../../utils/razorpay'

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

export default function SubscriptionPage() {
  const qc = useQueryClient()
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null)

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => subscriptionsApi.getPlans().then((r) => r.data.data as PlanDTO[]),
  })

  const { data: mySubscription } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionsApi.getMySubscription().then((r) => r.data.data),
  })

  const isPremium = mySubscription?.status === 'ACTIVE'

  const verifyMut = useMutation({
    mutationFn: (v: { orderId: string; paymentId: string; signature: string }) =>
      subscriptionsApi.verifyPayment(v.orderId, v.paymentId, v.signature),
    onSuccess: () => {
      toast.success("Payment successful — you're Premium!")
      qc.invalidateQueries({ queryKey: ['my-subscription'] })
    },
    onError: () => toast.error('Payment verification failed. If you were charged, contact support.'),
    onSettled: () => setPayingPlanId(null),
  })

  async function startPayment(plan: PlanDTO) {
    setPayingPlanId(plan.id)
    try {
      const order: OrderResponse = await subscriptionsApi
        .createOrder(plan.id)
        .then((r) => r.data.data)

      await openRazorpayCheckout({
        keyId: order.keyId,
        orderId: order.orderId,
        amount: order.amount,
        currency: order.currency,
        name: 'Ahirwal Matrimony',
        description: `${plan.displayName} plan · ${durationLabel(plan.durationDays)}`,
        onSuccess: (res) =>
          verifyMut.mutate({
            orderId: res.razorpay_order_id,
            paymentId: res.razorpay_payment_id,
            signature: res.razorpay_signature,
          }),
        onDismiss: () => setPayingPlanId(null),
      })
    } catch {
      toast.error('Could not start payment. Please try again.')
      setPayingPlanId(null)
    }
  }

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
            const isPaying = payingPlanId === plan.id

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
                  onClick={() => startPayment(plan)}
                  disabled={isPremium || isPaying || verifyMut.isPending}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all ${
                    isPremium
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : meta.badge ? 'btn-primary' : 'btn-secondary'
                  }`}
                >
                  {isPaying ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Opening payment…
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
    </div>
  )
}
