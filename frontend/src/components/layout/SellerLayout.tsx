import { FilePlus2, Gauge, ListChecks } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/seller', label: 'Tổng quan', icon: Gauge, end: true },
  { to: '/seller/listings', label: 'Tin của tôi', icon: ListChecks },
  { to: '/seller/listings/new', label: 'Tạo tin mới', icon: FilePlus2 },
]

export default function SellerLayout() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[16rem_1fr] lg:px-8">
      <aside aria-label="Điều hướng người bán">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-600">Khu vực người bán</p>
        <h1 className="mb-4 text-xl font-bold text-ink-950">Quản lý tin đăng</h1>
        <nav className="flex gap-2 overflow-x-auto md:grid">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink end={end} key={to} to={to} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-ink-950 text-white' : 'bg-white text-ink-800 hover:bg-slate-100'}`}>
              <Icon className="size-4" aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="min-w-0"><Outlet /></section>
    </main>
  )
}
