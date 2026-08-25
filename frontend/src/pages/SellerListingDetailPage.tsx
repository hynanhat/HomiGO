import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Card } from '@/components/ui'
import { ErrorState, Skeleton } from '@/components/feedback'
import { ListingStatistics } from '@/features/analytics/components/ListingStatistics'
import { ListingImageUploader } from '@/features/seller/components/ListingImageUploader'
import { ListingLifecycleActions } from '@/features/seller/components/ListingLifecycleActions'
import { useSellerListing } from '@/features/seller/sellerListingQueries'
import { canManageListingImages } from '@/features/seller/listingActions'
import { formatAddress, formatCurrency, formatDate } from '@/lib/formatters'

export default function SellerListingDetailPage() {
  const id = Number(useParams().id)
  const query = useSellerListing(id)
  const navigate = useNavigate()

  if (query.isPending) return <Skeleton className="h-96" />
  if (query.isError || !query.data) return <ErrorState title="Không thể tải tin đăng" onRetry={() => query.refetch()} />

  const item = query.data
  return (
    <div className="grid gap-6">
      <Card className="p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <Badge status={item.status} />
            <h2 className="mt-3 text-2xl font-bold">{item.title}</h2>
            <p className="mt-2 text-ink-600">{item.publicCode} · Phiên bản {item.version}</p>
          </div>
          <ListingLifecycleActions
            listing={item}
            onEdit={() => navigate(`/seller/listings/${id}/edit`)}
            onDone={() => query.refetch()}
          />
        </div>
        {item.rejectionReason && (
          <p className="mt-5 rounded-lg bg-red-50 p-4 text-red-800">
            <strong>Lý do từ chối:</strong> {item.rejectionReason}
          </p>
        )}
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-sm text-ink-600">Giá</dt><dd className="font-bold">{formatCurrency(item.price)}</dd></div>
          <div><dt className="text-sm text-ink-600">Địa chỉ</dt><dd className="font-bold">{formatAddress(item)}</dd></div>
          <div><dt className="text-sm text-ink-600">Tạo lúc</dt><dd>{formatDate(item.createdAt)}</dd></div>
          <div><dt className="text-sm text-ink-600">Cập nhật</dt><dd>{formatDate(item.updatedAt)}</dd></div>
        </dl>
      </Card>

      <ListingStatistics listingId={item.id} />

      <Card className="p-6">
        {canManageListingImages(item.status) ? (
          <ListingImageUploader listingId={item.id} initialUrls={item.images} initialImageIds={item.imageIds} />
        ) : (
          <div>
            <h2 className="text-xl font-bold">Hình ảnh đang được khóa</h2>
            <p className="mt-2 text-sm text-ink-600">
              {item.status === 'ACTIVE'
                ? 'Hãy ngừng hiển thị tin trước khi thay đổi hình ảnh.'
                : item.status === 'EXPIRED'
                  ? 'Hãy chỉnh sửa tin hết hạn để tạo bản nháp mới trước khi thay đổi hình ảnh.'
                  : 'Không thể thay đổi hình ảnh trong khi tin đang chờ duyệt.'}
            </p>
          </div>
        )}
      </Card>
    </div>
  )
}
