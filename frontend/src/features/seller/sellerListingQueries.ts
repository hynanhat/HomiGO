import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createSellerListing, deactivateSellerListing, deleteSellerListing, getSellerListing, getSellerListings, submitSellerListing, updateSellerListing } from './sellerListingApi'

export const sellerListingKeys = { all: ['seller-listings'] as const, page: (page: number, size: number) => ['seller-listings', 'page', page, size] as const, detail: (id: number) => ['seller-listings', 'detail', id] as const }
export const useSellerListings = (page: number, size = 20) => useQuery({ queryKey: sellerListingKeys.page(page, size), queryFn: () => getSellerListings(page, size) })
export const useSellerListing = (id: number) => useQuery({ queryKey: sellerListingKeys.detail(id), queryFn: () => getSellerListing(id), enabled: id > 0 })
export function useCreateSellerListing() { const client = useQueryClient(); return useMutation({ mutationFn: createSellerListing, onSuccess: () => client.invalidateQueries({ queryKey: sellerListingKeys.all }) }) }
export function useUpdateSellerListing(id: number) { const client = useQueryClient(); return useMutation({ mutationFn: (values: Parameters<typeof updateSellerListing>[1]) => updateSellerListing(id, values), onSuccess: (item) => { client.setQueryData(sellerListingKeys.detail(id), item); client.invalidateQueries({ queryKey: sellerListingKeys.all }) } }) }
export function useSellerLifecycle() { const client = useQueryClient(); const settle = () => client.invalidateQueries({ queryKey: sellerListingKeys.all }); return { submit: useMutation({ mutationFn: submitSellerListing, onSettled: settle }), deactivate: useMutation({ mutationFn: deactivateSellerListing, onSettled: settle }), remove: useMutation({ mutationFn: deleteSellerListing, onSettled: settle }) } }
