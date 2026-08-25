import { useState, type FormEvent } from 'react'
import { ArrowRight, Building2, KeyRound, Search } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback'
import { ListingCard } from '@/features/listings/components/ListingCard'
import { useListingSearch } from '@/features/listings/listingQueries'
import { ProjectCard } from '@/features/projects/components/ProjectCard'
import { useProjectSearch } from '@/features/projects/projectQueries'
import type { TransactionType } from '@/types/domain'

export default function HomePage() {
  const navigate = useNavigate()
  const [transactionType, setTransactionType] = useState<TransactionType>('BUY')
  const [keyword, setKeyword] = useState('')
  const listings = useListingSearch({ sort: 'newest', page: 0, size: 6 })
  const projects = useProjectSearch({ page: 0, size: 3 })

  function submit(event: FormEvent) {
    event.preventDefault()
    const params = new URLSearchParams({ transactionType, sort: 'newest', page: '0', size: '12' })
    if (keyword.trim()) params.set('keyword', keyword.trim())
    navigate(`/listings?${params}`)
  }

  return (
    <main>
      <section className="bg-gradient-to-br from-ink-950 via-slate-900 to-brand-950 px-4 py-16 text-white sm:px-6 sm:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-brand-200">Bất động sản minh bạch</p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-6xl">Tìm đúng nơi. Sống đúng chất.</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">Khám phá tin đăng đã kiểm duyệt và các dự án nổi bật trên một nền tảng hiện đại, dễ sử dụng.</p>
          <form onSubmit={submit} className="mx-auto mt-9 max-w-3xl rounded-2xl bg-white p-3 text-left shadow-2xl">
            <div className="mb-3 flex gap-2" role="group" aria-label="Nhu cầu bất động sản">
              <Button size="sm" variant={transactionType === 'BUY' ? 'primary' : 'ghost'} onClick={() => setTransactionType('BUY')}><Building2 className="size-4" />Mua</Button>
              <Button size="sm" variant={transactionType === 'RENT' ? 'primary' : 'ghost'} onClick={() => setTransactionType('RENT')}><KeyRound className="size-4" />Thuê</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Input label="Tìm bất động sản" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Nhập khu vực, dự án hoặc từ khóa…" />
              <Button type="submit" size="lg"><Search className="size-5" />Tìm kiếm</Button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-brand-700">MỚI NHẤT</p><h2 className="mt-1 text-3xl font-extrabold text-ink-950">Bất động sản dành cho bạn</h2></div><Link className="hidden items-center gap-1 font-semibold text-brand-700 sm:flex" to="/listings">Xem tất cả <ArrowRight className="size-4" /></Link></div>
        {listings.isPending && <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }, (_, index) => <Skeleton key={index} className="h-80" />)}</div>}
        {listings.isError && <div className="mt-7"><ErrorState onRetry={() => listings.refetch()} /></div>}
        {listings.data?.empty && <div className="mt-7"><EmptyState title="Chưa có tin đăng mới" /></div>}
        {listings.data && !listings.data.empty && <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{listings.data.content.map((listing) => <ListingCard key={listing.publicCode} listing={listing} />)}</div>}
      </section>

      <section className="bg-slate-100"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-bold text-brand-700">KHU ĐÔ THỊ & CĂN HỘ</p><h2 className="mt-1 text-3xl font-extrabold text-ink-950">Dự án nổi bật</h2></div><Link className="font-semibold text-brand-700" to="/projects">Khám phá dự án</Link></div>{projects.isPending && <div className="mt-7 grid gap-5 md:grid-cols-3"><Skeleton className="h-64" /><Skeleton className="h-64" /><Skeleton className="h-64" /></div>}{projects.isError && <div className="mt-7"><ErrorState onRetry={() => projects.refetch()} /></div>}{projects.data && <div className="mt-7 grid gap-5 md:grid-cols-3">{projects.data.content.map((project) => <ProjectCard key={project.slug} project={project} />)}</div>}</div></section>
    </main>
  )
}
