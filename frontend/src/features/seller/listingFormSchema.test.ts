import { describe, expect, it } from 'vitest'
import { listingFormSchema } from './listingFormSchema'

const valid = {
  categoryId: 1,
  districtId: 2,
  title: 'Nhà đẹp',
  description: 'Mô tả',
  price: 1,
  area: 1,
  address: '12 Đường A',
  contactName: 'An',
  contactPhone: '0901234567',
  version: 0,
}
describe('listing form schema', () => {
  it('accepts complete backend-compatible values', () =>
    expect(listingFormSchema.safeParse(valid).success).toBe(true))
  it.each([
    { ...valid, price: 0 },
    { ...valid, area: -1 },
    { ...valid, latitude: 91 },
    { ...valid, longitude: -181 },
    { ...valid, bedrooms: -1 },
    { ...valid, contactPhone: 'abc' },
    { ...valid, version: -1 },
  ])('rejects invalid numeric, coordinate, phone and version values', (value) =>
    expect(listingFormSchema.safeParse(value).success).toBe(false),
  )
})
