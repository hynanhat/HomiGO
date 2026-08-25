import { Link } from 'react-router-dom'
import { Card } from '@/components/ui'
import { useAdminCategories, useAdminUsers, useModerationQueue } from '@/features/admin/adminQueries'

export default function AdminOverviewPage() {
  const moderation = useModerationQueue('PENDING', 0); const users = useAdminUsers(0); const categories = useAdminCategories(); const metrics = [{ label: 'Tin chờ duyệt', value: moderation.data?.totalElements, to: '/admin/listings' }, { label: 'Người dùng', value: users.data?.totalElements, to: '/admin/users' }, { label: 'Danh mục', value: categories.data?.totalElements, to: '/admin/categories' }]
  return <div><h2 className="text-3xl font-extrabold">Tổng quan vận hành</h2><p className="mt-2 text-ink-600">Số liệu trực tiếp từ các API phân trang hiện có.</p><div className="mt-7 grid gap-4 sm:grid-cols-3">{metrics.map((metric) => <Link key={metric.label} to={metric.to}><Card className="p-5"><p className="text-sm text-ink-600">{metric.label}</p><p className="mt-2 text-3xl font-extrabold">{metric.value ?? '—'}</p><p className="mt-3 text-sm font-semibold text-brand-700">Mở quản lý →</p></Card></Link>)}</div></div>
}
