// Loads Razorpay's Checkout script on demand and opens the hosted card screen.
// Docs: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

const SCRIPT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let scriptPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise((resolve, reject) => {
    const el = document.createElement('script')
    el.src = SCRIPT_SRC
    el.async = true
    el.onload = () => resolve()
    el.onerror = () => {
      scriptPromise = null
      reject(new Error('Failed to load Razorpay Checkout'))
    }
    document.body.appendChild(el)
  })
  return scriptPromise
}

export interface RazorpaySuccess {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

export interface CheckoutParams {
  keyId: string
  orderId: string
  amount: number // in paise
  currency: string
  name: string
  description: string
  onSuccess: (res: RazorpaySuccess) => void
  onDismiss?: () => void
}

export async function openRazorpayCheckout(params: CheckoutParams): Promise<void> {
  await loadScript()

  const rzp = new window.Razorpay({
    key: params.keyId,
    order_id: params.orderId,
    amount: params.amount,
    currency: params.currency,
    name: params.name,
    description: params.description,
    theme: { color: '#B91C1C' },
    handler: (res: RazorpaySuccess) => params.onSuccess(res),
    modal: { ondismiss: () => params.onDismiss?.() },
  })
  rzp.open()
}

declare global {
  interface Window {
    // Minimal shape — Razorpay's SDK has no official types.
    Razorpay: new (options: Record<string, unknown>) => { open: () => void }
  }
}
