import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RecommendationSection } from './RecommendationSection'

describe('RecommendationSection', () => {
  it('renders explainable recommendations linking to their detail page', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <RecommendationSection publicCode="HMG-2026-000101" />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Bất động sản dành cho bạn' })).toBeInTheDocument()
    expect(await screen.findByText('Căn hộ ven sông cùng khu vực')).toBeInTheDocument()
    expect(screen.getAllByText('Cùng loại bất động sản').length).toBeGreaterThan(0)
    expect(screen.getByRole('link', { name: /Căn hộ ven sông cùng khu vực/ })).toHaveAttribute('href', '/listings/HMG-2026-000102')
  })
})
