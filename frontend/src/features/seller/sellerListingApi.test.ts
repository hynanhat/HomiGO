import { describe, expect, it } from 'vitest'
import {
  createSellerListing,
  deactivateSellerListing,
  deleteSellerListing,
  getSellerListing,
  getSellerListings,
  submitSellerListing,
  updateSellerListing,
  uploadListingImage,
} from './sellerListingApi'
import type { ListingFormValues } from './sellerTypes'

const values: ListingFormValues = {
  categoryId: 11,
  provinceCode: '79',
  communeCode: '26734',
  title: 'Tin hợp lệ',
  description: 'Mô tả',
  price: 1000000,
  area: 50,
  address: 'Địa chỉ',
  contactName: 'An',
  contactPhone: '0901234567',
  version: 1,
}
describe('seller listing API', () => {
  it('supports list/detail/create/update and lifecycle operations', async () => {
    expect((await getSellerListings()).content).toHaveLength(1)
    expect((await getSellerListing(101)).id).toBe(101)
    expect((await createSellerListing(values)).status).toBe('DRAFT')
    expect((await updateSellerListing(101, values)).version).toBe(2)
    expect((await submitSellerListing(101)).status).toBe('PENDING')
    expect((await deactivateSellerListing(101)).status).toBe('INACTIVE')
    await expect(deleteSellerListing(101)).resolves.toBeNull()
  })
  it('uploads multipart images and returns the persistent image identity', async () => {
    const file = new File(['image'], 'home.webp', { type: 'image/webp' })
    await expect(
      uploadListingImage(101, file, '9b93cebb-ef47-46ae-a721-c662bd72def2'),
    ).resolves.toMatchObject({
      id: 501,
      url: '/uploads/fixture.webp',
      contentType: 'image/webp',
    })
  })
})
