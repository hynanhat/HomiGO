import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/feedback'
import { AuthProvider } from '@/context/AuthContext'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'

function renderAccount(entry: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <ToastProvider>
          <MemoryRouter initialEntries={[entry]}>
            <Routes>
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/" element={<h1>Trang chủ</h1>} />
            </Routes>
          </MemoryRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('account pages', () => {
  it('validates register confirmation before sending', async () => {
    renderAccount('/auth/register')
    fireEvent.change(screen.getByLabelText(/Họ và tên/), { target: { value: 'Nguyễn An' } })
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'an@test.vn' } })
    fireEvent.change(screen.getByLabelText(/^Mật khẩu/), { target: { value: 'correct-horse' } })
    fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu/), {
      target: { value: 'different-passphrase' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Đăng ký' }))
    expect(await screen.findByText('Mật khẩu xác nhận không khớp.')).toBeInTheDocument()
  })

  it('logs in with accessible fields', async () => {
    renderAccount('/auth/login')
    fireEvent.change(screen.getByLabelText(/Email/), { target: { value: 'an@homigo.vn' } })
    fireEvent.change(screen.getByLabelText(/Mật khẩu/), { target: { value: 'secret1' } })
    fireEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }))
    expect(await screen.findByRole('heading', { name: 'Trang chủ' })).toBeInTheDocument()
  })
})
