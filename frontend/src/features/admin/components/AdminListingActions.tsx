import { useState } from 'react'
import { Button, Card, Modal, Textarea } from '@/components/ui'
import { useToast } from '@/components/feedback'
import { toApiError } from '@/lib/api/apiError'
import type { Listing } from '@/types/domain'
import { approveListing, rejectListing, removeListing } from '../adminApi'
import { useAdminMutation } from '../adminQueries'

type ReasonAction = 'reject' | 'remove'

export function AdminListingActions({
  listing,
  onChanged,
}: {
  listing: Listing
  onChanged: () => Promise<unknown>
}) {
  const [action, setAction] = useState<ReasonAction | null>(null)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const approve = useAdminMutation(() => approveListing(listing.id, listing.version))
  const decide = useAdminMutation((value: { action: ReasonAction; reason: string }) =>
    value.action === 'reject'
      ? rejectListing(listing.id, value.reason, listing.version)
      : removeListing(listing.id, value.reason, listing.version),
  )

  const reportFailure = async (cause: unknown, title: string) => {
    const apiError = toApiError(cause)
    showToast({
      type: apiError.status === 409 ? 'warning' : 'error',
      title: apiError.status === 409 ? 'Tin đăng đã thay đổi' : title,
      description:
        apiError.status === 409
          ? 'Dữ liệu mới nhất đang được tải lại. Hãy kiểm tra trước khi thao tác tiếp.'
          : apiError.message,
    })
    if (apiError.status === 409) await onChanged()
  }

  const approveNow = async () => {
    try {
      await approve.mutateAsync(undefined)
      showToast({ type: 'success', title: 'Đã duyệt tin đăng' })
      await onChanged()
    } catch (cause) {
      await reportFailure(cause, 'Không thể duyệt tin')
    }
  }

  const confirmReasonAction = async () => {
    if (!action) return
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Vui lòng nhập lý do.')
      return
    }
    if (action === 'remove' && (trimmed.length < 5 || trimmed.length > 500)) {
      setError('Lý do gỡ tin phải có từ 5 đến 500 ký tự.')
      return
    }
    try {
      await decide.mutateAsync({ action, reason: trimmed })
      showToast({
        type: 'success',
        title: action === 'remove' ? 'Đã gỡ tin khỏi công khai' : 'Đã từ chối tin đăng',
      })
      setAction(null)
      setReason('')
      await onChanged()
    } catch (cause) {
      await reportFailure(cause, action === 'remove' ? 'Không thể gỡ tin' : 'Không thể từ chối tin')
    }
  }

  return (
    <Card className="p-5">
      <h2 className="text-lg font-bold">Quyết định kiểm duyệt</h2>
      {listing.status === 'PENDING' && (
        <div className="mt-4 grid gap-3">
          <Button loading={approve.isPending} onClick={approveNow}>
            Duyệt tin
          </Button>
          <Button variant="danger" onClick={() => setAction('reject')}>
            Từ chối
          </Button>
        </div>
      )}
      {listing.status === 'ACTIVE' && (
        <Button className="mt-4 w-full" variant="danger" onClick={() => setAction('remove')}>
          Gỡ khỏi công khai
        </Button>
      )}
      {!['PENDING', 'ACTIVE'].includes(listing.status) && (
        <p className="mt-3 text-sm text-ink-600">
          Trạng thái này chỉ cho phép xem lại nội dung và lịch sử.
        </p>
      )}

      <Modal
        open={Boolean(action)}
        title={action === 'remove' ? 'Gỡ tin khỏi công khai' : 'Từ chối tin đăng'}
        onClose={() => {
          if (!decide.isPending) setAction(null)
        }}
        footer={
          <>
            <Button variant="secondary" disabled={decide.isPending} onClick={() => setAction(null)}>
              Hủy
            </Button>
            <Button variant="danger" loading={decide.isPending} onClick={confirmReasonAction}>
              {action === 'remove' ? 'Xác nhận gỡ tin' : 'Xác nhận từ chối'}
            </Button>
          </>
        }
      >
        {action === 'remove' && (
          <p className="mb-4 text-sm text-ink-700">
            Tin sẽ biến mất khỏi các trang công khai nhưng vẫn được lưu để kiểm tra và cho người bán
            sửa lại.
          </p>
        )}
        <Textarea
          label={action === 'remove' ? 'Lý do gỡ tin' : 'Lý do từ chối'}
          required
          maxLength={action === 'remove' ? 500 : 1000}
          value={reason}
          error={error}
          onChange={(event) => {
            setReason(event.target.value)
            setError('')
          }}
        />
      </Modal>
    </Card>
  )
}
