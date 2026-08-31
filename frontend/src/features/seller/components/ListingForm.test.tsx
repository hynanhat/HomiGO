import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { ListingFormValues } from '../sellerTypes'
import { emptyListingForm, ListingForm } from './ListingForm'

vi.mock('./AiDescriptionAssistant', () => ({
  AiDescriptionAssistant: ({ onApply }: { onApply: (description: string) => void }) => (
    <button type="button" onClick={() => onApply('Mô tả được đề xuất')}>
      Dùng mô tả đề xuất
    </button>
  ),
}))

const validListing: ListingFormValues = {
  categoryId: 11,
  provinceCode: '79',
  communeCode: '26734',
  projectId: 201,
  title: 'Căn hộ nhiều ánh sáng',
  description: 'Mô tả ban đầu',
  price: 5_800_000_000,
  area: 82,
  bedrooms: 2,
  bathrooms: 2,
  floors: 18,
  direction: 'Đông Nam',
  furnishing: 'Đầy đủ',
  legalStatus: 'Sổ hồng',
  address: '12 Nguyễn Văn Hưởng',
  latitude: 10.804,
  longitude: 106.732,
  contactName: 'Trần Bình',
  contactPhone: '0901234567',
  version: 1,
}

function renderForm(
  onSubmit = vi.fn(),
  initialValue: ListingFormValues | undefined = validListing,
) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  render(
    <QueryClientProvider client={client}>
      <ListingForm initialValue={initialValue} onSubmit={onSubmit} />
    </QueryClientProvider>,
  )
  return onSubmit
}

describe('ListingForm', () => {
  it('updates classification and optional values before submitting valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm()

    await screen.findByRole('option', { name: 'Căn hộ' })
    await user.selectOptions(screen.getByLabelText(/^Danh mục/), '12')
    await user.selectOptions(screen.getByLabelText(/Tỉnh \/ thành phố/), '79')
    await screen.findByRole('option', { name: 'Phường An Khánh' })
    await user.selectOptions(screen.getByLabelText(/Phường \/ xã \/ đặc khu/), '26734')
    await user.selectOptions(screen.getByLabelText('Dự án'), '201')

    await user.clear(screen.getByLabelText(/^Tiêu đề/))
    await user.type(screen.getByLabelText(/^Tiêu đề/), 'Nhà phố đã cập nhật')
    await user.click(screen.getByRole('button', { name: 'Dùng mô tả đề xuất' }))

    await user.clear(screen.getByLabelText('Phòng ngủ'))
    await user.type(screen.getByLabelText('Phòng ngủ'), '3')
    await user.clear(screen.getByLabelText('Phòng tắm'))
    await user.clear(screen.getByLabelText('Số tầng'))
    await user.clear(screen.getByLabelText('Hướng'))
    await user.clear(screen.getByLabelText('Nội thất'))
    await user.clear(screen.getByLabelText('Pháp lý'))
    await user.clear(screen.getByLabelText('Vĩ độ'))
    await user.clear(screen.getByLabelText('Kinh độ'))

    await user.click(screen.getByRole('button', { name: 'Lưu bản nháp' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: 12,
        provinceCode: '79',
        communeCode: '26734',
        projectId: 201,
        title: 'Nhà phố đã cập nhật',
        description: 'Mô tả được đề xuất',
        bedrooms: 3,
        bathrooms: undefined,
        floors: undefined,
        direction: undefined,
        furnishing: undefined,
        legalStatus: undefined,
        latitude: undefined,
        longitude: undefined,
      }),
    )
  })

  it('shows validation errors and does not submit an empty form', async () => {
    const user = userEvent.setup()
    const onSubmit = renderForm(vi.fn(), emptyListingForm)

    await user.click(screen.getByRole('button', { name: 'Lưu bản nháp' }))

    expect(await screen.findByText('Vui lòng chọn danh mục.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng chọn tỉnh/thành phố.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng chọn phường/xã/đặc khu.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập tiêu đề.')).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập mô tả.')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })
})
