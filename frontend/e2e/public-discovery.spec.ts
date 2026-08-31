import { expect, test, type Page } from '@playwright/test'

const listing = {
  id: 101,
  publicCode: 'HMG-2026-000101',
  userId: 2,
  version: 1,
  title: 'Căn hộ hai phòng ngủ tại An Khánh',
  description: 'Không gian sáng, phù hợp gia đình trẻ.',
  categoryName: 'Căn hộ',
  projectName: 'Homi Riverside',
  provinceCode: '79',
  provinceName: 'Thành phố Hồ Chí Minh',
  communeCode: '26734',
  communeName: 'Phường An Khánh',
  communeType: 'WARD',
  address: '12 Nguyễn Văn Hưởng',
  price: 5800000000,
  area: 82,
  bedrooms: 2,
  bathrooms: 2,
  contactName: 'Trần Bình',
  contactPhone: '0901234567',
  status: 'ACTIVE',
  images: [],
  createdAt: '2026-08-01T08:00:00',
  updatedAt: '2026-08-14T10:30:00',
  publishedAt: '2026-08-02T09:00:00',
}
const project = {
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
  status: 'IN_PROGRESS',
  priceFrom: 4500000000,
  priceTo: 9000000000,
  updatedAt: '2026-08-12T09:00:00',
}

function envelope(data: unknown) {
  return { success: true, data, message: 'OK', errorCode: null }
}
function pageOf(content: unknown[]) {
  return {
    content,
    number: 0,
    size: 12,
    totalElements: content.length,
    totalPages: content.length ? 1 : 0,
    numberOfElements: content.length,
    first: true,
    last: true,
    empty: !content.length,
  }
}
async function mockPublicApi(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          data: null,
          message: 'Anonymous',
          errorCode: 'UNAUTHORIZED',
        }),
      })
      return
    }
    let data: unknown = pageOf([])
    if (path.endsWith('/listings/HMG-2026-000101')) data = listing
    else if (path.endsWith('/listings')) data = pageOf([listing])
    else if (path.endsWith('/projects')) data = pageOf([project])
    else if (path.endsWith('/categories'))
      data = pageOf([{ id: 11, name: 'Căn hộ', slug: 'can-ho', transactionType: 'BUY' }])
    else if (path.endsWith('/provinces'))
      data = pageOf([
        {
          code: '79',
          name: 'Thành phố Hồ Chí Minh',
          type: 'CENTRAL_MUNICIPALITY',
          active: true,
          effectiveFrom: '2025-07-01',
          sourceVersion: '2025-07-01',
        },
      ])
    else if (path.includes('/provinces/79/commune-units'))
      data = pageOf([
        {
          code: '26734',
          provinceCode: '79',
          name: 'Phường An Khánh',
          type: 'WARD',
          active: true,
          effectiveFrom: '2025-07-01',
          sourceVersion: '2025-07-01',
        },
      ])
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(envelope(data)),
    })
  })
}

test('guest searches, filters and opens a listing by publicCode', async ({ page }) => {
  await mockPublicApi(page)
  await page.goto('/')
  await page.getByRole('button', { name: /Thuê/ }).click()
  await page.getByLabel('Tìm bất động sản').fill('An Khánh')
  await page.getByRole('button', { name: /Tìm kiếm/ }).click()
  await expect(page).toHaveURL(/transactionType=RENT/)
  await expect(page.getByText('1 kết quả')).toBeVisible()
  if (page.viewportSize()!.width < 1024) {
    await page.getByRole('button', { name: 'Bộ lọc' }).click()
    await page
      .getByRole('dialog', { name: 'Bộ lọc tìm kiếm' })
      .getByLabel('Tỉnh / thành phố')
      .selectOption('79')
    await page.getByRole('button', { name: 'Xem kết quả' }).click()
  } else {
    await page.getByLabel('Tỉnh / thành phố').selectOption('79')
  }
  await page
    .getByRole('link', { name: /Xem Căn hộ hai phòng ngủ/ })
    .first()
    .click()
  await expect(page).toHaveURL(/HMG-2026-000101/)
  await expect(page.getByRole('heading', { name: listing.title })).toBeVisible()
  await expect(page.getByRole('link', { name: listing.contactPhone })).toBeVisible()
})
