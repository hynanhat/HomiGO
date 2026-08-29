import type { ApiResponse, PageResponse } from '@/types/api'
import type {
  AdminUser,
  AuthSession,
  Category,
  DistrictOption,
  Listing,
  ModerationItem,
  ProjectSummary,
  ProjectDetail,
  ProvinceOption,
  WardOption,
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

export const provinceFixtures: ProvinceOption[] = [{ id: 21, name: 'TP. Hồ Chí Minh' }]
export const districtFixtures: DistrictOption[] = [
  { id: 31, provinceId: 21, name: 'Quận 1' },
  { id: 32, provinceId: 21, name: 'Thành phố Thủ Đức' },
]
export const wardFixtures: WardOption[] = [
  { id: 41, districtId: 32, name: 'Phường Thảo Điền', code: 'THAO-DIEN' },
]

export const listingFixtures: Listing[] = [
  {
    id: 101,
    publicCode: 'HMG-2026-000101',
    userId: 2,
    version: 1,
    title: 'Căn hộ hai phòng ngủ tại Thảo Điền',
    description: 'Không gian sáng, phù hợp gia đình trẻ.',
    categoryName: 'Căn hộ',
    categoryId: 11,
    projectName: 'Homi Riverside',
    provinceName: 'TP. Hồ Chí Minh',
    districtName: 'Thành phố Thủ Đức',
    districtId: 32,
    wardName: 'Phường Thảo Điền',
    wardId: 41,
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
    districtId: 32,
    districtName: 'Thành phố Thủ Đức',
    wardId: 41,
    wardName: 'Phường Thảo Điền',
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
  description:
    'Dự án ven sông với không gian xanh, tiện ích đồng bộ và kết nối thuận tiện tới trung tâm.',
  latitude: 10.804,
  longitude: 106.732,
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
