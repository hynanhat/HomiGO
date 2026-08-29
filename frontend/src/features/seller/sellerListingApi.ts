import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'
import type { SellerListing, ListingFormValues, UploadedListingImage } from './sellerTypes'

export const getSellerListings = (page = 0, size = 20) =>
  apiClient.get<PageResponse<SellerListing>>('/seller/listings', { params: { page, size } })
export const getSellerListing = (id: number) =>
  apiClient.get<SellerListing>(`/seller/listings/${id}`)
export const createSellerListing = (request: ListingFormValues) =>
  apiClient.post<SellerListing>('/seller/listings', request)
export const updateSellerListing = (id: number, request: ListingFormValues) =>
  apiClient.put<SellerListing>(`/seller/listings/${id}`, request)
export const submitSellerListing = (id: number) =>
  apiClient.post<SellerListing>(`/seller/listings/${id}/submit`)
export const deactivateSellerListing = (id: number) =>
  apiClient.post<SellerListing>(`/seller/listings/${id}/deactivate`)
export const deleteSellerListing = (id: number) => apiClient.delete<void>(`/seller/listings/${id}`)
export const uploadListingImage = (id: number, file: File) => {
  const data = new FormData()
  data.append('file', file)
  return apiClient.post<UploadedListingImage>(`/seller/listings/${id}/images`, data)
}
export const deleteListingImage = (listingId: number, imageId: number) =>
  apiClient.delete<void>(`/seller/listings/${listingId}/images/${imageId}`)
