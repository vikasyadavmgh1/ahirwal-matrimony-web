import { apiClient } from './client'
import type { ApiResponse, ProfileDTO } from '../types'

interface PresignedUrlResponse {
  uploadUrl: string
  downloadUrl: string
  objectKey: string
  expiresInSeconds: number
}

export const profileApi = {
  createProfile: (data: Partial<ProfileDTO>) =>
    apiClient.post<ApiResponse<ProfileDTO>>('/profiles', data),

  getMyProfile: () =>
    apiClient.get<ApiResponse<ProfileDTO>>('/profiles/me'),

  updateProfile: (data: Partial<ProfileDTO>) =>
    apiClient.patch<ApiResponse<ProfileDTO>>('/profiles/me', data),

  getProfile: (id: string) =>
    apiClient.get<ApiResponse<ProfileDTO>>(`/profiles/${id}`),

  avatarPresignedUrl: () =>
    apiClient.post<ApiResponse<PresignedUrlResponse>>('/profiles/me/avatar/presigned-url'),

  galleryPresignedUrl: () =>
    apiClient.post<ApiResponse<PresignedUrlResponse>>('/profiles/me/gallery/presigned-url'),

  removeGalleryPhoto: (index: number) =>
    apiClient.delete<ApiResponse<string>>(`/profiles/me/gallery/${index}`),

  updateVisibility: (visibility: string) =>
    apiClient.patch<ApiResponse<string>>('/profiles/me/visibility', { visibility }),

  getViewers: () =>
    apiClient.get<ApiResponse<string[]>>('/profiles/me/views'),
}
