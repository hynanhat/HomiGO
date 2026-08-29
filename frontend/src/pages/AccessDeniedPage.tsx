import { Link } from 'react-router-dom'
import { ShieldX } from 'lucide-react'
import { Card } from '@/components/ui'
export default function AccessDeniedPage() {
  return (
    <main className="grid min-h-[60vh] place-items-center bg-slate-50 px-4">
      <Card className="max-w-lg p-8 text-center">
        <ShieldX className="mx-auto size-12 text-red-700" />
        <h1 className="mt-4 text-3xl font-extrabold">Không có quyền truy cập</h1>
        <p className="mt-2 text-ink-600">
          Tài khoản của bạn không có vai trò phù hợp để mở khu vực này.
        </p>
        <Link className="mt-5 inline-block font-bold text-brand-700" to="/">
          Về trang chủ
        </Link>
      </Card>
    </main>
  )
}
