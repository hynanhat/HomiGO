import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { buildApiResponse, buildPage } from '../../tests/fixtures/apiFixtures'
import { server } from '../../tests/mocks/server'
import NotificationsPage from './NotificationsPage'

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <NotificationsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('NotificationsPage', () => {
  it('renders unread updates and supports both read actions', async () => {
    const user = userEvent.setup()
    let markedNotification = 0
    let markedAll = 0
    server.use(
      http.patch('*/api/v1/notifications/:notificationId/read', ({ params }) => {
        markedNotification = Number(params.notificationId)
        return HttpResponse.json(buildApiResponse(null))
      }),
      http.patch('*/api/v1/notifications/read-all', () => {
        markedAll += 1
        return HttpResponse.json(buildApiResponse({ updatedCount: 1 }))
      }),
    )

    renderPage()

    expect(await screen.findByText('Tin đăng đã được duyệt')).toBeInTheDocument()
    expect(screen.getByText('1 thông báo chưa đọc')).toBeInTheDocument()
    expect(screen.getByText('Mới')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mở chi tiết' })).toHaveAttribute(
      'href',
      '/listings/HMG-2026-000101',
    )

    await user.click(screen.getByRole('button', { name: 'Đã đọc' }))
    await waitFor(() => expect(markedNotification).toBe(701))

    await user.click(screen.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' }))
    await waitFor(() => expect(markedAll).toBe(1))
  })

  it('explains the empty unread filter state', async () => {
    const user = userEvent.setup()
    const unreadFilters: string[] = []
    server.use(
      http.get('*/api/v1/notifications', ({ request }) => {
        const url = new URL(request.url)
        unreadFilters.push(url.searchParams.get('unreadOnly') ?? 'false')
        return HttpResponse.json(buildApiResponse(buildPage([], 0, 20)))
      }),
      http.get('*/api/v1/notifications/unread-count', () =>
        HttpResponse.json(buildApiResponse({ count: 0 })),
      ),
    )

    renderPage()

    expect(await screen.findByText('Chưa có thông báo')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Đánh dấu tất cả đã đọc' })).toBeDisabled()

    await user.click(screen.getByRole('checkbox', { name: 'Chỉ xem chưa đọc' }))
    expect(await screen.findByText('Bạn đã đọc hết các thông báo hiện có.')).toBeInTheDocument()
    expect(unreadFilters).toContain('true')
  })
})
