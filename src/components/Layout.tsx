import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Heart, Search, Bell, User, BookHeart, MessageCircle, Crown, LogOut } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: Heart, label: 'Home' },
  { to: '/matches', icon: Search, label: 'Browse' },
  { to: '/interests', icon: Bell, label: 'Interests' },
  { to: '/shortlist', icon: BookHeart, label: 'Shortlist' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/subscription', icon: Crown, label: 'Premium' },
  { to: '/profile', icon: User, label: 'Profile' },
]

// Mobile bottom nav: Home, Browse, Interests, Chat, Profile (most essential)
const mobileNavItems = [navItems[0], navItems[1], navItems[2], navItems[4], navItems[6]]

export default function Layout() {
  const navigate = useNavigate()
  const { clearAuth, accessToken } = useAuthStore()

  const handleLogout = async () => {
    try {
      if (accessToken) await authApi.logout(accessToken)
    } catch { /* ignore */ } finally {
      clearAuth()
      navigate('/login')
      toast.success('Logged out')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-60 flex-col bg-white border-r border-gray-100 fixed h-full z-20">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="font-bold text-gray-900 text-sm">Ahirwal Matrimony</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-20 flex">
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors',
                isActive ? 'text-primary-600' : 'text-gray-500'
              )
            }
          >
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
