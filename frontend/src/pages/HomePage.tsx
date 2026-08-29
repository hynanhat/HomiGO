import { useState, type FormEvent } from 'react'
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  KeyRound,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
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
      <section className="relative isolate min-h-[min(47rem,calc(100svh_-_4.5rem))] overflow-hidden bg-ink-950 text-white">
        <img
          src="/homigo-hero-v2.jpg"
          alt=""
          width="1536"
          height="1024"
          fetchPriority="high"
          className="absolute inset-0 -z-20 size-full object-cover object-[62%_center]"
        />
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/88 to-ink-950/15"
          aria-hidden="true"
        />
        <div
          className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink-950/55 to-transparent"
          aria-hidden="true"
        />
        <div className="mx-auto flex min-h-[min(47rem,calc(100svh_-_4.5rem))] max-w-7xl items-center px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="w-full max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-100 backdrop-blur-md">
              <BadgeCheck className="size-4" aria-hidden="true" />
              Bất động sản minh bạch
            </p>
            <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-[1.12] tracking-tight sm:text-6xl lg:text-7xl">
              Tìm đúng nơi.
              <br />
              <span className="text-brand-200">Sống đúng chất.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
              Tin đăng đã kiểm duyệt, dự án rõ ràng và trải nghiệm tìm kiếm được thiết kế cho nhu
              cầu sống của người Việt.
            </p>
            <form
              onSubmit={submit}
              className="glass-surface mt-8 max-w-2xl rounded-3xl p-3 text-left text-ink-950 sm:p-4"
            >
              <div className="mb-3 flex gap-2" role="group" aria-label="Nhu cầu bất động sản">
                <Button
                  size="sm"
                  variant={transactionType === 'BUY' ? 'primary' : 'ghost'}
                  aria-pressed={transactionType === 'BUY'}
                  onClick={() => setTransactionType('BUY')}
                >
                  <Building2 className="size-4" aria-hidden="true" />
                  Mua
                </Button>
                <Button
                  size="sm"
                  variant={transactionType === 'RENT' ? 'primary' : 'ghost'}
                  aria-pressed={transactionType === 'RENT'}
                  onClick={() => setTransactionType('RENT')}
                >
                  <KeyRound className="size-4" aria-hidden="true" />
                  Thuê
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                <Input
                  label="Tìm bất động sản"
                  hint="Nhập khu vực, dự án hoặc từ khóa bạn quan tâm."
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Khu vực, dự án hoặc từ khóa…"
                />
                <Button type="submit" size="lg">
                  <Search className="size-5" aria-hidden="true" />
                  Tìm kiếm
                </Button>
              </div>
            </form>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-white/85">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="size-4 text-brand-200" aria-hidden="true" />
                Tin đăng được kiểm duyệt
              </span>
              <span className="inline-flex items-center gap-2">
                <Sparkles className="size-4 text-brand-200" aria-hidden="true" />
                Gợi ý phù hợp nhu cầu
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-brand-100 bg-white/90" aria-label="Lợi ích của HomiGO">
        <div className="mx-auto grid max-w-7xl divide-y divide-brand-100 px-4 sm:px-6 md:grid-cols-3 md:divide-x md:divide-y-0 lg:px-8">
          {[
            ['01', 'Dữ liệu rõ ràng', 'Thông tin quan trọng được trình bày nhất quán.'],
            ['02', 'Tìm kiếm tinh gọn', 'Lọc theo đúng vị trí, nhu cầu và ngân sách.'],
            ['03', 'Đồng hành an tâm', 'Quản lý tin, lưu lựa chọn và nhận cập nhật.'],
          ].map(([number, title, description]) => (
            <div key={number} className="flex gap-4 py-6 md:px-6 first:md:pl-0 last:md:pr-0">
              <span className="font-display text-sm font-bold text-brand-600">{number}</span>
              <div>
                <h2 className="text-base font-bold text-ink-950">{title}</h2>
                <p className="mt-1 text-sm leading-6 text-ink-600">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Mới cập nhật</p>
            <h2 className="mt-2 text-3xl font-bold text-ink-950 sm:text-4xl">
              Nơi ở đáng cân nhắc
            </h2>
            <p className="mt-3 max-w-xl text-ink-600">
              Khám phá các tin đăng mới với thông tin nổi bật được trình bày rõ ràng ngay từ cái
              nhìn đầu tiên.
            </p>
          </div>
          <Link
            className="hidden min-h-11 items-center gap-2 rounded-xl px-3 font-bold text-brand-700 transition hover:bg-brand-50 sm:flex"
            to="/listings"
          >
            Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {listings.isPending && (
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }, (_, index) => (
              <Skeleton key={index} className="h-80" />
            ))}
          </div>
        )}
        {listings.isError && (
          <div className="mt-7">
            <ErrorState onRetry={() => listings.refetch()} />
          </div>
        )}
        {listings.data?.empty && (
          <div className="mt-7">
            <EmptyState title="Chưa có tin đăng mới" />
          </div>
        )}
        {listings.data && !listings.data.empty && (
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {listings.data.content.map((listing) => (
              <ListingCard key={listing.publicCode} listing={listing} />
            ))}
          </div>
        )}
        <Link
          className="mt-7 inline-flex min-h-11 items-center gap-2 font-bold text-brand-700 sm:hidden"
          to="/listings"
        >
          Xem tất cả <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="border-y border-brand-100 bg-brand-50/65">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Khu đô thị & căn hộ</p>
              <h2 className="mt-2 text-3xl font-bold text-ink-950 sm:text-4xl">
                Dự án đang định hình thành phố
              </h2>
              <p className="mt-3 max-w-xl text-ink-600">
                Theo dõi quy hoạch, tiến độ và khoảng giá trong một trải nghiệm nhất quán.
              </p>
            </div>
            <Link
              className="hidden min-h-11 items-center gap-2 rounded-xl px-3 font-bold text-brand-700 transition hover:bg-white sm:flex"
              to="/projects"
            >
              Khám phá dự án <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          {projects.isPending && (
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          )}
          {projects.isError && (
            <div className="mt-7">
              <ErrorState onRetry={() => projects.refetch()} />
            </div>
          )}
          {projects.data && (
            <div className="mt-7 grid gap-5 md:grid-cols-3">
              {projects.data.content.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-950 to-brand-950 px-6 py-12 text-white shadow-[var(--shadow-dialog)] sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-14">
          <div
            className="absolute -right-16 -top-24 size-72 rounded-full bg-brand-500/20 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-200">
              Dành cho người bán
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Đưa bất động sản của bạn đến đúng người.
            </h2>
            <p className="mt-4 leading-7 text-slate-300">
              Tạo tin rõ ràng, theo dõi trạng thái kiểm duyệt và xem hiệu quả ngay trong một nơi.
            </p>
          </div>
          <Link
            className="relative mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-white px-5 font-bold text-brand-950 transition hover:-translate-y-0.5 hover:bg-brand-50 lg:mt-0"
            to="/seller/listings/new"
          >
            Bắt đầu đăng tin <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  )
}
