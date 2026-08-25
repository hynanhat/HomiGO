import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../../../tests/mocks/server'
import { ApiError } from '@/lib/api/apiError'
import { getListing, searchListings } from './listingApi'

describe('listing API', () => {
  it('sends search parameters and unwraps PageResponse', async () => {
    server.use(http.get('*/api/v1/listings', ({ request }) => {
      const url = new URL(request.url)
      expect(url.searchParams.get('transactionType')).toBe('RENT')
      expect(url.searchParams.get('page')).toBe('1')
      return HttpResponse.json({ success: true, message: 'OK', errorCode: null, data: { content: [], number: 1, size: 12, totalElements: 0, totalPages: 0, numberOfElements: 0, first: false, last: true, empty: true } })
    }))
    const page = await searchListings({ transactionType: 'RENT', sort: 'newest', page: 1, size: 12 })
    expect(page.number).toBe(1)
    expect(page.empty).toBe(true)
  })

  it('loads detail by public code', async () => {
    const listing = await getListing('HMG-2026-000101')
    expect(listing.publicCode).toBe('HMG-2026-000101')
  })

  it('surfaces safe 404 and network errors', async () => {
    await expect(getListing('missing')).rejects.toMatchObject({ status: 404, errorCode: 'RESOURCE_NOT_FOUND' })
    server.use(http.get('*/api/v1/listings', () => HttpResponse.error()))
    await expect(searchListings({ sort: 'newest', page: 0, size: 12 })).rejects.toBeInstanceOf(ApiError)
  })
})
