import { queryOptions, useQuery } from '@tanstack/react-query'
import type { ListingSearchState } from '@/types/domain'
import { getListing, searchListings } from './listingApi'

export const listingKeys = {
  all: ['listings'] as const,
  searches: () => [...listingKeys.all, 'search'] as const,
  search: (state: ListingSearchState) => [...listingKeys.searches(), state] as const,
  details: () => [...listingKeys.all, 'detail'] as const,
  detail: (publicCode: string) => [...listingKeys.details(), publicCode] as const,
}

export const listingSearchQueryOptions = (state: ListingSearchState) =>
  queryOptions({
    queryKey: listingKeys.search(state),
    queryFn: () => searchListings(state),
  })

export const listingDetailQueryOptions = (publicCode: string) =>
  queryOptions({
    queryKey: listingKeys.detail(publicCode),
    queryFn: () => getListing(publicCode),
    enabled: Boolean(publicCode),
  })

export function useListingSearch(state: ListingSearchState) {
  return useQuery(listingSearchQueryOptions(state))
}

export function useListingDetail(publicCode: string) {
  return useQuery(listingDetailQueryOptions(publicCode))
}
