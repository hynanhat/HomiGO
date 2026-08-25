import { apiClient } from '@/lib/api/client'
import type { PageResponse, PaginationParams } from '@/types/api'
import type { Category } from '@/types/domain'

export function getCategories(params: PaginationParams = {}): Promise<PageResponse<Category>> {
  return apiClient.get<PageResponse<Category>>('/categories', {
    params: {
      page: params.page ?? 0,
      size: params.size ?? 100,
    },
  })
}
