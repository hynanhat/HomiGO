import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'
import type { Listing, ListingSearchState } from '@/types/domain'

export function searchListings(params: ListingSearchState): Promise<PageResponse<Listing>> {
  return apiClient.get<PageResponse<Listing>>('/listings', { params })
}

export function getListing(publicCode: string): Promise<Listing> {
  return apiClient.get<Listing>(`/listings/${encodeURIComponent(publicCode)}`)
}
