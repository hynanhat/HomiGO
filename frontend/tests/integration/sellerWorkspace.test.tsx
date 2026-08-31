import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { http, HttpResponse } from 'msw'
import { ToastProvider } from '@/components/feedback'
import SellerDashboardPage from '@/pages/SellerDashboardPage'
import { buildApiResponse, buildPage, listingFixtures } from '../fixtures/apiFixtures'
import { server } from '../mocks/server'

describe('seller workspace', () => {
  it('renders owned listings, status tabs and valid ACTIVE actions', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <MemoryRouter>
            <SellerDashboardPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    )
    expect(await screen.findByText('Căn hộ hai phòng ngủ tại An Khánh')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Đang hiển thị' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ngừng hiển thị' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Gửi duyệt' })).not.toBeInTheDocument()
  })

  it('shows the removal reason and remediation actions for a removed listing', async () => {
    const removed = {
      ...listingFixtures[0],
      status: 'REMOVED' as const,
      removalReason: 'Thông tin pháp lý không còn hợp lệ',
      removedAt: '2026-08-18T09:00:00',
    }
    server.use(
      http.get('*/api/v1/seller/listings', () =>
        HttpResponse.json(buildApiResponse(buildPage([removed], 0, 20))),
      ),
    )
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <MemoryRouter>
            <SellerDashboardPage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    )

    expect(await screen.findByText(/Thông tin pháp lý không còn hợp lệ/)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Đã bị gỡ' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Chỉnh sửa' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Gửi duyệt' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Xóa tin' })).toBeInTheDocument()
  })
})
