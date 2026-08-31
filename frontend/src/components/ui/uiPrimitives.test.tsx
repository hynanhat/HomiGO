import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'
import { describe, expect, it, vi } from 'vitest'
import { Badge, Button, Input, Modal, Pagination, Select, Textarea } from './index'

describe('UI primitives', () => {
  it('supports button activation and disabled state', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <>
        <Button onClick={onClick}>Lưu thay đổi</Button>
        <Button disabled>Đang xử lý</Button>
      </>,
    )

    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))
    await user.click(screen.getByRole('button', { name: 'Đang xử lý' }))
    expect(onClick).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'Đang xử lý' })).toBeDisabled()
  })

  it('connects labels, hints, and errors to form controls', () => {
    render(
      <>
        <Input label="Tiêu đề" hint="Tối đa 200 ký tự" error="Vui lòng nhập tiêu đề" />
        <Select label="Loại giao dịch" defaultValue="">
          <option value="">Chọn loại</option>
          <option value="BUY">Mua bán</option>
        </Select>
        <Textarea label="Mô tả" />
      </>,
    )

    expect(screen.getByLabelText('Tiêu đề')).toHaveAccessibleDescription(
      'Tối đa 200 ký tự Vui lòng nhập tiêu đề',
    )
    expect(screen.getByLabelText('Tiêu đề')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Loại giao dịch')).toBeInTheDocument()
    expect(screen.getByLabelText('Mô tả')).toBeInTheDocument()
  })

  it('closes a modal with Escape and exposes dialog semantics', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(
      <Modal open title="Xác nhận thao tác" onClose={onClose}>
        <p>Bạn có chắc chắn?</p>
      </Modal>,
    )

    expect(screen.getByRole('dialog', { name: 'Xác nhận thao tác' })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('contains keyboard focus inside an open modal', async () => {
    const user = userEvent.setup()
    render(
      <>
        <Button>Ngoài hộp thoại</Button>
        <Modal open title="Nhập lý do" onClose={vi.fn()} footer={<Button>Xác nhận</Button>}>
          <Textarea label="Lý do" />
        </Modal>
      </>,
    )

    const close = screen.getByRole('button', { name: 'Đóng hộp thoại' })
    const confirm = screen.getByRole('button', { name: 'Xác nhận' })
    expect(screen.getByRole('dialog')).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(confirm).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
  })

  it('navigates pages and announces a listing status with text', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    render(
      <>
        <Pagination page={0} totalPages={3} onPageChange={onPageChange} />
        <Badge status="PENDING" />
      </>,
    )

    expect(screen.getByText('Chờ duyệt')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Trang trước' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Trang sau' }))
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it('has no detectable structural accessibility violation', async () => {
    const { container } = render(
      <main>
        <h1>Biểu mẫu tin đăng</h1>
        <Input label="Tên liên hệ" />
        <Button>Tiếp tục</Button>
      </main>,
    )
    const results = await axe(container, { rules: { 'color-contrast': { enabled: false } } })
    expect(results.violations).toEqual([])
  })
})
