import { expect, test, type Page } from '@playwright/test'

const seller = { id: 2, name: 'Trần Bình', email: 'seller@homigo.vn', role: 'SELLER' }
const listing = {
  id: 101, publicCode: 'HMG-2026-000101', userId: 2, version: 1,
  title: 'Căn hộ hai phòng ngủ tại Thảo Điền', description: 'Không gian sáng, phù hợp gia đình trẻ.',
  categoryName: 'Căn hộ', projectName: 'Homi Riverside', provinceName: 'TP. Hồ Chí Minh',
  districtName: 'Thành phố Thủ Đức', wardName: 'Phường Thảo Điền', address: '12 Nguyễn Văn Hưởng',
  price: 5_800_000_000, area: 82, bedrooms: 2, bathrooms: 2,
  contactName: 'Trần Bình', contactPhone: '0901234567', status: 'ACTIVE', images: [],
  createdAt: '2026-08-01T08:00:00', updatedAt: '2026-08-14T10:30:00', publishedAt: '2026-08-02T09:00:00',
}
const recommended = {
  ...listing, id: 102, publicCode: 'HMG-2026-000102', userId: 3,
  title: 'Căn hộ ven sông cùng khu vực', price: 6_100_000_000,
}
const notification = {
  id: 701, type: 'LISTING_APPROVED', title: 'Tin đăng đã được duyệt',
  message: 'Tin “Căn hộ hai phòng ngủ tại Thảo Điền” đã được duyệt và đang hiển thị.',
  listingId: listing.id, listingPublicCode: listing.publicCode, read: false, readAt: null,
  createdAt: '2026-08-17T10:30:00',
}

function envelope(data: unknown) { return { success: true, data, message: 'OK', errorCode: null } }
function pageOf(content: unknown[]) {
  return { content, number: 0, size: 20, totalElements: content.length, totalPages: content.length ? 1 : 0, numberOfElements: content.length, first: true, last: true, empty: !content.length }
}

async function mockAdvancedApi(page: Page, authenticated = false) {
  let viewRequests = 0
  let notificationRead = false
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()
    let data: unknown = null

    if (path.endsWith('/auth/refresh') && authenticated) data = { accessToken: 'access', tokenType: 'Bearer', user: seller }
    else if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false, data: null, message: 'Anonymous', errorCode: 'UNAUTHORIZED' }) })
      return
    }
    else if (path.endsWith('/notifications/unread-count')) data = { count: notificationRead ? 0 : 1 }
    else if (path.endsWith('/notifications/read-all')) data = { updatedCount: 1 }
    else if (/\/notifications\/\d+\/read$/.test(path)) { notificationRead = true; data = { ...notification, read: true, readAt: '2026-08-17T11:00:00' } }
    else if (path.endsWith('/notifications')) data = pageOf([{ ...notification, read: notificationRead, readAt: notificationRead ? '2026-08-17T11:00:00' : null }])
    else if (path.endsWith('/listings/HMG-2026-000101/views') && method === 'POST') { viewRequests += 1; data = { recorded: viewRequests === 1 } }
    else if (path.endsWith('/listings/HMG-2026-000101/recommendations')) data = [{ listing: recommended, score: 88, reasons: ['Cùng loại bất động sản', 'Cùng quận/huyện'] }]
    else if (path.endsWith('/listings/HMG-2026-000101')) data = listing
    else if (path.endsWith('/seller/listings/101/statistics')) data = {
      listingId: 101, publicCode: listing.publicCode, totalViews: 124, todayViews: 7, last7DaysViews: 46, periodDays: 30,
      dailyViews: Array.from({ length: 30 }, (_, index) => ({ date: `2026-08-${String(index + 1).padStart(2, '0')}`, views: index % 5 })),
    }
    else if (path.endsWith('/seller/listings/101')) data = listing
    else if (path.endsWith('/listings')) data = pageOf([listing])
    else data = pageOf([])

    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(envelope(data)) })
  })
  return () => viewRequests
}

test('authenticated user navigates notification inbox and marks an item read', async ({ page }) => {
  await mockAdvancedApi(page, true)
  await page.goto('/notifications')

  await expect(page.getByRole('heading', { name: 'Thông báo của bạn' })).toBeVisible()
  await expect(page.getByText('Tin đăng đã được duyệt').first()).toBeVisible()
  await page.getByRole('button', { name: 'Đã đọc', exact: true }).click()
  await expect(page.getByText('0 thông báo chưa đọc').first()).toBeVisible()
})

test('public detail records a view and renders explainable recommendations', async ({ page }) => {
  const getViewRequests = await mockAdvancedApi(page)
  await page.goto('/listings/HMG-2026-000101')

  await expect(page.getByRole('heading', { name: listing.title })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Bất động sản dành cho bạn' })).toBeVisible()
  await expect(page.getByText(recommended.title)).toBeVisible()
  await expect(page.getByText('Cùng quận/huyện')).toBeVisible()
  await expect.poll(getViewRequests).toBe(1)
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  expect(overflow).toBeLessThanOrEqual(1)
})

test('seller sees unique-view metrics and accessible daily data', async ({ page }) => {
  await mockAdvancedApi(page, true)
  await page.goto('/seller/listings/101')

  await expect(page.getByRole('heading', { name: 'Thống kê lượt xem duy nhất' })).toBeVisible()
  await expect(page.getByText('124')).toBeVisible()
  await expect(page.getByRole('img', { name: 'Biểu đồ lượt xem trong 30 ngày' })).toBeVisible()
  await expect(page.getByText('Xem số liệu dạng danh sách')).toBeVisible()
})
