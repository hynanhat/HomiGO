import { useState } from 'react'
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback'
import { Pagination } from '@/components/ui'
import { ListingCard } from '@/features/listings/components/ListingCard'
import { useSavedListings } from '@/features/saved-listings/savedListingQueries'

export default function SavedListingsPage() {
  const [page, setPage] = useState(0)
  const query = useSavedListings(page)
  return (
    <div>
      <h2 className="text-2xl font-bold">Tin đã lưu</h2>
      <p className="mt-1 text-sm text-ink-600">Danh sách bất động sản bạn đang quan tâm.</p>
      {query.isPending && (
        <div className="mt-6 grid gap-5 md:grid-cols-2">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      )}
      {query.isError && (
        <div className="mt-6">
          <ErrorState onRetry={() => query.refetch()} />
        </div>
      )}
      {query.data?.empty && (
        <div className="mt-6">
          <EmptyState
            title="Bạn chưa lưu tin nào"
            description="Nhấn biểu tượng trái tim trên tin đăng để xem lại tại đây."
          />
        </div>
      )}
      {query.data && !query.data.empty && (
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {query.data.content.map((listing) => (
            <ListingCard key={listing.publicCode} listing={listing} />
          ))}
        </div>
      )}
      {query.data && (
        <div className="mt-7">
          <Pagination page={page} totalPages={query.data.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
