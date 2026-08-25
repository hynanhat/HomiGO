import { expect, test, type Page } from '@playwright/test'

const listing = { id: 101, publicCode: 'HMG-2026-000101', userId: 2, version: 1, title: 'Căn hộ tại Homi Riverside', description: 'Tin đang hoạt động.', categoryName: 'Căn hộ', projectName: 'Homi Riverside', provinceName: 'TP. Hồ Chí Minh', districtName: 'Thành phố Thủ Đức', address: '12 Nguyễn Văn Hưởng', price: 5800000000, area: 82, bedrooms: 2, bathrooms: 2, contactName: 'Trần Bình', contactPhone: '0901234567', status: 'ACTIVE', images: [], createdAt: '2026-08-01T08:00:00', updatedAt: '2026-08-14T10:30:00' }
const project = { id: 201, name: 'Homi Riverside', slug: 'homi-riverside', investor: 'Homi Group', districtId: 32, districtName: 'Thành phố Thủ Đức', wardId: 41, wardName: 'Phường Thảo Điền', address: '12 Nguyễn Văn Hưởng', status: 'IN_PROGRESS', priceFrom: 4500000000, priceTo: 9000000000, updatedAt: '2026-08-12T09:00:00' }
const pageOf = (content: unknown[]) => ({ content, number: 0, size: 12, totalElements: content.length, totalPages: content.length ? 1 : 0, numberOfElements: content.length, first: true, last: true, empty: !content.length })
async function mockProjects(page: Page) {
  await page.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    if (path.endsWith('/auth/refresh')) {
      await route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ success: false, data: null, message: 'Anonymous', errorCode: 'UNAUTHORIZED' }) })
      return
    }
    let data: unknown = pageOf([])
    if (path.endsWith('/projects/homi-riverside')) data = { ...project, description: 'Dự án ven sông hiện đại.', listings: pageOf([listing]) }
    else if (path.endsWith('/projects')) data = pageOf([project])
    else if (path.endsWith('/provinces')) data = pageOf([{ id: 21, name: 'TP. Hồ Chí Minh' }])
    else if (path.includes('/districts')) data = pageOf([{ id: 32, provinceId: 21, name: 'Thành phố Thủ Đức' }])
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data, message: 'OK', errorCode: null }) })
  })
}

test('guest filters projects and opens slug detail with ACTIVE listings', async ({ page }) => {
  await mockProjects(page)
  await page.goto('/projects')
  await page.getByLabel('Từ khóa').fill('Homi')
  await page.getByLabel('Tiến độ').selectOption('IN_PROGRESS')
  await expect(page).toHaveURL(/status=IN_PROGRESS/)
  await page.getByRole('link', { name: 'Homi Riverside' }).click()
  await expect(page).toHaveURL(/projects\/homi-riverside/)
  await expect(page.getByRole('heading', { name: 'Homi Riverside' })).toBeVisible()
  await expect(page.getByText('Mã tin: HMG-2026-000101')).toBeVisible()
})
