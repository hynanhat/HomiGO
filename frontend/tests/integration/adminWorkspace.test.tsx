import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/feedback'
import ModerationPage from '@/pages/admin/ModerationPage'
import UserManagementPage from '@/pages/admin/UserManagementPage'
import CategoryManagementPage from '@/pages/admin/CategoryManagementPage'

function renderAdmin(node: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter>{node}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}
describe('admin workspace', () => {
  it('approves and opens required-reason rejection', async () => {
    renderAdmin(<ModerationPage />)
    expect(await screen.findByText('Nhà phố cần duyệt')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Từ chối' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận từ chối' }))
    expect(await screen.findByText('Vui lòng nhập lý do từ chối.')).toBeInTheDocument()
  })
  it('guards current user state actions', async () => {
    renderAdmin(<UserManagementPage />)
    expect(await screen.findByText('seller@homigo.vn')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Khóa' })).toBeEnabled()
  })
  it('completes category create flow', async () => {
    renderAdmin(<CategoryManagementPage />)
    await screen.findByText('Căn hộ')
    fireEvent.click(screen.getByRole('button', { name: 'Thêm danh mục' }))
    fireEvent.change(screen.getByLabelText(/Tên danh mục/), { target: { value: 'Đất nền' } })
    fireEvent.change(screen.getByLabelText(/Slug/), { target: { value: 'dat-nen' } })
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }))
    expect(await screen.findByText('Đã lưu danh mục')).toBeInTheDocument()
  })
})
