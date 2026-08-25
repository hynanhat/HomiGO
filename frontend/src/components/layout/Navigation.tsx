import { useEffect, useRef, useState } from 'react'
import { Bell, Building2, Heart, Menu, Plus, ShieldCheck, UserRound, X } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Button } from '@/components/ui'
import { useAuth } from '@/context/AuthContext'
import { NotificationBell } from '@/features/notifications/components/NotificationBell'

const links = [
  { label: 'Mua', to: '/listings?transactionType=BUY' },
  { label: 'Thuê', to: '/listings?transactionType=RENT' },
  { label: 'Dự án', to: '/projects' },
]

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-semibold transition ${isActive ? 'bg-brand-50 text-brand-700' : 'text-ink-800 hover:bg-slate-100'}`

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
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          <span className="grid size-9 place-items-center rounded-lg bg-brand-600 text-white"><Building2 className="size-5" /></span>
          HomiGO
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Điều hướng chính">
          {links.map((link) => <NavLink key={link.to} className={navClass} to={link.to}>{link.label}</NavLink>)}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {isAuthenticated && <NotificationBell />}
          <div className="hidden items-center gap-2 md:flex">
            {isAuthenticated && <NavLink className={navClass} to="/saved-listings"><Heart className="mr-1 inline size-4" />Tin đã lưu</NavLink>}
            <NavLink className={navClass} to={isAuthenticated ? '/account/profile' : '/auth/login'}><UserRound className="mr-1 inline size-4" />{user?.name ?? 'Đăng nhập'}</NavLink>
            {isAdmin ? (
              <Link to="/admin"><Button size="sm"><ShieldCheck className="size-4" />Quản trị</Button></Link>
            ) : (
              <Link to="/seller/listings/new"><Button size="sm"><Plus className="size-4" />Đăng tin</Button></Link>
            )}
          </div>
          <button ref={buttonRef} type="button" className="rounded-lg p-2 md:hidden" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Đóng menu' : 'Mở menu'} onClick={() => setOpen((value) => !value)}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && (
        <nav id="mobile-navigation" className="border-t border-slate-200 bg-white px-4 py-4 md:hidden" aria-label="Điều hướng di động">
          <div className="grid gap-1">
            {links.map((link, index) => <NavLink ref={index === 0 ? firstLinkRef : undefined} key={link.to} className={navClass} to={link.to} onClick={close}>{link.label}</NavLink>)}
            {isAuthenticated && <NavLink className={navClass} to="/notifications" onClick={close}><Bell className="mr-1 inline size-4" />Thông báo</NavLink>}
            <NavLink className={navClass} to={isAuthenticated ? '/account/profile' : '/auth/login'} onClick={close}>{user?.name ?? 'Đăng nhập'}</NavLink>
            {isAdmin ? (
              <NavLink className={navClass} to="/admin" onClick={close}><ShieldCheck className="mr-1 inline size-4" />Quản trị</NavLink>
            ) : (
              <NavLink className={navClass} to="/seller/listings/new" onClick={close}>Đăng tin bất động sản</NavLink>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
