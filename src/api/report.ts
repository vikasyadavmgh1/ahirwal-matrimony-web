import { apiClient } from './client'
import type { ApiResponse } from '../types'

export const reportApi = {
  submit: (reportedId: string, reason: string, description?: string) =>
    apiClient.post<ApiResponse<string>>('/reports', { reportedId, reason, description }),
}
