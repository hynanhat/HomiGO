import { LayoutGrid, Rows3 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback'
import { Button, Pagination, Select } from '@/components/ui'
import { ListingCard } from '@/features/listings/components/ListingCard'
import { ListingFilterDrawer, ListingFilterPanel } from '@/features/listings/components/ListingFilters'
import { useListingSearch } from '@/features/listings/listingQueries'
import { parseListingSearchParams, serializeListingSearchState, updateListingFilters } from '@/features/listings/listingSearchState'
import type { ListingSearchState, ListingSort } from '@/types/domain'

export default function ListingPage() {
  const [params, setParams] = useSearchParams()
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  const state = useMemo(() => parseListingSearchParams(params), [params])
  const query = useListingSearch(state)
  const update = (updates: Partial<ListingSearchState>) => setParams(serializeListingSearchState(updateListingFilters(state, updates)))

  return (
    <main className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6"><h1 className="text-3xl font-extrabold text-ink-950">Bất động sản</h1><p className="mt-2 text-ink-600">Tìm kiếm tin đăng ACTIVE theo nhu cầu và khu vực của bạn.</p></div>
        <ListingFilterDrawer value={state} onChange={update} />
        <div className="mt-5 grid gap-6 lg:grid-cols-[18rem_1fr]">
          <div className="hidden lg:block"><ListingFilterPanel value={state} onChange={update} /></div>
          <section aria-label="Kết quả tìm kiếm">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <p className="font-semibold text-ink-800" aria-live="polite">{query.data ? `${query.data.totalElements.toLocaleString('vi-VN')} kết quả` : 'Đang tìm kiếm…'}</p>
              <div className="flex items-end gap-2">
                <Select label="Sắp xếp" value={state.sort} onChange={(event) => update({ sort: event.target.value as ListingSort })}><option value="newest">Mới nhất</option><option value="priceAsc">Giá tăng dần</option><option value="priceDesc">Giá giảm dần</option><option value="areaAsc">Diện tích tăng dần</option><option value="areaDesc">Diện tích giảm dần</option></Select>
                <div className="hidden gap-1 sm:flex" aria-label="Kiểu hiển thị"><Button variant={layout === 'grid' ? 'primary' : 'secondary'} aria-label="Dạng lưới" onClick={() => setLayout('grid')}><LayoutGrid className="size-4" /></Button><Button variant={layout === 'list' ? 'primary' : 'secondary'} aria-label="Dạng danh sách" onClick={() => setLayout('list')}><Rows3 className="size-4" /></Button></div>
              </div>
            </div>
            {query.isPending && <div className="grid gap-5 md:grid-cols-2">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-80" />)}</div>}
            {query.isError && <ErrorState description="Không thể tải danh sách bất động sản." onRetry={() => query.refetch()} />}
            {query.data?.empty && <EmptyState title="Không tìm thấy bất động sản" description="Hãy thử bỏ bớt bộ lọc hoặc thay đổi khu vực tìm kiếm." />}
            {query.data && !query.data.empty && <div className={layout === 'grid' ? 'grid gap-5 md:grid-cols-2' : 'grid gap-5'}>{query.data.content.map((listing) => <ListingCard key={listing.publicCode} listing={listing} compact={layout === 'list'} />)}</div>}
            {query.data && <div className="mt-7"><Pagination page={state.page} totalPages={query.data.totalPages} disabled={query.isFetching} onPageChange={(page) => update({ page })} /></div>}
          </section>
        </div>
      </div>
    </main>
  )
}
