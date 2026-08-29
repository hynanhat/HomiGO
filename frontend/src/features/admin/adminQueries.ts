import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ListingStatus } from '@/types/domain'
import * as api from './adminApi'

export const adminKeys = {
  all: ['admin'] as const,
  moderation: (status: ListingStatus, page: number) =>
    ['admin', 'moderation', status, page] as const,
  users: (page: number) => ['admin', 'users', page] as const,
  categories: ['admin', 'categories'] as const,
  projects: ['admin', 'projects'] as const,
  locations: (kind: api.AdminLocationKind) => ['admin', 'locations', kind] as const,
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
export const useAdminLocations = <T extends api.AdminLocationRow>(kind: api.AdminLocationKind) =>
  useQuery({ queryKey: adminKeys.locations(kind), queryFn: () => api.getAdminLocations<T>(kind) })
export function useAdminMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<unknown>,
) {
  const client = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => client.invalidateQueries({ queryKey: adminKeys.all }),
  })
}
