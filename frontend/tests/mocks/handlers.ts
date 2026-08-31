import { http, HttpResponse } from 'msw'
import {
  administrativeDatasetFixture,
  adminUserFixtures,
  buildApiResponse,
  buildPage,
  categoryFixtures,
  communeFixtures,
  listingFixtures,
  moderationFixtures,
  moderationDetailFixture,
  projectFixtures,
  projectDetailFixture,
  provinceFixtures,
  sessionFixture,
  profileFixture,
} from '../fixtures/apiFixtures'

function pagination(request: Request) {
  const url = new URL(request.url)
  return {
    page: Number(url.searchParams.get('page') ?? 0),
    size: Number(url.searchParams.get('size') ?? 20),
  }
}

const sellerUpgradePaymentFixture = {
  id: 801,
  orderCode: 'HMG-SEPAY-FIXTURE001',
  purpose: 'SELLER_UPGRADE' as const,
  amount: 99_000,
  currency: 'VND',
  status: 'PENDING' as const,
  providerOrderId: null,
  providerTransactionId: null,
  failureReason: null,
  expiresAt: '2026-08-17T12:15:00',
  completedAt: null,
  createdAt: '2026-08-17T12:00:00',
  updatedAt: '2026-08-17T12:00:00',
}

export const handlers = [
  http.post('*/api/v1/auth/login', () => HttpResponse.json(buildApiResponse(sessionFixture))),
  http.post('*/api/v1/auth/register', () =>
    HttpResponse.json(buildApiResponse(sessionFixture.user)),
  ),
  http.post('*/api/v1/auth/refresh', () =>
    HttpResponse.json(
      buildApiResponse({
        accessToken: 'fixture-rotated-access-token',
        tokenType: 'Bearer',
        user: sessionFixture.user,
      }),
    ),
  ),
  http.post('*/api/v1/auth/logout', () => HttpResponse.json(buildApiResponse(null))),
  http.put('*/api/v1/auth/password', () => HttpResponse.json(buildApiResponse(null))),
  http.get('*/api/v1/users/me', () => HttpResponse.json(buildApiResponse(profileFixture))),
  http.put('*/api/v1/users/me', async ({ request }) =>
    HttpResponse.json(
      buildApiResponse({ ...profileFixture, ...((await request.json()) as object) }),
    ),
  ),
  http.get('*/api/v1/payments/sepay/seller-upgrade/offer', () =>
    HttpResponse.json(
      buildApiResponse({
        amount: 99_000,
        currency: 'VND',
        provider: 'SEPAY',
        environment: 'sandbox',
        configured: true,
      }),
    ),
  ),
  http.post('*/api/v1/payments/sepay/seller-upgrade', () =>
    HttpResponse.json(
      buildApiResponse({
        payment: sellerUpgradePaymentFixture,
        checkoutUrl: 'https://pay-sandbox.sepay.vn/v1/checkout/init',
        method: 'POST',
        fields: {
          merchant: 'SP-TEST-FIXTURE',
          operation: 'PURCHASE',
          payment_method: 'BANK_TRANSFER',
          order_invoice_number: sellerUpgradePaymentFixture.orderCode,
          order_amount: '99000',
          currency: 'VND',
          signature: 'fixture-signature',
        },
      }),
    ),
  ),
  http.get('*/api/v1/payments/sepay/seller-upgrade/:orderCode', () =>
    HttpResponse.json(buildApiResponse(sellerUpgradePaymentFixture)),
  ),
  http.get('*/api/v1/payments/sepay/seller-upgrade', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage([sellerUpgradePaymentFixture], page, size)))
  }),
  http.get('*/api/v1/saved-listings', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(listingFixtures, page, size)))
  }),
  http.post('*/api/v1/saved-listings/:listingId', () => HttpResponse.json(buildApiResponse(null))),
  http.delete('*/api/v1/saved-listings/:listingId', () =>
    HttpResponse.json(buildApiResponse(null)),
  ),
  http.get('*/api/v1/notifications', ({ request }) => {
    const { page, size } = pagination(request)
    const notifications = [
      {
        id: 701,
        type: 'LISTING_APPROVED' as const,
        title: 'Tin đăng đã được duyệt',
        message: 'Tin “Căn hộ trung tâm” đã được duyệt và đang hiển thị.',
        listingId: listingFixtures[0].id,
        listingPublicCode: listingFixtures[0].publicCode,
        read: false,
        readAt: null,
        createdAt: '2026-08-17T10:30:00',
      },
    ]
    return HttpResponse.json(buildApiResponse(buildPage(notifications, page, size)))
  }),
  http.get('*/api/v1/notifications/unread-count', () =>
    HttpResponse.json(buildApiResponse({ count: 1 })),
  ),
  http.patch('*/api/v1/notifications/read-all', () =>
    HttpResponse.json(buildApiResponse({ updatedCount: 1 })),
  ),
  http.patch('*/api/v1/notifications/:notificationId/read', ({ params }) =>
    HttpResponse.json(
      buildApiResponse({
        id: Number(params.notificationId),
        type: 'LISTING_APPROVED',
        title: 'Tin đăng đã được duyệt',
        message: 'Đã duyệt',
        listingId: listingFixtures[0].id,
        listingPublicCode: listingFixtures[0].publicCode,
        read: true,
        readAt: '2026-08-17T11:00:00',
        createdAt: '2026-08-17T10:30:00',
      }),
    ),
  ),
  http.get('*/api/v1/seller/listings', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(listingFixtures, page, size)))
  }),
  http.post('*/api/v1/seller/listings', async ({ request }) =>
    HttpResponse.json(
      buildApiResponse({
        ...listingFixtures[0],
        ...((await request.json()) as object),
        id: 501,
        publicCode: 'HMG-2026-000501',
        status: 'DRAFT',
        version: 0,
      }),
    ),
  ),
  http.get('*/api/v1/seller/listings/:id', () =>
    HttpResponse.json(buildApiResponse(listingFixtures[0])),
  ),
  http.put('*/api/v1/seller/listings/:id', async ({ request }) =>
    HttpResponse.json(
      buildApiResponse({
        ...listingFixtures[0],
        ...((await request.json()) as object),
        version: listingFixtures[0].version + 1,
      }),
    ),
  ),
  http.delete('*/api/v1/seller/listings/:id', () => HttpResponse.json(buildApiResponse(null))),
  http.post('*/api/v1/seller/listings/:id/submit', () =>
    HttpResponse.json(buildApiResponse({ ...listingFixtures[0], status: 'PENDING' as const })),
  ),
  http.post('*/api/v1/seller/listings/:id/deactivate', () =>
    HttpResponse.json(buildApiResponse({ ...listingFixtures[0], status: 'INACTIVE' as const })),
  ),
  http.post('*/api/v1/seller/listings/:id/images', () =>
    HttpResponse.json(
      buildApiResponse({
        id: 501,
        url: '/uploads/fixture.webp',
        contentType: 'image/webp',
        sizeBytes: 5,
        sortOrder: 0,
      }),
    ),
  ),
  http.delete('*/api/v1/seller/listings/:id/images/:imageId', () =>
    HttpResponse.json(buildApiResponse(null)),
  ),
  http.get('*/api/v1/categories', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(categoryFixtures, page, size)))
  }),
  http.get('*/api/v1/listings', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(listingFixtures, page, size)))
  }),
  http.get('*/api/v1/listings/:publicCode', ({ params }) => {
    const listing = listingFixtures.find((item) => item.publicCode === params.publicCode)
    return listing
      ? HttpResponse.json(buildApiResponse(listing))
      : HttpResponse.json(
          {
            success: false,
            data: null,
            message: 'Không tìm thấy tin đăng.',
            errorCode: 'RESOURCE_NOT_FOUND',
          },
          { status: 404 },
        )
  }),
  http.post('*/api/v1/listings/:publicCode/views', () =>
    HttpResponse.json(buildApiResponse({ recorded: true })),
  ),
  http.get('*/api/v1/listings/:publicCode/recommendations', ({ request }) => {
    const size = Number(new URL(request.url).searchParams.get('size') ?? 6)
    const recommendations = Array.from({ length: Math.min(size, 2) }, (_, index) => ({
      listing: {
        ...listingFixtures[0],
        id: 102 + index,
        publicCode: `HMG-2026-00010${2 + index}`,
        title: index === 0 ? 'Căn hộ ven sông cùng khu vực' : 'Căn hộ hiện đại gần trung tâm',
        price: index === 0 ? 6_100_000_000 : 5_400_000_000,
      },
      score: 88 - index * 7,
      reasons: ['Cùng loại bất động sản', 'Cùng phường/xã/đặc khu'],
    }))
    return HttpResponse.json(buildApiResponse(recommendations))
  }),
  http.get('*/api/v1/seller/listings/:id/statistics', ({ params, request }) => {
    const days = Number(new URL(request.url).searchParams.get('days') ?? 30)
    const dailyViews = Array.from({ length: days }, (_, index) => ({
      date: new Date(Date.UTC(2026, 7, 17 - (days - 1 - index))).toISOString().slice(0, 10),
      views: index % 4,
    }))
    return HttpResponse.json(
      buildApiResponse({
        listingId: Number(params.id),
        publicCode: listingFixtures[0].publicCode,
        totalViews: 124,
        todayViews: 7,
        last7DaysViews: 46,
        periodDays: days,
        dailyViews,
      }),
    )
  }),
  http.get('*/api/v1/admin/listings/:id/statistics', ({ params }) =>
    HttpResponse.json(
      buildApiResponse({
        listingId: Number(params.id),
        publicCode: listingFixtures[0].publicCode,
        totalViews: 124,
        todayViews: 7,
        last7DaysViews: 46,
        periodDays: 7,
        dailyViews: [],
      }),
    ),
  ),
  http.get('*/api/v1/projects', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(projectFixtures, page, size)))
  }),
  http.get('*/api/v1/projects/:slug', ({ params, request }) => {
    if (params.slug !== projectDetailFixture.slug) {
      return HttpResponse.json(
        {
          success: false,
          data: null,
          message: 'Không tìm thấy dự án.',
          errorCode: 'RESOURCE_NOT_FOUND',
        },
        { status: 404 },
      )
    }
    const { page, size } = pagination(request)
    return HttpResponse.json(
      buildApiResponse({
        ...projectDetailFixture,
        listings: buildPage(
          listingFixtures.filter((listing) => listing.status === 'ACTIVE'),
          page,
          size,
        ),
      }),
    )
  }),
  http.get('*/api/v1/locations/provinces', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(provinceFixtures, page, size)))
  }),
  http.get('*/api/v1/locations/provinces/:provinceCode/commune-units', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(communeFixtures, page, size)))
  }),
  http.get('*/api/v1/admin/listings', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(moderationFixtures, page, size)))
  }),
  http.get('*/api/v1/admin/listings/:id', () =>
    HttpResponse.json(buildApiResponse(moderationDetailFixture)),
  ),
  http.post('*/api/v1/admin/listings/:id/approve', () =>
    HttpResponse.json(buildApiResponse({ ...moderationFixtures[0], status: 'ACTIVE' as const })),
  ),
  http.post('*/api/v1/admin/listings/:id/reject', async ({ request }) =>
    HttpResponse.json(
      buildApiResponse({
        ...moderationFixtures[0],
        status: 'REJECTED' as const,
        rejectionReason: ((await request.json()) as { reason: string }).reason,
      }),
    ),
  ),
  http.post('*/api/v1/admin/listings/:id/remove', async ({ request }) =>
    HttpResponse.json(
      buildApiResponse({
        ...moderationFixtures[0],
        status: 'REMOVED' as const,
        removalReason: ((await request.json()) as { reason: string }).reason,
      }),
    ),
  ),
  http.get('*/api/v1/admin/users', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(adminUserFixtures, page, size)))
  }),
  http.post('*/api/v1/admin/users/:id/ban', () =>
    HttpResponse.json(buildApiResponse({ ...adminUserFixtures[0], status: 'BANNED' as const })),
  ),
  http.post('*/api/v1/admin/users/:id/unban', () =>
    HttpResponse.json(buildApiResponse({ ...adminUserFixtures[0], status: 'ACTIVE' as const })),
  ),
  http.get('*/api/v1/admin/categories', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(categoryFixtures, page, size)))
  }),
  http.post('*/api/v1/admin/categories', async ({ request }) =>
    HttpResponse.json(buildApiResponse({ id: 99, ...((await request.json()) as object) })),
  ),
  http.put('*/api/v1/admin/categories/:id', async ({ params, request }) =>
    HttpResponse.json(
      buildApiResponse({ id: Number(params.id), ...((await request.json()) as object) }),
    ),
  ),
  http.delete('*/api/v1/admin/categories/:id', () => HttpResponse.json(buildApiResponse(null))),
  http.get('*/api/v1/admin/projects', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(buildApiResponse(buildPage(projectFixtures, page, size)))
  }),
  http.post('*/api/v1/admin/projects', async ({ request }) =>
    HttpResponse.json(
      buildApiResponse({
        id: 299,
        provinceName: 'Thành phố Hồ Chí Minh',
        communeName: 'Phường An Khánh',
        communeType: 'WARD',
        updatedAt: '2026-08-17T00:00:00',
        ...((await request.json()) as object),
      }),
    ),
  ),
  http.put('*/api/v1/admin/projects/:id', async ({ params, request }) =>
    HttpResponse.json(
      buildApiResponse({
        id: Number(params.id),
        provinceName: 'Thành phố Hồ Chí Minh',
        communeName: 'Phường An Khánh',
        communeType: 'WARD',
        updatedAt: '2026-08-17T00:00:00',
        ...((await request.json()) as object),
      }),
    ),
  ),
  http.delete('*/api/v1/admin/projects/:id', () => HttpResponse.json(buildApiResponse(null))),
  http.get('*/api/v1/admin/location-datasets', ({ request }) => {
    const { page, size } = pagination(request)
    return HttpResponse.json(
      buildApiResponse(buildPage([administrativeDatasetFixture], page, size)),
    )
  }),
  http.post('*/api/v1/admin/location-datasets/:datasetVersion/validate', ({ params }) =>
    HttpResponse.json(
      buildApiResponse({
        ...administrativeDatasetFixture,
        datasetVersion: String(params.datasetVersion),
        status: 'VALIDATED' as const,
      }),
    ),
  ),
  http.post('*/api/v1/admin/location-datasets/:datasetVersion/activate', ({ params }) =>
    HttpResponse.json(
      buildApiResponse({
        ...administrativeDatasetFixture,
        datasetVersion: String(params.datasetVersion),
        status: 'ACTIVE' as const,
        activatedAt: '2026-08-30T15:00:00',
      }),
    ),
  ),
  http.post('*/api/v1/admin/production-categories/:version/initialize', ({ params }) =>
    HttpResponse.json(
      buildApiResponse({
        version: String(params.version),
        total: 16,
        created: 13,
        unchanged: 3,
      }),
    ),
  ),
]
