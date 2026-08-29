import { apiClient } from '@/lib/api/client'
import type { PageResponse } from '@/types/api'
import type {
  AdminUser,
  Category,
  DistrictOption,
  ListingStatus,
  ModerationItem,
  ProjectStatus,
  ProjectSummary,
  ProvinceOption,
  TransactionType,
  WardOption,
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
  districtId: number
  wardId?: number
  address: string
  latitude?: number
  longitude?: number
  status: ProjectStatus
  description: string
  priceFrom?: number
  priceTo?: number
}
export interface ProvinceRequest {
  name: string
}
export interface DistrictRequest {
  provinceId: number
  name: string
}
export interface WardRequest {
  districtId: number
  name: string
  code: string
}
export type AdminLocationKind = 'provinces' | 'districts' | 'wards'
export type AdminLocationRow = ProvinceOption | DistrictOption | WardOption

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
export const getAdminLocations = <T extends AdminLocationRow>(
  kind: AdminLocationKind,
  page = 0,
  size = 100,
) => apiClient.get<PageResponse<T>>(`/admin/locations/${kind}`, { params: { page, size } })
export const createAdminLocation = <T extends AdminLocationRow>(
  kind: AdminLocationKind,
  request: ProvinceRequest | DistrictRequest | WardRequest,
) => apiClient.post<T>(`/admin/locations/${kind}`, request)
export const updateAdminLocation = <T extends AdminLocationRow>(
  kind: AdminLocationKind,
  id: number,
  request: ProvinceRequest | DistrictRequest | WardRequest,
) => apiClient.put<T>(`/admin/locations/${kind}/${id}`, request)
export const deleteAdminLocation = (kind: AdminLocationKind, id: number) =>
  apiClient.delete<void>(`/admin/locations/${kind}/${id}`)
