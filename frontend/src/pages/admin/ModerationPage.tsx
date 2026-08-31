import { Link, useSearchParams } from 'react-router-dom'
import { Badge, Pagination, Select } from '@/components/ui'
import { ErrorState, Skeleton } from '@/components/feedback'
import { AdminDataTable } from '@/features/admin/components/AdminDataTable'
import { useModerationQueue } from '@/features/admin/adminQueries'
import type { ListingStatus, ModerationItem } from '@/types/domain'
import { formatDate } from '@/lib/formatters'

const allowedStatuses: ListingStatus[] = [
  'PENDING',
  'ACTIVE',
  'REJECTED',
  'REMOVED',
  'DRAFT',
  'INACTIVE',
  'EXPIRED',
]

export default function ModerationPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedStatus = searchParams.get('status') as ListingStatus | null
  const status =
    requestedStatus && allowedStatuses.includes(requestedStatus) ? requestedStatus : 'PENDING'
  const requestedPage = Number(searchParams.get('page') ?? 0)
  const page = Number.isInteger(requestedPage) && requestedPage >= 0 ? requestedPage : 0
  const query = useModerationQueue(status, page)
  const updateParams = (nextStatus: ListingStatus, nextPage: number) =>
    setSearchParams({ status: nextStatus, page: String(nextPage) })

  const columns = [
    {
      key: 'listing',
      header: 'Tin đăng',
      render: (item: ModerationItem) => (
        <div>
          <p className="font-bold">{item.title}</p>
          <p className="text-xs">{item.publicCode}</p>
        </div>
      ),
    },
    { key: 'seller', header: 'Người bán', render: (item: ModerationItem) => item.sellerEmail },
    {
      key: 'date',
      header: 'Ngày tạo',
      render: (item: ModerationItem) => formatDate(item.createdAt),
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (item: ModerationItem) => <Badge status={item.status} />,
    },
    {
      key: 'actions',
      header: 'Thao tác',
      render: (item: ModerationItem) => (
        <Link
          to={`/admin/listings/${item.id}`}
          className="inline-flex min-h-11 items-center rounded-xl border border-brand-200 bg-white px-3 text-sm font-bold text-brand-800 hover:border-brand-500 hover:bg-brand-50"
        >
          Xem chi tiết
        </Link>
      ),
    },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Kiểm duyệt tin</h1>
          <p className="mt-1 text-ink-600">Mở chi tiết để kiểm tra đầy đủ trước khi quyết định.</p>
        </div>
        <Select
          label="Trạng thái"
          value={status}
          onChange={(event) => updateParams(event.target.value as ListingStatus, 0)}
        >
          <option value="PENDING">Chờ duyệt</option>
          <option value="ACTIVE">Đang hiển thị</option>
          <option value="REJECTED">Bị từ chối</option>
          <option value="REMOVED">Đã bị gỡ</option>
          <option value="DRAFT">Bản nháp</option>
          <option value="INACTIVE">Đã ngừng</option>
          <option value="EXPIRED">Đã hết hạn</option>
        </Select>
      </div>
      {query.isPending && <Skeleton className="mt-6 h-72" />}
      {query.isError && (
        <div className="mt-6">
          <ErrorState onRetry={() => query.refetch()} />
        </div>
      )}
      {query.data && (
        <div className="mt-6">
          <AdminDataTable
            caption="Hàng đợi kiểm duyệt"
            columns={columns}
            rows={query.data.content}
            rowKey={(item) => item.id}
          />
          <div className="mt-5">
            <Pagination
              page={page}
              totalPages={query.data.totalPages}
              onPageChange={(nextPage) => updateParams(status, nextPage)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
