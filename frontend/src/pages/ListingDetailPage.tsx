import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback'
import { ListingDetails } from '@/features/listings/components/ListingDetails'
import { ListingGallery } from '@/features/listings/components/ListingGallery'
import { useListingDetail } from '@/features/listings/listingQueries'
import { recordListingView } from '@/features/analytics/analyticsApi'
import { RecommendationSection } from '@/features/recommendations/components/RecommendationSection'

export default function ListingDetailPage() {
  const { publicCode = '' } = useParams()
  const query = useListingDetail(publicCode)
  useEffect(() => {
    document.title = query.data ? `${query.data.title} | HomiGO` : 'Chi tiết bất động sản | HomiGO'
    return () => {
      document.title = 'HomiGO'
    }
  }, [query.data])

  useEffect(() => {
    if (!query.data?.publicCode) return
    void recordListingView(query.data.publicCode).catch(() => {
      // Analytics failure must never block the property detail experience.
    })
  }, [query.data?.publicCode])

  if (query.isPending)
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Skeleton className="aspect-[16/7] w-full" />
        <Skeleton className="mt-6 h-64 w-full" />
      </main>
    )
  if (query.isError)
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title="Tin đăng không khả dụng"
          description="Tin có thể đã hết hạn, ngừng hiển thị hoặc không tồn tại."
          onRetry={() => query.refetch()}
        />
      </main>
    )
  if (!query.data)
    return (
      <main className="mx-auto max-w-4xl px-4 py-16">
        <EmptyState
          title="Không tìm thấy tin đăng"
          action={
            <Link className="font-semibold text-brand-700" to="/listings">
              Quay lại danh sách
            </Link>
          }
        />
      </main>
    )

  return (
    <main className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl space-y-7 px-4 sm:px-6 lg:px-8">
        <nav
          aria-label="Đường dẫn"
          className="flex min-h-11 items-center gap-2 text-sm font-semibold text-ink-600"
        >
          <Link
            to="/listings"
            className="rounded-lg px-2 py-1 hover:bg-brand-50 hover:text-brand-700"
          >
            Bất động sản
          </Link>
          <span aria-hidden="true">/</span>
          <span>{query.data.publicCode}</span>
        </nav>
        <ListingGallery listing={query.data} />
        <ListingDetails listing={query.data} />
        <RecommendationSection publicCode={query.data.publicCode} />
      </div>
    </main>
  )
}
