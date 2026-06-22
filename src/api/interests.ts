import { apiClient } from './client'
import type { ApiResponse, InterestResponse } from '../types'

export const interestsApi = {
  sendInterest: (receiverId: string, message?: string) =>
    apiClient.post<ApiResponse<InterestResponse>>('/interests', { receiverId, message }),

  acceptInterest: (id: string) =>
    apiClient.patch<ApiResponse<InterestResponse>>(`/interests/${id}/accept`),

  declineInterest: (id: string) =>
    apiClient.patch<ApiResponse<InterestResponse>>(`/interests/${id}/decline`),

  withdrawInterest: (id: string) =>
    apiClient.delete<ApiResponse<string>>(`/interests/${id}`),

  getReceived: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<InterestResponse[]>>('/interests/received', { params: { page, size } }),

  getSent: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<InterestResponse[]>>('/interests/sent', { params: { page, size } }),
}
