import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { server } from '../../../../tests/mocks/server'
import { AiDescriptionAssistant } from './AiDescriptionAssistant'
import type { ListingFormValues } from '../sellerTypes'

const listing: ListingFormValues = {
  categoryId: 1,
  provinceCode: '79',
  communeCode: '26734',
  title: 'Căn hộ sáng thoáng',
  description: 'Mô tả hiện tại',
  price: 3_200_000_000,
  area: 78,
  address: 'Nguyễn Huệ',
  bedrooms: 3,
  bathrooms: 2,
  contactName: 'An',
  contactPhone: '0901234567',
}

const quota = {
  enabled: true,
  limit: 5,
  successfulAttempts: 1,
  remainingAttempts: 4,
  availableNow: 4,
  resetAt: '2026-08-25T00:00:00+07:00',
  retryAt: null,
}

function renderAssistant(onApply = vi.fn(), currentListing = listing) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  const view = render(
    <QueryClientProvider client={client}>
      <AiDescriptionAssistant listing={currentListing} onApply={onApply} />
    </QueryClientProvider>,
  )
  return {
    onApply,
    rerender: (nextListing: ListingFormValues) =>
      view.rerender(
        <QueryClientProvider client={client}>
          <AiDescriptionAssistant listing={nextListing} onApply={onApply} />
        </QueryClientProvider>,
      ),
  }
}

describe('AI description assistant', () => {
  beforeEach(() => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    server.use(
      http.get('*/api/v1/seller/ai-description/quota', () =>
        HttpResponse.json({ success: true, data: quota, message: 'Thành công.', errorCode: null }),
      ),
      http.post('*/api/v1/seller/ai-description/drafts', async ({ request }) => {
        const body = (await request.json()) as Record<string, unknown>
        expect(body.contactPhone).toBeUndefined()
        expect(body.keywords).toBe('ban công thoáng')
        return HttpResponse.json({
          success: true,
          data: {
            description: 'Bản mô tả AI',
            quota: { ...quota, successfulAttempts: 2, remainingAttempts: 3, availableNow: 3 },
          },
          message: 'Thành công.',
          errorCode: null,
        })
      }),
    )
  })

  it('generates a separate preview and only changes description on apply', async () => {
    const user = userEvent.setup()
    const { onApply } = renderAssistant()
    await screen.findByText('Còn 4/5 lượt hôm nay')
    await user.type(screen.getByLabelText('Từ khóa nổi bật'), 'ban công thoáng')
    await user.click(screen.getByRole('button', { name: 'Tạo mô tả' }))
    expect(await screen.findByText('Bản mô tả AI')).toBeInTheDocument()
    expect(onApply).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Áp dụng vào mô tả' }))
    expect(onApply).toHaveBeenCalledWith('Bản mô tả AI')
  })

  it('can cancel without overwriting and prevents duplicate requests while pending', async () => {
    let calls = 0
    server.use(
      http.post('*/api/v1/seller/ai-description/drafts', async () => {
        calls += 1
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({
          success: true,
          data: { description: 'Bản mô tả AI', quota },
          message: 'ok',
          errorCode: null,
        })
      }),
    )
    const user = userEvent.setup()
    const { onApply } = renderAssistant()
    await screen.findByText('Còn 4/5 lượt hôm nay')
    await user.type(screen.getByLabelText('Từ khóa nổi bật'), 'ban công thoáng')
    const button = screen.getByRole('button', { name: 'Tạo mô tả' })
    await user.dblClick(button)
    expect(await screen.findByText('Bản mô tả AI')).toBeInTheDocument()
    expect(calls).toBe(1)
    await user.click(screen.getByRole('button', { name: 'Hủy bản xem trước' }))
    expect(screen.queryByText('Bản mô tả AI')).not.toBeInTheDocument()
    expect(onApply).not.toHaveBeenCalled()
  })

  it('shows exhaustion and leaves manual editing available', async () => {
    server.use(
      http.get('*/api/v1/seller/ai-description/quota', () =>
        HttpResponse.json({
          success: true,
          data: { ...quota, successfulAttempts: 5, remainingAttempts: 0, availableNow: 0 },
          message: 'ok',
          errorCode: null,
        }),
      ),
    )
    renderAssistant()
    expect(await screen.findByText(/Đã hết 5 lượt hôm nay/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo mô tả' })).toBeDisabled()
  })

  it('shows safe fallback when generation fails', async () => {
    server.use(
      http.post('*/api/v1/seller/ai-description/drafts', () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            message: 'Dịch vụ AI tạm thời không khả dụng.',
            errorCode: 'AI_SERVICE_UNAVAILABLE',
          },
          { status: 503 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderAssistant()
    await screen.findByText('Còn 4/5 lượt hôm nay')
    await user.type(screen.getByLabelText('Từ khóa nổi bật'), 'ban công thoáng')
    await user.click(screen.getByRole('button', { name: 'Tạo mô tả' }))
    expect(await screen.findByText(/Hệ thống đang gặp sự cố/)).toBeInTheDocument()
  })

  it('warns when form facts changed and confirms regeneration', async () => {
    const user = userEvent.setup()
    const view = renderAssistant()
    await screen.findByText('Còn 4/5 lượt hôm nay')
    await user.type(screen.getByLabelText('Từ khóa nổi bật'), 'ban công thoáng')
    await user.click(screen.getByRole('button', { name: 'Tạo mô tả' }))
    await screen.findByText('Bản mô tả AI')
    view.rerender({ ...listing, area: 90 })
    expect(await screen.findByText(/Thông tin form đã thay đổi/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Tạo lại mô tả' }))
    expect(window.confirm).toHaveBeenCalledWith(expect.stringContaining('thay thế bản xem trước'))
  })

  it('shows a temporary reservation state with retry guidance', async () => {
    server.use(
      http.get('*/api/v1/seller/ai-description/quota', () =>
        HttpResponse.json({
          success: true,
          data: {
            ...quota,
            remainingAttempts: 3,
            availableNow: 0,
            retryAt: '2026-08-24T09:30:00+07:00',
          },
          message: 'ok',
          errorCode: null,
        }),
      ),
    )
    renderAssistant()
    expect(await screen.findByText(/Các lượt đang được xử lý/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tạo mô tả' })).toBeDisabled()
  })
})
