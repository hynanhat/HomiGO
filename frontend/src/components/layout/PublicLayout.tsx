import { Link, Outlet } from 'react-router-dom'
import { SupportChatbot } from '@/features/support-chatbot/SupportChatbot'
import { Navigation } from './Navigation'

export default function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Bỏ qua điều hướng
      </a>
      <Navigation />
      <div id="main-content" className="flex-1" tabIndex={-1}>
        <Outlet />
      </div>
      <footer className="relative overflow-hidden border-t border-brand-900 bg-brand-950 text-slate-300">
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-500/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.35fr_1fr_1fr] lg:px-8">
          <div>
            <p className="font-display text-xl font-bold text-white">
              Homi<span className="text-brand-300">GO</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">
              Nền tảng bất động sản minh bạch, giúp người Việt tìm nơi phù hợp để sống, đầu tư và
              phát triển.
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-brand-200">
              Tìm đúng nơi · Sống đúng chất
            </p>
          </div>
          <div>
            <p className="font-bold text-white">Khám phá</p>
            <div className="mt-3 grid gap-3 text-sm">
              <Link className="w-fit hover:text-white" to="/listings?transactionType=BUY">
                Mua bất động sản
              </Link>
              <Link className="w-fit hover:text-white" to="/listings?transactionType=RENT">
                Thuê bất động sản
              </Link>
              <Link className="w-fit hover:text-white" to="/projects">
                Dự án nổi bật
              </Link>
            </div>
          </div>
          <div>
            <p className="font-bold text-white">Đồng hành cùng bạn</p>
            <p className="mt-3 text-sm leading-6">
              Email:{' '}
              <a
                className="font-semibold text-brand-200 hover:text-white"
                href="mailto:nhatsos123@gmail.com"
              >
                nhatsos123@gmail.com
              </a>
            </p>
            <Link
              className="mt-4 inline-flex min-h-11 items-center rounded-xl border border-white/20 px-4 text-sm font-bold text-white transition hover:bg-white hover:text-brand-950"
              to="/seller/listings/new"
            >
              Bắt đầu đăng tin
            </Link>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 px-4 py-5 text-xs text-slate-400 sm:px-6 lg:px-8">
            <p>© HomiGO. Nền tảng bất động sản dành cho người Việt.</p>
            <p>Minh bạch · Dễ dùng · Đáng tin cậy</p>
          </div>
        </div>
      </footer>
      <SupportChatbot />
    </div>
  )
}
