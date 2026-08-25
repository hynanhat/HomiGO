import { useQuery } from '@tanstack/react-query'
import { getRecommendations } from './recommendationApi'

export const recommendationKeys = {
  all: ['recommendations'] as const,
  listing: (publicCode: string, size: number) => ['recommendations', publicCode, size] as const,
}

export function useRecommendations(publicCode: string, size = 6) {
  return useQuery({
    queryKey: recommendationKeys.listing(publicCode, size),
    queryFn: () => getRecommendations(publicCode, size),
    enabled: Boolean(publicCode),
  })
}
