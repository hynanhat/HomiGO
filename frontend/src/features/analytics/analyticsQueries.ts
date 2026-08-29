import { useQuery } from '@tanstack/react-query'
import { getAdminListingStatistics, getSellerListingStatistics } from './analyticsApi'

export const analyticsKeys = {
  all: ['listing-analytics'] as const,
  seller: (listingId: number, days: number) =>
    ['listing-analytics', 'seller', listingId, days] as const,
  admin: (listingId: number, days: number) =>
    ['listing-analytics', 'admin', listingId, days] as const,
}

export function useSellerListingStatistics(listingId: number, days: number) {
  return useQuery({
    queryKey: analyticsKeys.seller(listingId, days),
    queryFn: () => getSellerListingStatistics(listingId, days),
    enabled: listingId > 0,
  })
}

export function useAdminListingStatistics(listingId: number, days: number) {
  return useQuery({
    queryKey: analyticsKeys.admin(listingId, days),
    queryFn: () => getAdminListingStatistics(listingId, days),
    enabled: listingId > 0,
  })
}
