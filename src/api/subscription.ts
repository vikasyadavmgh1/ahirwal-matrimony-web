import { apiClient } from './client'
import type { ApiResponse, PlanDTO, RazorpayOrderResponse, SubscriptionResponse } from '../types'

export const subscriptionApi = {
  getPlans: () =>
    apiClient.get<ApiResponse<PlanDTO[]>>('/subscriptions/plans'),

  createOrder: (planId: string) =>
    apiClient.post<ApiResponse<RazorpayOrderResponse>>('/subscriptions/create-order', { planId }),

  verifyPayment: (orderId: string, paymentId: string, signature: string) =>
    apiClient.post<ApiResponse<SubscriptionResponse>>('/subscriptions/verify-payment', {
      orderId, paymentId, signature,
    }),

  getMySubscription: () =>
    apiClient.get<ApiResponse<SubscriptionResponse>>('/subscriptions/my'),
}
