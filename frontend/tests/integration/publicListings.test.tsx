import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ListingCard } from '@/features/listings/components/ListingCard'
import { ListingDetails } from '@/features/listings/components/ListingDetails'
import { ListingGallery } from '@/features/listings/components/ListingGallery'
import HomePage from '@/pages/HomePage'
import ListingPage from '@/pages/ListingPage'
import { listingFixtures } from '../fixtures/apiFixtures'
import { AuthProvider } from '@/context/AuthContext'

function renderPage(node: React.ReactNode, entries = ['/']) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider>
        <MemoryRouter initialEntries={entries}>{node}</MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  )
}

describe('public listing discovery', () => {
  it('searches from home using BUY/RENT and keyword', async () => {
    renderPage(
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/listings" element={<p>Kết quả điều hướng</p>} />
      </Routes>,
    )
    fireEvent.click(screen.getByRole('button', { name: /Thuê/ }))
    fireEvent.change(screen.getByLabelText('Tìm bất động sản'), { target: { value: 'Thảo Điền' } })
    fireEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    expect(await screen.findByText('Kết quả điều hướng')).toBeInTheDocument()
  })

  it('renders semantic card, gallery and sticky contact details', () => {
    const listing = listingFixtures[0]
    renderPage(
      <>
        <ListingCard listing={listing} />
        <ListingGallery listing={listing} />
        <ListingDetails listing={listing} />
      </>,
    )
    expect(screen.getAllByText(listing.title).length).toBeGreaterThan(0)
    expect(screen.getByText(`Mã tin: ${listing.publicCode}`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: listing.contactPhone })).toHaveAttribute(
      'href',
      `tel:${listing.contactPhone}`,
    )
  })

  it('shows URL filters, result count and mobile filter drawer', async () => {
    renderPage(<ListingPage />, ['/listings?transactionType=BUY&provinceId=21'])
    expect(await screen.findByText('1 kết quả')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Bộ lọc' }))
    expect(screen.getByRole('dialog', { name: 'Bộ lọc tìm kiếm' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Đóng bộ lọc' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
