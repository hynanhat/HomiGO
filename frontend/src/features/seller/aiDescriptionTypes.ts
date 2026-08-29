import type { ListingFormValues } from './sellerTypes'

export interface AiDescriptionQuota {
  enabled: boolean
  limit: number
  successfulAttempts: number
  remainingAttempts: number
  availableNow: number
  resetAt: string
  retryAt: string | null
}

export interface AiDescriptionRequest {
  keywords: string
  categoryId: number
  districtId: number
  wardId?: number
  projectId?: number
  title?: string
  price: number
  area: number
  address?: string
  bedrooms?: number
  bathrooms?: number
  floors?: number
  direction?: string
  furnishing?: string
  legalStatus?: string
}

export interface AiDescriptionDraft {
  description: string
  quota: AiDescriptionQuota
}

export function toAiDescriptionRequest(
  listing: ListingFormValues,
  keywords: string,
): AiDescriptionRequest {
  return {
    keywords: keywords.trim(),
    categoryId: listing.categoryId,
    districtId: listing.districtId,
    wardId: listing.wardId,
    projectId: listing.projectId,
    title: listing.title.trim() || undefined,
    price: listing.price,
    area: listing.area,
    address: listing.address.trim() || undefined,
    bedrooms: listing.bedrooms,
    bathrooms: listing.bathrooms,
    floors: listing.floors,
    direction: listing.direction?.trim() || undefined,
    furnishing: listing.furnishing?.trim() || undefined,
    legalStatus: listing.legalStatus?.trim() || undefined,
  }
}
