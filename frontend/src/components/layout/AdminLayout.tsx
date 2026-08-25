import { Building, FolderTree, Gauge, House, MapPinned, ShieldCheck, UsersRound } from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/admin', label: 'Tổng quan', icon: Gauge, end: true },
  { to: '/admin/listings', label: 'Kiểm duyệt tin', icon: ShieldCheck },
  { to: '/admin/users', label: 'Người dùng', icon: UsersRound },
  { to: '/admin/categories', label: 'Danh mục', icon: FolderTree },
  { to: '/admin/projects', label: 'Dự án', icon: Building },
  { to: '/admin/locations', label: 'Địa giới', icon: MapPinned },
]

export default function AdminLayout() {
  return (
    <main className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,1fr)] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8">
      <aside className="min-w-0 rounded-xl bg-ink-950 p-4 text-white" aria-label="Điều hướng quản trị">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-100">HomiGO Operations</p>
        <h1 className="mb-5 text-xl font-bold">Trung tâm quản trị</h1>
        <nav className="flex gap-2 overflow-x-auto lg:grid">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink end={end} key={to} to={to} className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${isActive ? 'bg-white text-ink-950' : 'text-slate-200 hover:bg-white/10'}`}>
              <Icon className="size-4" aria-hidden="true" />{label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 border-t border-white/15 pt-4">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-white/25 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-white hover:text-ink-950 lg:justify-start"
          >
            <House className="size-4" aria-hidden="true" />
            Quay lại trang chủ
          </Link>
        </div>
      </aside>
      <section className="min-w-0"><Outlet /></section>
    </main>
  )
}
