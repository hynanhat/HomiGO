import { Card } from '@/components/ui'
import { ListingGallery } from '@/features/listings/components/ListingGallery'
import { formatAddress, formatArea, formatCurrency, formatDate } from '@/lib/formatters'
import type { AdminListingDetail } from '@/types/domain'

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-ink-600">{label}</dt>
      <dd className="mt-1 font-semibold text-ink-950">{value ?? '—'}</dd>
    </div>
  )
}

export function AdminListingContent({ detail }: { detail: AdminListingDetail }) {
  const { listing, seller } = detail
  return (
    <div className="grid gap-6">
      {listing.images.length > 0 ? (
        <ListingGallery listing={listing} />
      ) : (
        <Card className="grid aspect-[16/7] place-items-center border-dashed p-8 text-center">
          <div>
            <p className="font-bold text-ink-950">Tin đăng chưa có hình ảnh</p>
            <p className="mt-1 text-sm text-ink-600">
              Admin vẫn có thể kiểm tra toàn bộ nội dung bên dưới.
            </p>
          </div>
        </Card>
      )}

      <Card className="p-5 sm:p-6">
        <h2 className="text-xl font-bold">Nội dung tin đăng</h2>
        <p className="mt-4 whitespace-pre-wrap leading-7 text-ink-800">{listing.description}</p>
        <dl className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Danh mục" value={listing.categoryName} />
          <Detail
            label="Loại giao dịch"
            value={listing.transactionType === 'RENT' ? 'Cho thuê' : 'Mua bán'}
          />
          <Detail label="Giá" value={formatCurrency(listing.price)} />
          <Detail label="Diện tích" value={formatArea(listing.area)} />
          <Detail label="Dự án" value={listing.projectName || 'Không thuộc dự án'} />
          <Detail label="Phòng ngủ" value={listing.bedrooms ?? '—'} />
          <Detail label="Phòng tắm" value={listing.bathrooms ?? '—'} />
          <Detail label="Số tầng" value={listing.floors ?? '—'} />
          <Detail label="Hướng" value={listing.direction || '—'} />
          <Detail label="Nội thất" value={listing.furnishing || '—'} />
          <Detail label="Pháp lý" value={listing.legalStatus || '—'} />
        </dl>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="text-xl font-bold">Địa chỉ và liên hệ</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <Detail label="Địa chỉ đầy đủ" value={formatAddress(listing)} />
          <Detail
            label="Mã đơn vị hành chính"
            value={`${listing.provinceCode} / ${listing.communeCode}`}
          />
          <Detail
            label="Tọa độ"
            value={
              listing.latitude != null && listing.longitude != null
                ? `${listing.latitude}, ${listing.longitude}`
                : 'Chưa cung cấp'
            }
          />
          <Detail label="Người liên hệ" value={listing.contactName} />
          <Detail label="Số điện thoại liên hệ" value={listing.contactPhone} />
        </dl>
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="text-xl font-bold">Người bán và thời gian</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Detail label="Họ tên" value={seller.name} />
          <Detail label="Email" value={seller.email} />
          <Detail label="Điện thoại tài khoản" value={seller.phone || 'Chưa cung cấp'} />
          <Detail label="Trạng thái tài khoản" value={seller.status} />
          <Detail label="Ngày tạo tin" value={formatDate(listing.createdAt)} />
          <Detail label="Cập nhật gần nhất" value={formatDate(listing.updatedAt)} />
          <Detail label="Ngày duyệt" value={formatDate(listing.approvedAt)} />
          <Detail label="Ngày đăng" value={formatDate(listing.publishedAt)} />
          <Detail label="Ngày hết hạn" value={formatDate(listing.expiresAt)} />
          <Detail label="Ngày bị gỡ" value={formatDate(listing.removedAt)} />
        </dl>
      </Card>

      {(listing.rejectionReason || listing.removalReason) && (
        <Card className="border-red-200 bg-red-50 p-5 text-red-900 sm:p-6">
          <h2 className="font-bold">Lý do kiểm duyệt hiện tại</h2>
          <p className="mt-2">{listing.removalReason || listing.rejectionReason}</p>
        </Card>
      )}
    </div>
  )
}
