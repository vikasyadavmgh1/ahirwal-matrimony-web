import { apiClient } from './client'
import type { ApiResponse, AuthResponse, TokenResponse } from '../types'

export const authApi = {
  sendOtp: (phone: string) =>
    apiClient.post<ApiResponse<string>>('/auth/send-otp', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-otp', { phone, otp }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<TokenResponse>>('/auth/refresh', { refreshToken }),

  logout: (accessToken: string) =>
    apiClient.post('/auth/logout', null, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }),

  deleteAccount: () => apiClient.delete('/auth/account'),
}
