import { describe, expect, it } from 'vitest'
import { actionsForStatus, canManageListingImages } from './listingActions'

describe('seller listing lifecycle policy', () => {
  it('exposes only backend-supported lifecycle actions', () => {
    expect(actionsForStatus('DRAFT')).toEqual(['edit', 'submit', 'delete'])
    expect(actionsForStatus('PENDING')).toEqual([])
    expect(actionsForStatus('ACTIVE')).toEqual(['edit', 'deactivate'])
    expect(actionsForStatus('REJECTED')).toEqual(['edit', 'submit', 'delete'])
    expect(actionsForStatus('INACTIVE')).toEqual(['edit', 'submit', 'delete'])
    expect(actionsForStatus('EXPIRED')).toEqual(['edit', 'delete'])
  })

  it('allows image changes only while content is not public or under review', () => {
    expect(canManageListingImages('DRAFT')).toBe(true)
    expect(canManageListingImages('REJECTED')).toBe(true)
    expect(canManageListingImages('INACTIVE')).toBe(true)
    expect(canManageListingImages('PENDING')).toBe(false)
    expect(canManageListingImages('ACTIVE')).toBe(false)
    expect(canManageListingImages('EXPIRED')).toBe(false)
  })
})
