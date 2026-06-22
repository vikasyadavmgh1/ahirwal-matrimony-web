import { apiClient } from './client'
import type { ApiResponse, MatchResultDTO } from '../types'

export const matchesApi = {
  getSuggestions: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<MatchResultDTO[]>>('/matches/suggestions', { params: { page, size } }),

  search: (params: Record<string, string | number | boolean>) =>
    apiClient.get<ApiResponse<MatchResultDTO[]>>('/matches/search', { params }),

  getNearby: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<MatchResultDTO[]>>('/matches/nearby', { params: { page, size } }),

  getPremiumPicks: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<MatchResultDTO[]>>('/matches/premium-picks', { params: { page, size } }),
}
