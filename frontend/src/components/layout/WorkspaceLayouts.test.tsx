import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import AccountLayout from './AccountLayout'
import SellerLayout from './SellerLayout'

const auth = vi.hoisted(() => ({ logout: vi.fn().mockResolvedValue(undefined) }))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => auth,
}))

describe('workspace layouts', () => {
  it('renders seller navigation and its nested content', () => {
    render(
      <MemoryRouter initialEntries={['/seller']}>
        <Routes>
          <Route path="/seller" element={<SellerLayout />}>
            <Route index element={<p>Nội dung tổng quan người bán</p>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('complementary', { name: 'Điều hướng người bán' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Tổng quan' })).toHaveAttribute('href', '/seller')
    expect(screen.getByRole('link', { name: 'Tin của tôi' })).toHaveAttribute(
      'href',
      '/seller/listings',
    )
    expect(screen.getByRole('link', { name: 'Tạo tin mới' })).toHaveAttribute(
      'href',
      '/seller/listings/new',
    )
    expect(screen.getByText('Nội dung tổng quan người bán')).toBeInTheDocument()
  })

  it('renders account navigation and logs out to the login page', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/account/profile']}>
        <Routes>
          <Route path="/account/profile" element={<AccountLayout />}>
            <Route index element={<p>Nội dung hồ sơ</p>} />
          </Route>
          <Route path="/auth/login" element={<p>Trang đăng nhập</p>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('complementary', { name: 'Điều hướng tài khoản' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hồ sơ' })).toHaveAttribute('href', '/account/profile')
    expect(screen.getByRole('link', { name: 'Bảo mật' })).toHaveAttribute(
      'href',
      '/account/security',
    )
    expect(screen.getByRole('link', { name: 'Tin đã lưu' })).toHaveAttribute(
      'href',
      '/saved-listings',
    )
    expect(screen.getByText('Nội dung hồ sơ')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Đăng xuất' }))
    await waitFor(() => expect(auth.logout).toHaveBeenCalledTimes(1))
    expect(screen.getByText('Trang đăng nhập')).toBeInTheDocument()
  })
})
