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
  price: 5_800_000_000,
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
  priceFrom: 4_500_000_000,
  priceTo: 9_000_000_000,
  updatedAt: '2026-08-12T09:00:00',
}
const pageOf = (content: unknown[]) => ({
  content,
  number: 0,
  size: 12,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  numberOfElements: content.length,
  first: true,
  last: true,
  empty: content.length === 0,
})

async function mockHomepage(page: Page) {
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
    const data = path.endsWith('/listings')
      ? pageOf([listing])
      : path.endsWith('/projects')
        ? pageOf([project])
        : pageOf([])
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data, message: 'OK', errorCode: null }),
    })
  })
}

test('capture approved graduation homepage', async ({ page }, testInfo) => {
  await mockHomepage(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Tìm đúng nơi. Sống đúng chất.' })).toBeVisible()
  await expect(page.getByText('Căn hộ hai phòng ngủ tại An Khánh')).toBeVisible()
  await page.screenshot({
    path: `../.specify/specs/002-modern-business-frontend/evidence/screenshots/home-${testInfo.project.name}.png`,
    fullPage: true,
  })
})
