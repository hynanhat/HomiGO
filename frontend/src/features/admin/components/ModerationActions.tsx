import { useState } from 'react'
import { Button, Modal, Textarea } from '@/components/ui'
import { useToast } from '@/components/feedback'
import { approveListing, rejectListing } from '../adminApi'
import { useAdminMutation } from '../adminQueries'
import { getSafeErrorMessage } from '@/lib/api/apiError'

export function ModerationActions({ id, onDone }: { id: number; onDone?: () => void }) {
  const [rejectOpen, setRejectOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const { showToast } = useToast()
  const approve = useAdminMutation(() => approveListing(id))
  const reject = useAdminMutation((value: string) => rejectListing(id, value))
  const approveNow = async () => {
    try {
      await approve.mutateAsync(undefined)
      showToast({ type: 'success', title: 'Đã duyệt tin đăng' })
      onDone?.()
    } catch (cause) {
      showToast({
        type: 'error',
        title: 'Không thể duyệt',
        description: getSafeErrorMessage(cause),
      })
    }
  }
  const rejectNow = async () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do từ chối.')
      return
    }
    try {
      await reject.mutateAsync(reason.trim())
      setRejectOpen(false)
      setReason('')
      showToast({ type: 'success', title: 'Đã từ chối tin đăng' })
      onDone?.()
    } catch (cause) {
      showToast({
        type: 'error',
        title: 'Không thể từ chối',
        description: getSafeErrorMessage(cause),
      })
    }
  }
  return (
    <div className="flex gap-2">
      <Button size="sm" loading={approve.isPending} onClick={approveNow}>
        Duyệt
      </Button>
      <Button size="sm" variant="danger" onClick={() => setRejectOpen(true)}>
        Từ chối
      </Button>
      <Modal
        open={rejectOpen}
        title="Từ chối tin đăng"
        onClose={() => setRejectOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setRejectOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" loading={reject.isPending} onClick={rejectNow}>
              Xác nhận từ chối
            </Button>
          </>
        }
      >
        <Textarea
          label="Lý do từ chối"
          required
          value={reason}
          error={error}
          onChange={(event) => {
            setReason(event.target.value)
            setError('')
          }}
        />
      </Modal>
    </div>
  )
}
