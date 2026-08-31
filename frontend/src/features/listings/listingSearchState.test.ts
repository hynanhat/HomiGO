import { describe, expect, it } from 'vitest'
import {
  parseListingSearchParams,
  serializeListingSearchState,
  updateListingFilters,
} from './listingSearchState'

describe('listingSearchState', () => {
  it('parses whitelisted values and normalizes invalid ranges', () => {
    const state = parseListingSearchParams(
      new URLSearchParams('transactionType=BUY&sort=priceDesc&minPrice=900&maxPrice=100&page=2'),
    )
    expect(state).toMatchObject({
      transactionType: 'BUY',
      sort: 'priceDesc',
      minPrice: 100,
      maxPrice: 900,
      page: 2,
    })
  })

  it('falls back for invalid sort, page, size and numeric values', () => {
    const state = parseListingSearchParams(
      new URLSearchParams('sort=random&page=-2&size=500&provinceCode=oops'),
    )
    expect(state).toMatchObject({ sort: 'newest', page: 0, size: 100, provinceCode: undefined })
  })

  it('resets page when a filter changes but preserves explicit pagination', () => {
    const state = parseListingSearchParams(new URLSearchParams('page=4&keyword=old'))
    expect(updateListingFilters(state, { keyword: 'new' }).page).toBe(0)
    expect(updateListingFilters(state, { page: 3 }).page).toBe(3)
  })

  it('serializes URL-backed state', () => {
    expect(
      serializeListingSearchState({ sort: 'newest', page: 0, size: 12, communeCode: '26734' }).get(
        'communeCode',
      ),
    ).toBe('26734')
  })
})
