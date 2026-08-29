import { useState } from 'react'
import { Badge, Pagination, Select } from '@/components/ui'
import { ErrorState, Skeleton } from '@/components/feedback'
import { AdminDataTable } from '@/features/admin/components/AdminDataTable'
import { ModerationActions } from '@/features/admin/components/ModerationActions'
import { useModerationQueue } from '@/features/admin/adminQueries'
import type { ListingStatus, ModerationItem } from '@/types/domain'
import { formatDate } from '@/lib/formatters'

export default function ModerationPage() {
  const [status, setStatus] = useState<ListingStatus>('PENDING')
  const [page, setPage] = useState(0)
  const query = useModerationQueue(status, page)
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
      render: (item: ModerationItem) =>
        item.status === 'PENDING' ? (
          <ModerationActions id={item.id} onDone={() => query.refetch()} />
        ) : (
          '—'
        ),
    },
  ]
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold">Kiểm duyệt tin</h2>
          <p className="mt-1 text-ink-600">Xử lý hàng đợi theo trạng thái.</p>
        </div>
        <Select
          label="Trạng thái"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value as ListingStatus)
            setPage(0)
          }}
        >
          <option value="PENDING">Chờ duyệt</option>
          <option value="ACTIVE">Đang hiển thị</option>
          <option value="REJECTED">Bị từ chối</option>
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
            <Pagination page={page} totalPages={query.data.totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  )
}
