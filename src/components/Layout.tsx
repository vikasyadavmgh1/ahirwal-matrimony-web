import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Heart, Search, Bell, User, BookHeart, MessageCircle, Crown, LogOut, HeartHandshake } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../api/auth'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import { useQuery } from '@tanstack/react-query'
import { notificationsApi } from '../api/notifications'

const navItems = [
  { to: '/dashboard', icon: Heart, label: 'Home' },
  { to: '/matches', icon: Search, label: 'Browse' },
  { to: '/interests', icon: HeartHandshake, label: 'Interests' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/shortlist', icon: BookHeart, label: 'Shortlist' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/subscription', icon: Crown, label: 'Premium' },
  { to: '/profile', icon: User, label: 'Profile' },
]

// Mobile bottom nav: the 5 most essential
const mobileNavItems = [navItems[0], navItems[1], navItems[2], navItems[3], navItems[5], navItems[7]]

export default function Layout() {
  const navigate = useNavigate()
  const { clearAuth, accessToken } = useAuthStore()

  const { data: unreadCount } = useQuery({
    queryKey: ['notif-count'],
    queryFn: () => notificationsApi.getUnreadCount().then((r) => r.data.data?.count ?? 0),
    refetchInterval: 30_000,
  })

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
    <div className="min-h-screen bg-surface-50 flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-white border-r border-gray-100 fixed h-full z-20 shadow-soft">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
            <Heart className="w-4.5 h-4.5 text-white fill-white" size={18} />
          </div>
          <div>
            <span className="font-black text-gray-900 text-sm tracking-tight">Ahirwal Matrimony</span>
            <p className="text-[10px] text-gray-400 font-medium">शुभ विवाह</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative flex-shrink-0">
                    <Icon
                      className={clsx(isActive ? 'text-primary-600' : 'text-gray-400')}
                      size={18}
                    />
                    {to === '/notifications' && unreadCount != null && unreadCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-2xl text-sm font-semibold text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut size={18} className="text-gray-400" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-64 pb-20 md:pb-0">
        <Outlet />
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex bg-white/95 backdrop-blur-md border-t border-gray-100/80"
           style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center gap-1 pt-2.5 pb-2 text-[10px] font-bold uppercase tracking-widest transition-colors relative',
                isActive ? 'text-primary-600' : 'text-gray-400'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className={clsx(
                  'w-10 h-8 rounded-2xl flex items-center justify-center transition-all duration-200 relative',
                  isActive ? 'bg-primary-50' : ''
                )}>
                  <Icon size={20} className={isActive ? 'text-primary-600' : 'text-gray-400'} />
                  {to === '/notifications' && unreadCount != null && unreadCount > 0 && (
                    <span className="absolute top-0 right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
