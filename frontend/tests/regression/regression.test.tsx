import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseListingSearchParams } from '@/features/listings/listingSearchState'
import { actionsForStatus } from '@/features/seller/listingActions'
import { validateImageFiles } from '@/features/seller/components/ListingImageUploader'
import { listingFixtures } from '../fixtures/apiFixtures'

describe('frontend regression guardrails', () => {
  it('keeps public listing navigation data separate from internal ids', () => {
    const listing = listingFixtures[0]
    expect(listing.publicCode).toMatch(/^HMG-/)
    expect(listing.categoryId).toBeTypeOf('number')
    expect(listing.provinceCode).toMatch(/^\d{2}$/)
    expect(listing.communeCode).toMatch(/^\d{5}$/)
  })

  it('normalizes reversed price, area and coordinate ranges from shared URLs', () => {
    const state = parseListingSearchParams(
      new URLSearchParams('minPrice=500&maxPrice=100&minArea=90&maxArea=50&minLat=11&maxLat=10'),
    )
    expect(state).toMatchObject({
      minPrice: 100,
      maxPrice: 500,
      minArea: 50,
      maxArea: 90,
      minLat: 10,
      maxLat: 11,
    })
  })

  it('does not expose invalid seller lifecycle actions', () => {
    expect(actionsForStatus('PENDING')).toEqual([])
    expect(actionsForStatus('ACTIVE')).toEqual(['edit', 'deactivate'])
    expect(actionsForStatus('DRAFT')).toContain('submit')
  })

  it('rejects unsupported, oversized and excess listing images', () => {
    const unsupported = new File(['text'], 'note.txt', { type: 'text/plain' })
    const oversized = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'large.jpg', {
      type: 'image/jpeg',
    })
    const valid = new File(['image'], 'home.webp', { type: 'image/webp' })
    const result = validateImageFiles([unsupported, oversized, valid], [])
    expect(result.valid).toEqual([valid])
    expect(result.errors).toHaveLength(2)
  })

  it('keeps obsolete prototype entry points removed from the application', () => {
    const obsolete = [
      'src/services/api.ts',
      'src/pages/AuthPage.tsx',
      'src/pages/PostListingPage.tsx',
      'src/pages/SellerDashboard.tsx',
      'src/pages/AdminDashboard.tsx',
    ]
    expect(obsolete.filter((path) => existsSync(resolve(process.cwd(), path)))).toEqual([])

    const router = readFileSync(resolve(process.cwd(), 'src/app/router.tsx'), 'utf8')
    expect(router).not.toMatch(/AuthPage|PostListingPage|SellerDashboard['"]|AdminDashboard['"]/)
  })
})
