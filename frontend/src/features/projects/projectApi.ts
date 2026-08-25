import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'
import type { ProjectDetail, ProjectSearchState, ProjectSummary } from '@/types/domain'

export function searchProjects(params: ProjectSearchState): Promise<PageResponse<ProjectSummary>> {
  return apiClient.get<PageResponse<ProjectSummary>>('/projects', { params })
}

export function getProject(slug: string, page = 0, size = 12): Promise<ProjectDetail> {
  return apiClient.get<ProjectDetail>(`/projects/${encodeURIComponent(slug)}`, { params: { page, size } })
}
