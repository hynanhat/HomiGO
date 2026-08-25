import { queryOptions, useQuery } from '@tanstack/react-query'
import type { PaginationParams } from '@/types/api'
import { getCategories } from './categoryApi'

export const categoryKeys = {
  all: ['categories'] as const,
  page: (params: Required<PaginationParams>) => [...categoryKeys.all, params] as const,
}

export function categoryQueryOptions(params: PaginationParams = {}) {
  const normalized = { page: params.page ?? 0, size: params.size ?? 100 }
  return queryOptions({
    queryKey: categoryKeys.page(normalized),
    queryFn: () => getCategories(normalized),
    staleTime: 10 * 60_000,
  })
}

export function useCategories(params: PaginationParams = {}) {
  return useQuery(categoryQueryOptions(params))
}
