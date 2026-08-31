import type { ApiResponse, PageResponse } from '@/types/api'
import type { AdministrativeDatasetRelease } from '@/features/admin/adminApi'
import type {
  AdminUser,
  AuthSession,
  Category,
  CommuneUnitOption,
  Listing,
  ModerationItem,
  ProjectDetail,
  ProjectSummary,
  ProvinceOption,
  UserProfile,
} from '@/types/domain'

export function buildApiResponse<T>(data: T, message = 'Thành công.'): ApiResponse<T> {
  return { success: true, data, message, errorCode: null }
}

export function buildPage<T>(
  content: T[],
  page = 0,
  size = Math.max(content.length, 1),
): PageResponse<T> {
  const start = page * size
  const pageContent = content.slice(start, start + size)
  const totalPages = content.length === 0 ? 0 : Math.ceil(content.length / size)
  return {
    content: pageContent,
    number: page,
    size,
    totalElements: content.length,
    totalPages,
    numberOfElements: pageContent.length,
    first: page === 0,
    last: totalPages === 0 || page >= totalPages - 1,
    empty: pageContent.length === 0,
  }
}

export const sessionFixture: AuthSession = {
  accessToken: 'fixture-access-token',
  tokenType: 'Bearer',
  user: { id: 1, name: 'Nguyễn Minh An', email: 'an@homigo.vn', role: 'USER' },
}

export const profileFixture: UserProfile = {
  ...sessionFixture.user,
  phone: '0901234567',
  status: 'ACTIVE',
  createdAt: '2026-07-01T08:00:00',
}

export const categoryFixtures: Category[] = [
  { id: 11, name: 'Căn hộ', slug: 'can-ho', transactionType: 'BUY' },
  { id: 12, name: 'Nhà phố', slug: 'nha-pho', transactionType: 'BUY' },
  { id: 13, name: 'Căn hộ cho thuê', slug: 'can-ho-cho-thue', transactionType: 'RENT' },
]

export const administrativeDatasetFixture: AdministrativeDatasetRelease = {
  datasetVersion: 'vn-administrative-units-2025-07-01',
  authority: 'Cục Thống kê',
  documentNumber: 'Quyết định 19/2025/QĐ-TTg ngày 30/06/2025',
  effectiveDate: '2025-07-01',
  rawSha256: 'f83055f528bf320f5546b6e62aa5cf58abe8f3594f95c9d04f82732c3c682b69',
  normalizedSha256: '0fc307a6e2b1ce90a912e14ddb3d1e564f479b950d6ce15bf9e6b43ae713b7cf',
  expectedProvinceCount: 34,
  expectedCommuneCount: 3_321,
  actualProvinceCount: 34,
  actualCommuneCount: 3_321,
  status: 'VALIDATED',
  validationSummary: '{"valid":true}',
  validatedAt: '2026-08-30T14:30:00',
  activatedAt: null,
}

export const provinceFixtures: ProvinceOption[] = [
  {
    code: '79',
    name: 'Thành phố Hồ Chí Minh',
    type: 'CENTRAL_MUNICIPALITY',
    active: true,
    effectiveFrom: '2025-07-01',
    sourceVersion: '2025-07-01',
  },
]

export const communeFixtures: CommuneUnitOption[] = [
  {
    code: '26734',
    provinceCode: '79',
    name: 'Phường An Khánh',
    type: 'WARD',
    active: true,
    effectiveFrom: '2025-07-01',
    sourceVersion: '2025-07-01',
  },
]

export const listingFixtures: Listing[] = [
  {
    id: 101,
    publicCode: 'HMG-2026-000101',
    userId: 2,
    version: 1,
    title: 'Căn hộ hai phòng ngủ tại An Khánh',
    description: 'Không gian sáng, phù hợp gia đình trẻ.',
    categoryName: 'Căn hộ',
    categoryId: 11,
    projectName: 'Homi Riverside',
    projectId: 201,
    provinceName: 'Thành phố Hồ Chí Minh',
    provinceCode: '79',
    communeName: 'Phường An Khánh',
    communeCode: '26734',
    communeType: 'WARD',
    address: '12 Nguyễn Văn Hưởng',
    price: 5_800_000_000,
    area: 82,
    bedrooms: 2,
    bathrooms: 2,
    contactName: 'Trần Bình',
    contactPhone: '0901234567',
    status: 'ACTIVE',
    images: ['/fixtures/listing-101.webp'],
    createdAt: '2026-08-01T08:00:00',
    updatedAt: '2026-08-14T10:30:00',
    publishedAt: '2026-08-02T09:00:00',
  },
]

export const projectFixtures: ProjectSummary[] = [
  {
    id: 201,
    name: 'Homi Riverside',
    slug: 'homi-riverside',
    investor: 'Homi Group',
    provinceCode: '79',
    provinceName: 'Thành phố Hồ Chí Minh',
    communeCode: '26734',
    communeName: 'Phường An Khánh',
    communeType: 'WARD',
    address: '12 Nguyễn Văn Hưởng',
    description:
      'Dự án ven sông với không gian xanh, tiện ích đồng bộ và kết nối thuận tiện tới trung tâm.',
    latitude: 10.804,
    longitude: 106.732,
    status: 'IN_PROGRESS',
    priceFrom: 4_500_000_000,
    priceTo: 9_000_000_000,
    updatedAt: '2026-08-12T09:00:00',
  },
]

export const projectDetailFixture: ProjectDetail = {
  ...projectFixtures[0],
  listings: buildPage(
    listingFixtures.filter((listing) => listing.status === 'ACTIVE'),
    0,
    12,
  ),
}

export const adminUserFixtures: AdminUser[] = [
  {
    id: 301,
    name: 'Lê Hoàng',
    email: 'seller@homigo.vn',
    phone: '0909000001',
    role: 'SELLER',
    status: 'ACTIVE',
    createdAt: '2026-07-01T08:00:00',
  },
]

export const moderationFixtures: ModerationItem[] = [
  {
    id: 401,
    publicCode: 'HMG-2026-000401',
    title: 'Nhà phố cần duyệt',
    sellerId: 301,
    sellerEmail: 'seller@homigo.vn',
    status: 'PENDING',
    createdAt: '2026-08-15T08:00:00',
    version: 0,
  },
]
