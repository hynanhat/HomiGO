import { Link, Outlet } from 'react-router-dom'
import { SupportChatbot } from '@/features/support-chatbot/SupportChatbot'
import { Navigation } from './Navigation'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">Bỏ qua điều hướng</a>
      <Navigation />
      <div id="main-content" className="flex-1" tabIndex={-1}><Outlet /></div>
      <footer className="border-t border-slate-800 bg-ink-950 text-slate-300">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
          <div><p className="text-lg font-bold text-white">HomiGO</p><p className="mt-2 text-sm">Nền tảng bất động sản minh bạch cho người Việt.</p></div>
          <div><p className="font-semibold text-white">Khám phá</p><div className="mt-2 grid gap-2 text-sm"><Link to="/listings">Bất động sản</Link><Link to="/projects">Dự án</Link></div></div>
          <div><p className="font-semibold text-white">Hỗ trợ</p><p className="mt-2 text-sm">Email: hotro@homigo.vn</p></div>
        </div>
      </footer>
      <SupportChatbot />
    </div>
  )
}
