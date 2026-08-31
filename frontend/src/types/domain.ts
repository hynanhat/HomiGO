import type { PageResponse } from './api'

export type UserRole = 'USER' | 'SELLER' | 'ADMIN'
export type UserStatus = 'ACTIVE' | 'BANNED'
export type ListingStatus =
  'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'INACTIVE' | 'EXPIRED' | 'REMOVED'
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
  transactionType: TransactionType
  projectName?: string | null
  projectId?: number | null
  provinceName: string
  provinceCode: string
  communeName: string
  communeCode: string
  communeType: 'COMMUNE' | 'WARD' | 'SPECIAL_ZONE'
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
  removalReason?: string | null
  images: string[]
  imageIds?: number[]
  createdAt: string
  updatedAt: string
  approvedAt?: string | null
  publishedAt?: string | null
  expiresAt?: string | null
  removedAt?: string | null
}

export type ListingSort = 'newest' | 'priceAsc' | 'priceDesc' | 'areaAsc' | 'areaDesc'

export interface ListingSearchState {
  keyword?: string
  transactionType?: TransactionType
  provinceCode?: string
  communeCode?: string
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
  code: string
  name: string
  type: 'PROVINCE' | 'CENTRAL_MUNICIPALITY'
  active: boolean
  effectiveFrom: string
  sourceVersion: string
}

export interface CommuneUnitOption {
  code: string
  provinceCode: string
  name: string
  type: 'COMMUNE' | 'WARD' | 'SPECIAL_ZONE'
  active: boolean
  effectiveFrom: string
  sourceVersion: string
}

export interface ProjectSummary {
  id: number
  name: string
  slug: string
  investor: string
  provinceCode: string
  provinceName: string
  communeCode: string
  communeName: string
  communeType: 'COMMUNE' | 'WARD' | 'SPECIAL_ZONE'
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
  provinceCode?: string
  communeCode?: string
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

export interface AdminListingSeller {
  id: number
  name: string
  email: string
  phone?: string | null
  status: UserStatus
  createdAt: string
}

export interface AdminListingHistory {
  id: number
  fromStatus?: ListingStatus | null
  toStatus: ListingStatus
  reason?: string | null
  changedById: number
  changedByName: string
  createdAt: string
}

export interface AdminListingDetail {
  listing: Listing
  seller: AdminListingSeller
  history: AdminListingHistory[]
}
