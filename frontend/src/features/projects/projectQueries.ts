import { queryOptions, useQuery } from '@tanstack/react-query'
import type { ProjectSearchState } from '@/types/domain'
import { getProject, searchProjects } from './projectApi'

export const projectKeys = {
  all: ['projects'] as const,
  search: (state: ProjectSearchState) => [...projectKeys.all, 'search', state] as const,
  detail: (slug: string, page: number, size: number) => [...projectKeys.all, 'detail', slug, page, size] as const,
}

export function useProjectSearch(state: ProjectSearchState) {
  return useQuery(queryOptions({ queryKey: projectKeys.search(state), queryFn: () => searchProjects(state) }))
}

export function useProjectDetail(slug: string, page: number, size = 12) {
  return useQuery(queryOptions({
    queryKey: projectKeys.detail(slug, page, size),
    queryFn: () => getProject(slug, page, size),
    enabled: Boolean(slug),
  }))
}
