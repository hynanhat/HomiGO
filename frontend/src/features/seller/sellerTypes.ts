import type { Listing } from '@/types/domain'

export interface ListingFormValues {
  categoryId: number
  districtId: number
  wardId?: number
  projectId?: number
  title: string
  description: string
  price: number
  area: number
  address: string
  latitude?: number
  longitude?: number
  bedrooms?: number
  bathrooms?: number
  floors?: number
  direction?: string
  furnishing?: string
  legalStatus?: string
  contactName: string
  contactPhone: string
  version?: number
}
export type SellerListing = Listing
export type ListingLifecycleAction = 'edit' | 'submit' | 'deactivate' | 'delete'
export type ImageDraftStatus = 'local' | 'uploading' | 'uploaded' | 'failed'
export interface ListingImageDraft {
  clientId: string
  serverId?: number
  file?: File
  url: string
  name: string
  contentType: string
  size: number
  status: ImageDraftStatus
  error?: string
}
export interface UploadedListingImage {
  id: number
  url: string
  contentType: string
  sizeBytes: number
  sortOrder: number
}
