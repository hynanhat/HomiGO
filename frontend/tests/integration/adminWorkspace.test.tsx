import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/feedback'
import AdminListingDetailPage from '@/pages/admin/AdminListingDetailPage'
import ModerationPage from '@/pages/admin/ModerationPage'
import UserManagementPage from '@/pages/admin/UserManagementPage'
import CategoryManagementPage from '@/pages/admin/CategoryManagementPage'

function renderAdmin(node: React.ReactNode, initialEntries = ['/']) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <MemoryRouter initialEntries={initialEntries}>{node}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('admin workspace', () => {
  it('requires opening detail before moderation', async () => {
    renderAdmin(<ModerationPage />)
    expect(await screen.findByText('Nhà phố cần duyệt')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem chi tiết' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Duyệt tin' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Từ chối' })).not.toBeInTheDocument()
  })

  it('shows complete detail actions and validates the rejection reason', async () => {
    renderAdmin(
      <Routes>
        <Route path="/admin/listings/:id" element={<AdminListingDetailPage />} />
      </Routes>,
      ['/admin/listings/401'],
    )
    expect(await screen.findByRole('heading', { name: 'Nhà phố cần duyệt' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Nội dung tin đăng' })).toBeInTheDocument()
    expect(screen.getByText('seller@homigo.vn')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Từ chối' }))
    fireEvent.click(screen.getByRole('button', { name: 'Xác nhận từ chối' }))
    expect(await screen.findByText('Vui lòng nhập lý do.')).toBeInTheDocument()
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
