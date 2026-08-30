import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { ToastProvider } from '@/components/feedback'
import { profileFixture } from '../../tests/fixtures/apiFixtures'
import ProfilePage from './ProfilePage'

const auth = vi.hoisted(() => ({ updateUser: vi.fn() }))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => auth,
}))

describe('ProfilePage', () => {
  it('loads and updates the current user profile', async () => {
    const user = userEvent.setup()
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    render(
      <QueryClientProvider client={client}>
        <ToastProvider>
          <MemoryRouter>
            <ProfilePage />
          </MemoryRouter>
        </ToastProvider>
      </QueryClientProvider>,
    )

    const nameInput = await screen.findByDisplayValue(profileFixture.name)
    expect(screen.getByDisplayValue(profileFixture.phone!)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Xem gói nâng cấp/ })).toHaveAttribute(
      'href',
      '/seller/upgrade',
    )

    await user.clear(nameInput)
    await user.type(nameInput, 'Nguyễn Minh Anh')
    await user.clear(screen.getByLabelText('Số điện thoại'))
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    await waitFor(() =>
      expect(auth.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Nguyễn Minh Anh', role: 'USER' }),
      ),
    )
    expect(await screen.findByText('Đã cập nhật hồ sơ')).toBeInTheDocument()
  })
})
