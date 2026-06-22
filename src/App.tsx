import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import MatchesPage from './pages/matches/MatchesPage'
import InterestsPage from './pages/interests/InterestsPage'
import ShortlistPage from './pages/shortlist/ShortlistPage'
import ChatPage from './pages/chat/ChatPage'
import SubscriptionPage from './pages/subscription/SubscriptionPage'
import ProfilePage from './pages/profile/ProfilePage'
import EditProfilePage from './pages/profile/EditProfilePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/matches" element={<MatchesPage />} />
            <Route path="/interests" element={<InterestsPage />} />
            <Route path="/shortlist" element={<ShortlistPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/subscription" element={<SubscriptionPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </QueryClientProvider>
  )
}

export default App
