import { useEffect, useState } from 'react'
import { Building2, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback'
import { Badge, Card, Pagination } from '@/components/ui'
import { ListingCard } from '@/features/listings/components/ListingCard'
import { useProjectDetail } from '@/features/projects/projectQueries'
import { formatCurrency, formatProjectStatus } from '@/lib/formatters'

export default function ProjectDetailPage() {
  const { slug = '' } = useParams()
  const [page, setPage] = useState(0)
  const query = useProjectDetail(slug, page)
  useEffect(() => { if (query.data) document.title = `${query.data.name} | HomiGO` }, [query.data])
  if (query.isPending) return <main className="mx-auto max-w-7xl px-4 py-10"><Skeleton className="h-72" /></main>
  if (query.isError || !query.data) return <main className="mx-auto max-w-4xl px-4 py-16"><ErrorState title="Không tìm thấy dự án" description="Đường dẫn dự án không tồn tại hoặc dữ liệu đang tạm ngừng." onRetry={() => query.refetch()} /></main>
  const project = query.data
  return <main className="min-h-screen bg-slate-50"><section className="bg-ink-950 text-white"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><Link className="text-sm text-brand-200" to="/projects">← Tất cả dự án</Link><div className="mt-6 flex flex-wrap items-start justify-between gap-5"><div><Badge variant="info">{formatProjectStatus(project.status)}</Badge><h1 className="mt-4 text-4xl font-extrabold">{project.name}</h1><p className="mt-3 flex items-center gap-2 text-slate-300"><MapPin className="size-5" />{[project.address, project.wardName, project.districtName].filter(Boolean).join(', ')}</p></div><Card className="min-w-64 p-5 text-ink-950"><p className="text-sm text-ink-600">Giá tham khảo</p><p className="mt-1 text-xl font-extrabold text-brand-700">{project.priceFrom ? `Từ ${formatCurrency(project.priceFrom)}` : 'Liên hệ'}</p><p className="mt-3 text-sm">Chủ đầu tư: <strong>{project.investor}</strong></p></Card></div></div></section><div className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:px-6 lg:px-8"><section><h2 className="flex items-center gap-2 text-2xl font-bold"><Building2 className="text-brand-700" />Tổng quan dự án</h2><p className="mt-4 max-w-4xl whitespace-pre-line leading-7 text-ink-700">{project.description}</p></section><section><h2 className="text-2xl font-bold">Tin đăng đang hoạt động</h2>{project.listings.empty ? <div className="mt-5"><EmptyState title="Dự án chưa có tin đăng" /></div> : <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{project.listings.content.filter((item) => item.status === 'ACTIVE').map((listing) => <ListingCard key={listing.publicCode} listing={listing} />)}</div>}<div className="mt-7"><Pagination page={project.listings.number} totalPages={project.listings.totalPages} onPageChange={setPage} /></div></section></div></main>
}
