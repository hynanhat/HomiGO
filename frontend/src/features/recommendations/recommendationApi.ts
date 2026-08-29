import { apiClient } from '@/lib/api/client'
import type { Listing } from '@/types/domain'

export interface PropertyRecommendation {
  listing: Listing
  score: number
  reasons: string[]
}

export const getRecommendations = (publicCode: string, size = 6) =>
  apiClient.get<PropertyRecommendation[]>(
    `/listings/${encodeURIComponent(publicCode)}/recommendations`,
    { params: { size } },
  )
