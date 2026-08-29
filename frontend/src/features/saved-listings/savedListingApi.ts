import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'
import type { Listing } from '@/types/domain'

export const getSavedListings = (page = 0, size = 12) =>
  apiClient.get<PageResponse<Listing>>('/saved-listings', { params: { page, size } })
export const saveListing = (listingId: number) =>
  apiClient.post<void>(`/saved-listings/${listingId}`)
export const removeSavedListing = (listingId: number) =>
  apiClient.delete<void>(`/saved-listings/${listingId}`)
