import { apiClient } from './client'

interface Wrap<T> { data: T }

export interface AdminDashboard {
  totalUsers: number
  activeProfiles: number
  premiumCount: number
  newRegistrationsToday: number
}

export interface AdminReport {
  id: string
  reason: string
  status: string
  createdAt: string
}

export interface AdminUser {
  id: string
  phone: string
  email: string | null
  isActive: boolean
  isBanned: boolean
  createdAt: string
}

export const adminApi = {
  getDashboard: () =>
    apiClient.get<Wrap<AdminDashboard>>('/admin/dashboard'),

  getPendingReports: () =>
    apiClient.get<Wrap<AdminReport[]>>('/admin/reports/pending'),

  actionReport: (id: string, action: 'DISMISSED' | 'ACTIONED') =>
    apiClient.patch<Wrap<string>>(`/admin/reports/${id}/action`, { action }),

  getUsers: (search?: string, page = 0) =>
    apiClient.get<Wrap<AdminUser[]>>('/admin/users', { params: { search, page } }),

  banUser: (id: string, banned: boolean) =>
    apiClient.put<Wrap<string>>(`/admin/users/${id}/ban`, { banned }),

  verifyProfile: (id: string) =>
    apiClient.put<Wrap<string>>(`/admin/profiles/${id}/verify`),
}
