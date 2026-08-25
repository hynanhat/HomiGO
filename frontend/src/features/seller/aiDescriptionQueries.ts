import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { generateAiDescription, getAiDescriptionQuota } from './aiDescriptionApi'
import type { AiDescriptionRequest } from './aiDescriptionTypes'

export const aiDescriptionQuotaKey = ['seller', 'ai-description', 'quota'] as const

export const useAiDescriptionQuota = () => useQuery({
  queryKey: aiDescriptionQuotaKey,
  queryFn: getAiDescriptionQuota,
  staleTime: 30_000,
})

export function useGenerateAiDescription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: AiDescriptionRequest) => generateAiDescription(request),
    onSuccess: (draft) => queryClient.setQueryData(aiDescriptionQuotaKey, draft.quota),
    onSettled: () => queryClient.invalidateQueries({ queryKey: aiDescriptionQuotaKey }),
  })
}
