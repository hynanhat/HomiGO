import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/feedback'
import LocationManagementPage from '@/pages/admin/LocationManagementPage'
import { server } from '../mocks/server'

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <ToastProvider>
        <LocationManagementPage />
      </ToastProvider>
    </QueryClientProvider>,
  )
}

describe('production bootstrap administration', () => {
  it('validates, confirms activation and initializes production categories', async () => {
    const user = userEvent.setup()
    renderPage()

    expect(screen.getByText('vn-administrative-units-2025-07-01')).toBeInTheDocument()
    await screen.findAllByText('Đã kiểm tra')
    expect(screen.getAllByText('Cục Thống kê').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText((_, element) => element?.textContent === '3.321 / 3.321').length,
    ).toBeGreaterThan(0)
    expect(screen.getByText('categories-v1')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Kiểm tra bộ dữ liệu' }))
    expect(await screen.findByText('Bộ dữ liệu hợp lệ')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Kích hoạt bộ dữ liệu' }))
    expect(
      screen.getByRole('dialog', { name: 'Xác nhận kích hoạt dữ liệu địa giới' }),
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Xác nhận kích hoạt' }))
    expect(await screen.findByText('Đã kích hoạt bộ dữ liệu')).toBeInTheDocument()
    expect(screen.getAllByText('Đang hoạt động').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: 'Khởi tạo 16 danh mục' }))
    expect(await screen.findByText('Đã khởi tạo danh mục production')).toBeInTheDocument()
    expect(screen.getAllByText(/tạo mới 13, giữ nguyên 3/i).length).toBeGreaterThan(0)
  })

  it('announces validation failures with recovery information', async () => {
    server.use(
      http.post('*/api/v1/admin/location-datasets/:datasetVersion/validate', () =>
        HttpResponse.json(
          {
            success: false,
            data: null,
            message: 'Checksum tỉnh/thành phố không khớp. Hãy kiểm tra artifact đã đóng gói.',
            errorCode: 'ADMINISTRATIVE_DATASET_INVALID',
          },
          { status: 400 },
        ),
      ),
    )
    const user = userEvent.setup()
    renderPage()

    await screen.findAllByText('Đã kiểm tra')
    await user.click(screen.getByRole('button', { name: 'Kiểm tra bộ dữ liệu' }))
    expect(
      (await screen.findAllByText(/Checksum tỉnh\/thành phố không khớp/)).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByRole('alert').length).toBeGreaterThan(0)
  })
})
