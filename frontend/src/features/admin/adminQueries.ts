import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { categoryKeys } from '@/features/categories/categoryQueries'
import { locationKeys } from '@/features/locations/locationQueries'
import type { ListingStatus } from '@/types/domain'
import * as api from './adminApi'

export const adminKeys = {
  all: ['admin'] as const,
  moderation: (status: ListingStatus, page: number) =>
    ['admin', 'moderation', status, page] as const,
  users: (page: number) => ['admin', 'users', page] as const,
  categories: ['admin', 'categories'] as const,
  projects: ['admin', 'projects'] as const,
  locationDatasets: (page: number, size: number) =>
    ['admin', 'location-datasets', page, size] as const,
}
export const useModerationQueue = (status: ListingStatus, page: number) =>
  useQuery({
    queryKey: adminKeys.moderation(status, page),
    queryFn: () => api.getModerationQueue(status, page),
  })
export const useAdminUsers = (page: number) =>
  useQuery({ queryKey: adminKeys.users(page), queryFn: () => api.getAdminUsers(page) })
export const useAdminCategories = () =>
  useQuery({ queryKey: adminKeys.categories, queryFn: () => api.getAdminCategories() })
export const useAdminProjects = () =>
  useQuery({ queryKey: adminKeys.projects, queryFn: () => api.getAdminProjects() })

export const useAdministrativeDatasets = (page = 0, size = 10) =>
  useQuery({
    queryKey: adminKeys.locationDatasets(page, size),
    queryFn: () => api.getAdministrativeDatasets(page, size),
  })

export function useValidateAdministrativeDataset() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: api.validateAdministrativeDataset,
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'location-datasets'] }),
  })
}

export function useActivateAdministrativeDataset() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: api.activateAdministrativeDataset,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['admin', 'location-datasets'] }),
        client.invalidateQueries({ queryKey: locationKeys.all }),
      ])
    },
  })
}

export function useInitializeProductionCategories() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: api.initializeProductionCategories,
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: adminKeys.categories }),
        client.invalidateQueries({ queryKey: categoryKeys.all }),
      ])
    },
  })
}
export function useAdminMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.all }),
  })
}
