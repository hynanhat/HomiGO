import type { ReactElement } from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import type { SessionStatus, UserRole } from '@/types/domain'
import { AdminRoute, AnonymousRoute, AuthenticatedRoute, SellerRoute } from './guards'

const auth = vi.hoisted(() => ({
  current: {
    status: 'anonymous' as SessionStatus,
    user: null as { id: number; name: string; email: string; role: UserRole } | null,
  },
}))

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => auth.current,
}))

function setAuth(status: SessionStatus, role?: UserRole) {
  auth.current = {
    status,
    user: role ? { id: 1, name: 'Homi User', email: 'user@homigo.vn', role } : null,
  }
}

function renderGuard(guard: ReactElement) {
  render(
    <MemoryRouter initialEntries={['/private?tab=details#history']}>
      <Routes>
        <Route path="/private" element={guard} />
        <Route path="/" element={<p>Trang chủ</p>} />
        <Route path="/auth/login" element={<p>Đăng nhập</p>} />
        <Route path="/seller/upgrade" element={<p>Nâng cấp người bán</p>} />
        <Route path="/access-denied" element={<p>Không có quyền truy cập</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('route guards', () => {
  it('shows session restoration feedback', () => {
    setAuth('restoring')
    renderGuard(
      <AnonymousRoute>
        <p>Nội dung ẩn danh</p>
      </AnonymousRoute>,
    )

    expect(screen.getByText('Đang khôi phục phiên đăng nhập…')).toBeInTheDocument()
  })

  it('allows anonymous visitors and redirects authenticated visitors away from auth pages', () => {
    setAuth('anonymous')
    const first = render(
      <MemoryRouter>
        <AnonymousRoute>
          <p>Nội dung ẩn danh</p>
        </AnonymousRoute>
      </MemoryRouter>,
    )
    expect(screen.getByText('Nội dung ẩn danh')).toBeInTheDocument()
    first.unmount()

    setAuth('authenticated', 'USER')
    renderGuard(
      <AnonymousRoute>
        <p>Nội dung ẩn danh</p>
      </AnonymousRoute>,
    )
    expect(screen.getByText('Trang chủ')).toBeInTheDocument()
  })

  it('redirects anonymous users to login and allows authenticated users', () => {
    setAuth('anonymous')
    const first = render(
      <MemoryRouter initialEntries={['/private?tab=details#history']}>
        <Routes>
          <Route
            path="/private"
            element={
              <AuthenticatedRoute>
                <p>Nội dung tài khoản</p>
              </AuthenticatedRoute>
            }
          />
          <Route path="/auth/login" element={<p>Đăng nhập</p>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument()
    first.unmount()

    setAuth('authenticated', 'USER')
    renderGuard(
      <AuthenticatedRoute>
        <p>Nội dung tài khoản</p>
      </AuthenticatedRoute>,
    )
    expect(screen.getByText('Nội dung tài khoản')).toBeInTheDocument()
  })

  it.each([
    ['anonymous', undefined, 'Đăng nhập'],
    ['authenticated', 'USER', 'Nâng cấp người bán'],
    ['authenticated', 'ADMIN', 'Trang chủ'],
    ['authenticated', 'SELLER', 'Không gian người bán'],
  ] as const)('handles seller access for %s/%s', (status, role, expected) => {
    setAuth(status, role)
    renderGuard(
      <SellerRoute>
        <p>Không gian người bán</p>
      </SellerRoute>,
    )

    expect(screen.getByText(expected)).toBeInTheDocument()
  })

  it.each([
    ['restoring', undefined, 'Đang khôi phục phiên đăng nhập…'],
    ['anonymous', undefined, 'Đăng nhập'],
    ['authenticated', 'USER', 'Không có quyền truy cập'],
    ['authenticated', 'ADMIN', 'Không gian quản trị'],
  ] as const)('handles admin access for %s/%s', (status, role, expected) => {
    setAuth(status, role)
    renderGuard(
      <AdminRoute>
        <p>Không gian quản trị</p>
      </AdminRoute>,
    )

    expect(screen.getByText(expected)).toBeInTheDocument()
  })
})
