import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { axe } from 'vitest-axe'
import {
  Badge,
  Button,
  Input,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/components/ui'
import { EmptyState, ErrorState } from '@/components/feedback'

describe('representative accessibility', () => {
  it('has no serious violations across public/account/seller form primitives', async () => {
    const { container } = render(
      <main>
        <h1>Trang đại diện</h1>
        <nav aria-label="Điều hướng">
          <a href="#content">Nội dung</a>
        </nav>
        <section id="content" aria-labelledby="form-title">
          <h2 id="form-title">Biểu mẫu</h2>
          <Input label="Tiêu đề" required error="Cần nhập tiêu đề" />
          <Textarea label="Mô tả" />
          <Button>Lưu</Button>
          <Badge status="PENDING" />
        </section>
        <EmptyState />
        <ErrorState />
      </main>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
  it('has an accessible modal and data table', async () => {
    const { container } = render(
      <>
        <Modal open title="Xác nhận" onClose={vi.fn()} footer={<Button>Xác nhận</Button>}>
          <p>Bạn có muốn tiếp tục?</p>
        </Modal>
        <Table>
          <caption>Danh sách người dùng</caption>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Trạng thái</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>an@test.vn</TableCell>
              <TableCell>Hoạt động</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </>,
    )
    expect(await axe(container)).toHaveNoViolations()
  })
})
