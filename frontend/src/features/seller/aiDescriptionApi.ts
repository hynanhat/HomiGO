import { apiClient } from '@/lib/api/client'
import type {
  AiDescriptionDraft,
  AiDescriptionQuota,
  AiDescriptionRequest,
} from './aiDescriptionTypes'

export const getAiDescriptionQuota = () =>
  apiClient.get<AiDescriptionQuota>('/seller/ai-description/quota')

export const generateAiDescription = (request: AiDescriptionRequest) =>
  apiClient.post<AiDescriptionDraft>('/seller/ai-description/drafts', request, { timeout: 35_000 })
