import { apiClient } from './client'
import type { ApiResponse, ShortlistEntry } from '../types'

export const shortlistApi = {
  add: (profileId: string) =>
    apiClient.post<ApiResponse<string>>(`/shortlists/${profileId}`),

  remove: (profileId: string) =>
    apiClient.delete<ApiResponse<string>>(`/shortlists/${profileId}`),

  getAll: () =>
    apiClient.get<ApiResponse<ShortlistEntry[]>>('/shortlists'),

  isShortlisted: (profileId: string) =>
    apiClient.get<ApiResponse<boolean>>(`/shortlists/${profileId}/status`),
}
