import type { Listing } from '@/types/domain'

export interface ListingFormValues {
  categoryId: number
  provinceCode: string
  communeCode: string
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
export type ImageDraftStatus = 'pending' | 'uploading' | 'uploaded' | 'failed'
export interface ListingImageDraft {
  clientId: string
  uploadId?: string
  serverId?: number
  file?: File
  url: string
  name: string
  contentType: string
  size: number
  status: ImageDraftStatus
  progress?: number
  error?: string
}
export interface UploadedListingImage {
  id: number
  url: string
  contentType: string
  sizeBytes: number
  sortOrder: number
}
