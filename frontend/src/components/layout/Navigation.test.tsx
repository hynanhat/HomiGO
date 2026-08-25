import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuth } from '@/context/AuthContext'
import { Navigation } from './Navigation'

vi.mock('@/context/AuthContext', () => ({ useAuth: vi.fn() }))
vi.mock('@/features/notifications/components/NotificationBell', () => ({ NotificationBell: () => <span aria-label="Thông báo" /> }))

const mockedUseAuth = vi.mocked(useAuth)
const baseAuth = {
  accessToken: 'token',
  token: 'token',
  status: 'authenticated' as const,
  isAuthenticated: true,
  login: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  updateUser: vi.fn(),
}

describe('Navigation role actions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows the admin workspace entry and hides the seller post action for ADMIN', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      user: { id: 1, name: 'Admin HomiGO', email: 'admin@homigo.vn', role: 'ADMIN' },
    })

    render(<MemoryRouter><Navigation /></MemoryRouter>)

    expect(screen.getByRole('link', { name: /Quản trị/ })).toHaveAttribute('href', '/admin')
    expect(screen.queryByRole('link', { name: 'Đăng tin' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Đăng tin bất động sản' })).not.toBeInTheDocument()
  })

  it('keeps the seller post action for a non-admin account', () => {
    mockedUseAuth.mockReturnValue({
      ...baseAuth,
      user: { id: 2, name: 'Seller HomiGO', email: 'seller@homigo.vn', role: 'SELLER' },
    })

    render(<MemoryRouter><Navigation /></MemoryRouter>)

    expect(screen.getByRole('link', { name: 'Đăng tin' })).toHaveAttribute('href', '/seller/listings/new')
    expect(screen.queryByRole('link', { name: /Quản trị/ })).not.toBeInTheDocument()
  })
})
