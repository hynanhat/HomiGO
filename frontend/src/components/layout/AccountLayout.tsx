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
    <main className="mx-auto grid w-full max-w-7xl gap-7 px-4 py-8 sm:px-6 md:grid-cols-[16rem_1fr] lg:px-8 lg:py-12">
      <aside
        className="min-w-0 md:sticky md:top-24 md:self-start"
        aria-label="Điều hướng tài khoản"
      >
        <p className="eyebrow mb-2">Không gian cá nhân</p>
        <h1 className="mb-5 text-2xl font-bold text-ink-950">Tài khoản của tôi</h1>
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-brand-100 bg-white/80 p-2 shadow-[var(--shadow-card)] backdrop-blur md:grid">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold transition ${isActive ? 'bg-brand-600 text-white shadow-sm' : 'text-ink-800 hover:bg-brand-50'}`
              }
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
          <Button
            variant="ghost"
            className="shrink-0 justify-start"
            onClick={async () => {
              await logout()
              navigate('/auth/login', { replace: true })
            }}
          >
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </nav>
      </aside>
      <section className="min-w-0 rounded-3xl bg-white/35">
        <Outlet />
      </section>
    </main>
  )
}
