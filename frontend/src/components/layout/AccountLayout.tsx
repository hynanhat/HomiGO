import { Heart, LockKeyhole, LogOut, UserRound } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'

const links = [
  { to: '/account/profile', label: 'Hồ sơ', icon: UserRound },
  { to: '/account/security', label: 'Bảo mật', icon: LockKeyhole },
  { to: '/saved-listings', label: 'Tin đã lưu', icon: Heart },
]

export default function AccountLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[15rem_1fr] lg:px-8">
      <aside aria-label="Điều hướng tài khoản">
        <h1 className="mb-4 text-xl font-bold text-ink-950">Tài khoản của tôi</h1>
        <nav className="flex gap-2 overflow-x-auto md:grid">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-brand-600 text-white' : 'bg-white text-ink-800 hover:bg-slate-100'}`}>
              <Icon className="size-4" aria-hidden="true" />{label}
            </NavLink>
          ))}
          <Button variant="ghost" className="shrink-0 justify-start" onClick={async () => { await logout(); navigate('/auth/login', { replace: true }) }}><LogOut className="size-4" />Đăng xuất</Button>
        </nav>
      </aside>
      <section className="min-w-0"><Outlet /></section>
    </main>
  )
}
