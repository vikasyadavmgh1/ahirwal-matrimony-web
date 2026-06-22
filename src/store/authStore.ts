import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  isAuthenticated: boolean
  setTokens: (access: string, refresh: string, userId: string) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken, userId) => {
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', refreshToken)
        set({ accessToken, refreshToken, userId, isAuthenticated: true })
      },

      clearAuth: () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        set({ accessToken: null, refreshToken: null, userId: null, isAuthenticated: false })
      },
    }),
    { name: 'auth-storage', partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, userId: s.userId, isAuthenticated: s.isAuthenticated }) }
  )
)
