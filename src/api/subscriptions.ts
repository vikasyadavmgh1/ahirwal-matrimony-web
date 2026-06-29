import { apiClient } from './client'

export interface PlanDTO {
  id: string
  name: 'SILVER' | 'GOLD' | 'PLATINUM'
  displayName: string
  priceInr: number
  durationDays: number
  features: Record<string, boolean>
}

export interface OrderResponse {
  orderId: string
  currency: string
  amount: number
  keyId: string
  mockMode: boolean
}

export interface SubscriptionStatus {
  status: 'NONE' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
  planName: string | null
  expiresAt: string | null
  razorpayOrderId: string | null
}

interface Wrap<T> { data: T }

export const subscriptionsApi = {
  getPlans: () =>
    apiClient.get<Wrap<PlanDTO[]>>('/subscriptions/plans'),

  getMySubscription: () =>
    apiClient.get<Wrap<SubscriptionStatus>>('/subscriptions/my'),

  createOrder: (planId: string) =>
    apiClient.post<Wrap<OrderResponse>>(`/subscriptions/create-order?planId=${planId}`),

  verifyPayment: (orderId: string, paymentId: string, signature: string) =>
    apiClient.post<Wrap<SubscriptionStatus>>(
      `/subscriptions/verify-payment?orderId=${encodeURIComponent(orderId)}&paymentId=${encodeURIComponent(paymentId)}&signature=${encodeURIComponent(signature)}`
    ),
}
