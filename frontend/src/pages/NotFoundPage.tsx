import { ArrowLeft, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-4 py-16 text-center">
      <div>
        <SearchX className="mx-auto size-14 text-brand-600" aria-hidden="true" />
        <p className="mt-5 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">Lỗi 404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink-950 sm:text-4xl">Không tìm thấy trang</h1>
        <p className="mx-auto mt-4 max-w-lg text-ink-600">
          Đường dẫn có thể đã thay đổi hoặc nội dung không còn tồn tại.
        </p>
        <Link className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-600 px-5 font-semibold text-white hover:bg-brand-700" to="/">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Về trang chủ
        </Link>
      </div>
    </main>
  )
}
