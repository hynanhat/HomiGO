import { FilePlus2, Gauge, ListChecks } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/seller', label: 'Tổng quan', icon: Gauge, end: true },
  { to: '/seller/listings', label: 'Tin của tôi', icon: ListChecks },
  { to: '/seller/listings/new', label: 'Tạo tin mới', icon: FilePlus2 },
]

export default function SellerLayout() {
  return (
    <main className="mx-auto grid w-full max-w-7xl gap-7 px-4 py-8 sm:px-6 md:grid-cols-[17rem_1fr] lg:px-8 lg:py-12">
      <aside
        className="min-w-0 md:sticky md:top-24 md:self-start"
        aria-label="Điều hướng người bán"
      >
        <p className="eyebrow mb-2">Khu vực người bán</p>
        <h1 className="mb-5 text-2xl font-bold text-ink-950">Quản lý tin đăng</h1>
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-brand-100 bg-white/80 p-2 shadow-[var(--shadow-card)] backdrop-blur md:grid">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              end={end}
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
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </main>
  )
}
