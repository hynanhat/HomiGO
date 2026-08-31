import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/feedback'
import SellerDashboardPage from '@/pages/SellerDashboardPage'

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
})
