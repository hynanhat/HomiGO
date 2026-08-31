import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'
import type {
  AdminUser,
  Category,
  ListingStatus,
  ModerationItem,
  ProjectStatus,
  ProjectSummary,
  TransactionType,
} from '@/types/domain'

export interface CategoryRequest {
  name: string
  slug: string
  transactionType: TransactionType
}
export interface ProjectRequest {
  name: string
  slug: string
  investor: string
  provinceCode: string
  communeCode: string
  address: string
  latitude?: number
  longitude?: number
  status: ProjectStatus
  description: string
  priceFrom?: number
  priceTo?: number
}

export const PINNED_ADMINISTRATIVE_DATASET_VERSION = 'vn-administrative-units-2025-07-01'
export const PINNED_PRODUCTION_CATEGORY_VERSION = 'categories-v1'

export type AdministrativeDatasetStatus =
  'STAGED' | 'VALIDATED' | 'ACTIVE' | 'FAILED' | 'SUPERSEDED'

export interface AdministrativeDatasetRelease {
  datasetVersion: string
  authority: string
  documentNumber: string
  effectiveDate: string
  rawSha256: string
  normalizedSha256: string
  expectedProvinceCount: number
  expectedCommuneCount: number
  actualProvinceCount: number | null
  actualCommuneCount: number | null
  status: AdministrativeDatasetStatus
  validationSummary: string | null
  validatedAt: string | null
  activatedAt: string | null
}

export interface ProductionCategoryInitialization {
  version: string
  total: number
  created: number
  unchanged: number
}
export const getModerationQueue = (status: ListingStatus = 'PENDING', page = 0, size = 20) =>
  apiClient.get<PageResponse<ModerationItem>>('/admin/listings', { params: { status, page, size } })
export const approveListing = (id: number) =>
  apiClient.post<ModerationItem>(`/admin/listings/${id}/approve`)
export const rejectListing = (id: number, reason: string) =>
  apiClient.post<ModerationItem>(`/admin/listings/${id}/reject`, { reason })
export const getAdminUsers = (page = 0, size = 20) =>
  apiClient.get<PageResponse<AdminUser>>('/admin/users', { params: { page, size } })
export const banUser = (id: number, reason: string) =>
  apiClient.post<AdminUser>(`/admin/users/${id}/ban`, { reason })
export const unbanUser = (id: number) => apiClient.post<AdminUser>(`/admin/users/${id}/unban`)
export const getAdminCategories = (page = 0, size = 100) =>
  apiClient.get<PageResponse<Category>>('/admin/categories', { params: { page, size } })
export const createCategory = (request: CategoryRequest) =>
  apiClient.post<Category>('/admin/categories', request)
export const updateCategory = (id: number, request: CategoryRequest) =>
  apiClient.put<Category>(`/admin/categories/${id}`, request)
export const deleteCategory = (id: number) => apiClient.delete<void>(`/admin/categories/${id}`)
export const getAdminProjects = (page = 0, size = 100) =>
  apiClient.get<PageResponse<ProjectSummary>>('/admin/projects', { params: { page, size } })
export const createProject = (request: ProjectRequest) =>
  apiClient.post<ProjectSummary>('/admin/projects', request)
export const updateProject = (id: number, request: ProjectRequest) =>
  apiClient.put<ProjectSummary>(`/admin/projects/${id}`, request)
export const deleteProject = (id: number) => apiClient.delete<void>(`/admin/projects/${id}`)

export const getAdministrativeDatasets = (page = 0, size = 10) =>
  apiClient.get<PageResponse<AdministrativeDatasetRelease>>('/admin/location-datasets', {
    params: { page, size },
  })

export const validateAdministrativeDataset = (datasetVersion: string) =>
  apiClient.post<AdministrativeDatasetRelease>(
    `/admin/location-datasets/${encodeURIComponent(datasetVersion)}/validate`,
  )

export const activateAdministrativeDataset = (datasetVersion: string) =>
  apiClient.post<AdministrativeDatasetRelease>(
    `/admin/location-datasets/${encodeURIComponent(datasetVersion)}/activate`,
    undefined,
    { timeout: 120_000 },
  )

export const initializeProductionCategories = (version: string) =>
  apiClient.post<ProductionCategoryInitialization>(
    `/admin/production-categories/${encodeURIComponent(version)}/initialize`,
  )
