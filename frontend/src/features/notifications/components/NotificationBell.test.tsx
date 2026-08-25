import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { NotificationBell } from './NotificationBell'

function renderBell() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter><NotificationBell /></MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('NotificationBell', () => {
  it('shows unread count and the latest private notification', async () => {
    const user = userEvent.setup()
    renderBell()

    const trigger = await screen.findByRole('button', { name: /Thông báo, 1 chưa đọc/ })
    await user.click(trigger)

    expect(await screen.findByRole('dialog', { name: 'Thông báo mới' })).toBeInTheDocument()
    expect(screen.getByText('Tin đăng đã được duyệt')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Xem tất cả thông báo' })).toHaveAttribute('href', '/notifications')
  })
})
