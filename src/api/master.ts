import { apiClient } from './client'
import type { ApiResponse, GotraOption } from '../types'

export const masterApi = {
  getGotras: () =>
    apiClient.get<ApiResponse<GotraOption[]>>('/master/gotras'),

  getDistricts: () =>
    apiClient.get<ApiResponse<string[]>>('/master/locations/districts'),

  getTehsils: (district: string) =>
    apiClient.get<ApiResponse<string[]>>(`/master/locations/tehsils/${district}`),

  getVillages: (tehsil: string) =>
    apiClient.get<ApiResponse<string[]>>(`/master/locations/villages/${tehsil}`),
}
