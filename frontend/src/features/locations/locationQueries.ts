import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'
import type { CommuneUnitOption, ProvinceOption } from '@/types/domain'

const PAGE_SIZE = 100

export const locationKeys = {
  all: ['locations'] as const,
  provinces: () => [...locationKeys.all, 'provinces'] as const,
  communeUnits: (provinceCode?: string) =>
    [...locationKeys.all, 'commune-units', provinceCode] as const,
}

async function getAllPages<T>(path: string): Promise<PageResponse<T>> {
  const content: T[] = []
  let page = 0
  let response: PageResponse<T>
  do {
    response = await apiClient.get<PageResponse<T>>(path, { params: { page, size: PAGE_SIZE } })
    content.push(...response.content)
    page += 1
    if (page > 100) throw new Error('Danh mục địa chỉ trả về quá nhiều trang.')
  } while (!response.last)

  return {
    ...response,
    content,
    number: 0,
    size: content.length,
    numberOfElements: content.length,
    totalElements: content.length,
    totalPages: content.length ? 1 : 0,
    first: true,
    last: true,
    empty: content.length === 0,
  }
}

export const getAllProvinces = () => getAllPages<ProvinceOption>('/locations/provinces')

export const getAllCommuneUnits = (provinceCode: string) =>
  getAllPages<CommuneUnitOption>(`/locations/provinces/${provinceCode}/commune-units`)

export function useProvinces() {
  return useQuery(
    queryOptions({
      queryKey: locationKeys.provinces(),
      queryFn: getAllProvinces,
      staleTime: 10 * 60_000,
    }),
  )
}

export function useCommuneUnits(provinceCode?: string) {
  return useQuery(
    queryOptions({
      queryKey: locationKeys.communeUnits(provinceCode),
      queryFn: () => getAllCommuneUnits(provinceCode!),
      enabled: Boolean(provinceCode),
      staleTime: 10 * 60_000,
    }),
  )
}
