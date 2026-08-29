import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ListingStatistics } from './ListingStatistics'

describe('ListingStatistics', () => {
  it('renders totals and an accessible daily trend', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <QueryClientProvider client={client}>
        <ListingStatistics listingId={101} />
      </QueryClientProvider>,
    )

    expect(await screen.findByText('124')).toBeInTheDocument()
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('46')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Biểu đồ lượt xem trong 30 ngày' })).toBeInTheDocument()
    expect(screen.getByText('Xem số liệu dạng danh sách')).toBeInTheDocument()
  })
})
