import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ToastProvider } from '@/components/feedback'
import { AuthProvider } from '@/context/AuthContext'
import { sessionFixture } from '../../tests/fixtures/apiFixtures'
import SellerUpgradePage from './SellerUpgradePage'

describe('SellerUpgradePage', () => {
  it('treats the browser success callback as pending until backend IPN status succeeds', async () => {
    localStorage.setItem(
      'homigo.session.v1',
      JSON.stringify({
        user: sessionFixture.user,
      }),
    )
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })

    render(
      <QueryClientProvider client={client}>
        <AuthProvider>
          <ToastProvider>
            <MemoryRouter
              initialEntries={['/seller/upgrade?payment=success&orderCode=HMG-SEPAY-FIXTURE001']}
            >
              <SellerUpgradePage />
            </MemoryRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>,
    )

    expect(
      await screen.findByRole('heading', { name: 'Đang chờ SePay xác nhận' }),
    ).toBeInTheDocument()
    expect(screen.queryByText('Tài khoản của bạn đã có quyền người bán.')).not.toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('homigo.session.v1')!).user.role).toBe('USER')
  })
})
