import { apiClient } from './client'
import type { ApiResponse, AppNotification } from '../types'

export const notificationsApi = {
  getAll: () =>
    apiClient.get<ApiResponse<AppNotification[]>>('/notifications'),

  getUnreadCount: () =>
    apiClient.get<ApiResponse<{ count: number }>>('/notifications/unread-count'),

  markAllRead: () =>
    apiClient.patch<ApiResponse<string>>('/notifications/read-all'),

  markRead: (id: string) =>
    apiClient.patch<ApiResponse<string>>(`/notifications/${id}/read`),
}
