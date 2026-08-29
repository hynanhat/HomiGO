import { Button, Modal } from '@/components/ui'
export function DeleteConfirmation({
  open,
  name,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean
  name: string
  loading?: boolean
  onClose: () => void
  onConfirm: () => void
}) {
  return (
    <Modal
      open={open}
      title="Xác nhận xóa"
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="danger" loading={loading} onClick={onConfirm}>
            Xóa
          </Button>
        </>
      }
    >
      <p>
        Bạn chắc chắn muốn xóa <strong>{name}</strong>? Thao tác có thể bị từ chối nếu dữ liệu đang
        được sử dụng.
      </p>
    </Modal>
  )
}
