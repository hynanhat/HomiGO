import { useEffect, useRef, useState } from 'react'
import { Bell, Building2, Heart, Menu, Plus, ShieldCheck, UserRound, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

const links = [
  { label: 'Mua', to: '/listings?transactionType=BUY' },
  { label: 'Thuê', to: '/listings?transactionType=RENT' },
  { label: 'Dự án', to: '/projects' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  `inline-flex min-h-11 items-center rounded-full px-4 text-sm font-bold transition duration-200 ${isActive ? 'bg-brand-50 text-brand-800 shadow-sm' : 'text-ink-700 hover:bg-white hover:text-brand-800'}`

export function Navigation() {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const { status, user } = useAuth()
  const isAuthenticated = status === 'authenticated'
  const isAdmin = isAuthenticated && user?.role === 'ADMIN'

  useEffect(() => {
    if (!open) return
    firstLinkRef.current?.focus()
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100/80 bg-white/80 shadow-[0_8px_30px_rgb(15_118_110/0.05)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[var(--header-height)] max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="group flex min-h-11 items-center gap-2.5"
          aria-label="HomiGO - Trang chủ"
        >
          <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white shadow-[0_9px_22px_rgb(15_118_110/0.24)] transition duration-200 group-hover:-translate-y-0.5">
            <Building2 className="size-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-bold tracking-[-0.04em] text-ink-950">
            Homi<span className="text-brand-600">GO</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
          {links.map((link) => (
            <NavLink key={link.to} className={navClass} to={link.to}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated && (
              <NavLink className={navClass} to="/saved-listings">
                <Heart className="mr-1 inline size-4" aria-hidden="true" />
                Tin đã lưu
              </NavLink>
            )}
            <NavLink className={navClass} to={isAuthenticated ? '/account/profile' : '/auth/login'}>
              <UserRound className="mr-1 inline size-4" aria-hidden="true" />
              {user?.name ?? 'Đăng nhập'}
            </NavLink>
            {isAdmin ? (
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-600 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgb(3_105_161/0.18)] transition hover:-translate-y-0.5 hover:bg-accent-700"
                to="/admin"
              >
                <ShieldCheck className="size-4" aria-hidden="true" />
                Quản trị
              </Link>
            ) : (
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent-600 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgb(3_105_161/0.18)] transition hover:-translate-y-0.5 hover:bg-accent-700"
                to="/seller/listings/new"
              >
                <Plus className="size-4" aria-hidden="true" />
                Đăng tin
              </Link>
            )}
          </div>
          <button
            ref={buttonRef}
            type="button"
            className="grid size-11 place-items-center rounded-xl text-ink-800 transition hover:bg-brand-50 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav
          id="mobile-navigation"
          className="border-t border-brand-100 bg-white/95 px-4 py-4 shadow-[var(--shadow-card)] backdrop-blur-xl md:hidden"
          aria-label="Điều hướng di động"
        >
          <div className="mx-auto grid max-w-7xl gap-1">
            {links.map((link, index) => (
              <NavLink
                ref={index === 0 ? firstLinkRef : undefined}
                key={link.to}
                className={navClass}
                to={link.to}
                onClick={close}
              >
                {link.label}
              </NavLink>
            ))}
            {isAuthenticated && (
              <NavLink className={navClass} to="/notifications" onClick={close}>
                <Bell className="mr-1 inline size-4" aria-hidden="true" />
                Thông báo
              </NavLink>
            )}
            <NavLink
              className={navClass}
              to={isAuthenticated ? '/account/profile' : '/auth/login'}
              onClick={close}
            >
              {user?.name ?? 'Đăng nhập'}
            </NavLink>
            {isAdmin ? (
              <NavLink className={navClass} to="/admin" onClick={close}>
                <ShieldCheck className="mr-1 inline size-4" aria-hidden="true" />
                Quản trị
              </NavLink>
            ) : (
              <NavLink className={navClass} to="/seller/listings/new" onClick={close}>
                <Plus className="mr-1 inline size-4" aria-hidden="true" />
                Đăng tin bất động sản
              </NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
