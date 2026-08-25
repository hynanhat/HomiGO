import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'
import type { DistrictOption, ProvinceOption, WardOption } from '@/types/domain'

export const locationKeys = {
  all: ['locations'] as const,
  provinces: () => [...locationKeys.all, 'provinces'] as const,
  districts: (provinceId?: number) => [...locationKeys.all, 'districts', provinceId] as const,
  wards: (districtId?: number) => [...locationKeys.all, 'wards', districtId] as const,
}

export function useProvinces() {
  return useQuery(queryOptions({
    queryKey: locationKeys.provinces(),
    queryFn: () => apiClient.get<PageResponse<ProvinceOption>>('/locations/provinces', { params: { size: 100 } }),
    staleTime: 10 * 60_000,
  }))
}

export function useDistricts(provinceId?: number) {
  return useQuery(queryOptions({
    queryKey: locationKeys.districts(provinceId),
    queryFn: () => apiClient.get<PageResponse<DistrictOption>>(`/locations/provinces/${provinceId}/districts`, { params: { size: 100 } }),
    enabled: Boolean(provinceId),
    staleTime: 10 * 60_000,
  }))
}

export function useWards(districtId?: number) {
  return useQuery(queryOptions({
    queryKey: locationKeys.wards(districtId),
    queryFn: () => apiClient.get<PageResponse<WardOption>>(`/locations/districts/${districtId}/wards`, { params: { size: 100 } }),
    enabled: Boolean(districtId),
    staleTime: 10 * 60_000,
  }))
}
