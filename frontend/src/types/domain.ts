import type { PageResponse } from './api'

export type UserRole = 'USER' | 'SELLER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'BANNED'
export type ListingStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE' | 'EXPIRED'
export type ProjectStatus = 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
export type TransactionType = 'BUY' | 'RENT'
export type SessionStatus = 'restoring' | 'authenticated' | 'anonymous'

export interface SessionUser {
  id: number
  name: string
  email: string
  role: UserRole
}

export interface UserProfile extends SessionUser {
  phone?: string | null
  status: UserStatus
  createdAt: string
}

export interface SessionState {
  user: SessionUser | null
  accessToken: string | null
  status: SessionStatus
}

export interface AuthTokens {
  accessToken: string
  tokenType?: string
}

export interface AuthSession extends AuthTokens {
  user: SessionUser
}

export interface Category {
  id: number
  name: string
  slug: string
  transactionType: TransactionType
}

export interface Listing {
  id: number
  publicCode: string
  userId: number
  version: number
  title: string
  description: string
  categoryName: string
  categoryId?: number
  projectName?: string | null
  projectId?: number | null
  provinceName: string
  districtName: string
  districtId?: number
  wardName?: string | null
  wardId?: number | null
  address: string
  latitude?: number | null
  longitude?: number | null
  price: number
  area: number
  bedrooms?: number | null
  bathrooms?: number | null
  floors?: number | null
  direction?: string | null
  furnishing?: string | null
  legalStatus?: string | null
  contactName: string
  contactPhone: string
  status: ListingStatus
  rejectionReason?: string | null
  images: string[]
  imageIds?: number[]
  createdAt: string
  updatedAt: string
  publishedAt?: string | null
  expiresAt?: string | null
}

export type ListingSort = 'newest' | 'priceAsc' | 'priceDesc' | 'areaAsc' | 'areaDesc'

export interface ListingSearchState {
  keyword?: string
  transactionType?: TransactionType
  provinceId?: number
  districtId?: number
  wardId?: number
  categoryId?: number
  projectId?: number
  minPrice?: number
  maxPrice?: number
  minArea?: number
  maxArea?: number
  bedrooms?: number
  minLat?: number
  maxLat?: number
  minLng?: number
  maxLng?: number
  sort: ListingSort
  page: number
  size: number
}

export interface ProvinceOption {
  id: number
  name: string
}

export interface DistrictOption {
  id: number
  provinceId: number
  name: string
}

export interface WardOption {
  id: number
  districtId: number
  name: string
  code: string
}

export interface ProjectSummary {
  id: number
  name: string
  slug: string
  investor: string
  districtId: number
  districtName: string
  wardId?: number | null
  wardName?: string | null
  address: string
  description: string
  latitude?: number | null
  longitude?: number | null
  status: ProjectStatus
  priceFrom?: number | null
  priceTo?: number | null
  updatedAt: string
}

export interface ProjectDetail extends ProjectSummary {
  listings: PageResponse<Listing>
}

export interface ProjectSearchState {
  keyword?: string
  districtId?: number
  status?: ProjectStatus
  page: number
  size: number
}

export interface AdminUser {
  id: number
  name: string
  email: string
  phone?: string | null
  role: UserRole
  status: UserStatus
  createdAt: string
}

export interface ModerationItem {
  id: number
  publicCode: string
  title: string
  sellerId: number
  sellerEmail: string
  status: ListingStatus
  rejectionReason?: string | null
  createdAt: string
  approvedAt?: string | null
  publishedAt?: string | null
  expiresAt?: string | null
  version: number
}
