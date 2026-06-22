import { useQuery, useMutation } from '@tanstack/react-query'
import { Crown, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import { subscriptionApi } from '../../api/subscription'

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}

export default function SubscriptionPage() {
  const { data: plans, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => subscriptionApi.getPlans().then((r) => r.data.data),
  })

  const { data: myPlan } = useQuery({
    queryKey: ['my-subscription'],
    queryFn: () => subscriptionApi.getMySubscription().then((r) => r.data.data),
  })

  const orderMut = useMutation({
    mutationFn: (planId: string) => subscriptionApi.createOrder(planId).then((r) => r.data.data),
    onSuccess: (order, _planId) => {
      // Load Razorpay checkout
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      document.body.appendChild(script)
      script.onload = () => {
        const rzp = new window.Razorpay({
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          order_id: order.orderId,
          currency: order.currency,
          amount: order.amountInr * 100,
          name: 'Ahirwal Matrimony',
          description: 'Premium Membership',
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            try {
              await subscriptionApi.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              )
              toast.success('🎉 You are now a Premium member!')
            } catch {
              toast.error('Payment verification failed')
            }
          },
        })
        rzp.open()
      }
    },
    onError: () => toast.error('Could not initiate payment'),
  })

  const isActive = myPlan?.status === 'ACTIVE'

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="text-center mb-8">
        <Crown className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
        <h1 className="text-2xl font-bold text-gray-900">Go Premium</h1>
        <p className="text-gray-500 mt-2">Unlock full access to connect with matches</p>
      </div>

      {isActive && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 mb-6 text-center">
          <p className="font-semibold">✓ You have an active {myPlan.planName} plan</p>
          {myPlan.expiresAt && (
            <p className="text-sm mt-1">Expires: {new Date(myPlan.expiresAt).toLocaleDateString('en-IN')}</p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-64 animate-pulse" />)}
        </div>
      ) : plans?.length ? (
        <div className="grid sm:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className={`card p-5 relative ${i === 1 ? 'ring-2 ring-primary-500 scale-105' : ''}`}
            >
              {i === 1 && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="font-bold text-gray-900 text-lg">{plan.displayName}</h3>
              <div className="flex items-end gap-1 my-3">
                <span className="text-3xl font-bold text-gray-900">₹{plan.priceInr}</span>
                <span className="text-gray-500 text-sm mb-1">/{plan.durationDays}d</span>
              </div>
              <ul className="space-y-2 mb-5">
                {Object.entries(plan.features ?? {}).map(([k]) => (
                  <li key={k} className="text-sm text-gray-600 flex items-center gap-2">
                    <Check size={14} className="text-green-500 flex-shrink-0" />
                    {k.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => orderMut.mutate(plan.id)}
                disabled={orderMut.isPending}
                className={`w-full ${i === 1 ? 'btn-primary' : 'btn-secondary'}`}
              >
                {isActive ? 'Switch Plan' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No plans available</p>
      )}
    </div>
  )
}
