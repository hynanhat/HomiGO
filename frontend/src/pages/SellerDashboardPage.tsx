import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge, Button, Card, Pagination } from '@/components/ui'
import { EmptyState, ErrorState, Skeleton } from '@/components/feedback'
import { formatCurrency } from '@/lib/formatters'
import type { ListingStatus } from '@/types/domain'
import { useSellerListings } from '@/features/seller/sellerListingQueries'
import { ListingLifecycleActions } from '@/features/seller/components/ListingLifecycleActions'

const tabs: Array<{ label: string; value?: ListingStatus }> = [
  { label: 'Tất cả' },
  { label: 'Bản nháp', value: 'DRAFT' },
  { label: 'Chờ duyệt', value: 'PENDING' },
  { label: 'Đang hiển thị', value: 'ACTIVE' },
  { label: 'Bị từ chối', value: 'REJECTED' },
]

export default function SellerDashboardPage() {
  const [page, setPage] = useState(0)
  const [status, setStatus] = useState<ListingStatus>()
  const query = useSellerListings(page)
  const navigate = useNavigate()
  const visible = useMemo(
    () => query.data?.content.filter((item) => !status || item.status === status) ?? [],
    [query.data, status],
  )

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Danh mục của bạn</p>
          <h2 className="text-2xl font-bold">Tin đăng của tôi</h2>
          <p className="mt-1 text-sm text-ink-600">Theo dõi toàn bộ vòng đời nội dung.</p>
        </div>
        <Link
          className="inline-flex min-h-12 items-center rounded-xl bg-accent-600 px-4 text-sm font-bold text-white shadow-[0_10px_24px_rgb(3_105_161/0.18)] transition hover:-translate-y-0.5 hover:bg-accent-700"
          to="/seller/listings/new"
        >
          Tạo tin mới
        </Link>
      </div>

      <div className="mt-6 flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => (
          <Button
            key={tab.label}
            size="sm"
            variant={status === tab.value ? 'primary' : 'secondary'}
            role="tab"
            aria-selected={status === tab.value}
            onClick={() => {
              setStatus(tab.value)
              setPage(0)
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {query.isPending && <Skeleton className="mt-6 h-72" />}
      {query.isError && (
        <div className="mt-6">
          <ErrorState onRetry={() => query.refetch()} />
        </div>
      )}
      {query.data && visible.length === 0 && (
        <div className="mt-6">
          <EmptyState title="Không có tin ở trạng thái này" />
        </div>
      )}

      <div className="mt-6 grid gap-4">
        {visible.map((listing) => (
          <Card
            key={listing.id}
            className="p-5 transition duration-300 hover:shadow-[var(--shadow-card-hover)]"
          >
            <div className="flex flex-wrap justify-between gap-4">
              <div className="min-w-0 flex-1">
                <Badge status={listing.status} />
                <Link
                  to={`/seller/listings/${listing.id}`}
                  className="mt-3 block text-lg font-bold hover:text-brand-700"
                >
                  {listing.title}
                </Link>
                <p className="mt-1 text-sm text-ink-600">
                  {formatCurrency(listing.price)} · {listing.publicCode}
                </p>
                {listing.rejectionReason && (
                  <p className="mt-3 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-800">
                    <strong>Lý do từ chối:</strong> {listing.rejectionReason}
                  </p>
                )}
              </div>
              <ListingLifecycleActions
                listing={listing}
                onEdit={() => navigate(`/seller/listings/${listing.id}/edit`)}
                onDone={() => query.refetch()}
              />
            </div>
          </Card>
        ))}
      </div>

      {query.data && (
        <div className="mt-7">
          <Pagination page={page} totalPages={query.data.totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
