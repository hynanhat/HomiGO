import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { PageResponse } from '@/types/api'
import type { Listing } from '@/types/domain'
import { getSavedListings, removeSavedListing, saveListing } from './savedListingApi'

export const savedListingKeys = {
  all: ['saved-listings'] as const,
  page: (page: number, size: number) => ['saved-listings', page, size] as const,
}
export function useSavedListings(page: number, size = 12) {
  return useQuery({
    queryKey: savedListingKeys.page(page, size),
    queryFn: () => getSavedListings(page, size),
  })
}
export function useSavedListingMutation(
  listing: Listing,
  saved: boolean,
  setSaved: (saved: boolean) => void,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn: () => (saved ? removeSavedListing(listing.id) : saveListing(listing.id)),
    onMutate: async () => {
      await client.cancelQueries({ queryKey: savedListingKeys.all })
      setSaved(!saved)
      return { previous: saved }
    },
    onError: (_error, _variables, context) => setSaved(context?.previous ?? saved),
    onSettled: () => client.invalidateQueries({ queryKey: savedListingKeys.all }),
  })
}

export function removeListingFromSavedPages(
  client: ReturnType<typeof useQueryClient>,
  listingId: number,
) {
  client.setQueriesData<PageResponse<Listing>>({ queryKey: savedListingKeys.all }, (old) =>
    old
      ? {
          ...old,
          content: old.content.filter((item) => item.id !== listingId),
          totalElements: Math.max(0, old.totalElements - 1),
        }
      : old,
  )
}
