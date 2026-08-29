import { useState } from 'react'
import { Button, Modal } from '@/components/ui'
import { useToast } from '@/components/feedback'
import type { SellerListing, ListingLifecycleAction } from '../sellerTypes'
import { canRunListingAction } from '../listingActions'
import { useSellerLifecycle } from '../sellerListingQueries'
import { getSafeErrorMessage } from '@/lib/api/apiError'

const labels: Record<ListingLifecycleAction, string> = {
  edit: 'Chỉnh sửa',
  submit: 'Gửi duyệt',
  deactivate: 'Ngừng hiển thị',
  delete: 'Xóa tin',
}
export function ListingLifecycleActions({
  listing,
  onEdit,
  onDone,
}: {
  listing: SellerListing
  onEdit?: () => void
  onDone?: () => void
}) {
  const [confirm, setConfirm] = useState<Exclude<ListingLifecycleAction, 'edit'> | null>(null)
  const lifecycle = useSellerLifecycle()
  const { showToast } = useToast()
  const run = async () => {
    if (!confirm) return
    try {
      if (confirm === 'submit') await lifecycle.submit.mutateAsync(listing.id)
      else if (confirm === 'deactivate') await lifecycle.deactivate.mutateAsync(listing.id)
      else await lifecycle.remove.mutateAsync(listing.id)
      showToast({ type: 'success', title: `${labels[confirm]} thành công` })
      setConfirm(null)
      onDone?.()
    } catch (error) {
      showToast({
        type: 'error',
        title: `Không thể ${labels[confirm].toLowerCase()}`,
        description: getSafeErrorMessage(error),
      })
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      {canRunListingAction(listing.status, 'edit') && (
        <Button size="sm" variant="secondary" onClick={onEdit}>
          Chỉnh sửa
        </Button>
      )}
      {(['submit', 'deactivate', 'delete'] as const)
        .filter((action) => canRunListingAction(listing.status, action))
        .map((action) => (
          <Button
            key={action}
            size="sm"
            variant={action === 'delete' ? 'danger' : 'secondary'}
            onClick={() => setConfirm(action)}
          >
            {labels[action]}
          </Button>
        ))}
      <Modal
        open={Boolean(confirm)}
        title={`Xác nhận ${confirm ? labels[confirm].toLowerCase() : ''}`}
        onClose={() => setConfirm(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(null)}>
              Hủy
            </Button>
            <Button
              variant={confirm === 'delete' ? 'danger' : 'primary'}
              loading={
                lifecycle.submit.isPending ||
                lifecycle.deactivate.isPending ||
                lifecycle.remove.isPending
              }
              onClick={run}
            >
              Xác nhận
            </Button>
          </>
        }
      >
        <p>Thao tác sẽ cập nhật trạng thái tin đăng ngay lập tức. Bạn có muốn tiếp tục?</p>
      </Modal>
    </div>
  )
}
