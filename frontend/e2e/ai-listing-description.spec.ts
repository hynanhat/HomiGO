import { expect, test, type Page } from '@playwright/test'

const seller = { id: 7, name: 'Seller AI', email: 'seller-ai@homigo.test', role: 'SELLER' }
const listing = {
  id: 501,
  publicCode: 'HMG-AI-501',
  userId: 7,
  categoryId: 11,
  categoryName: 'Căn hộ',
  provinceCode: '79',
  provinceName: 'Thành phố Hồ Chí Minh',
  communeCode: '26734',
  communeName: 'Phường An Khánh',
  communeType: 'WARD',
  projectId: null,
  projectName: null,
  title: 'Căn hộ sáng thoáng',
  description: 'Mô tả thủ công hiện tại',
  price: 3_200_000_000,
  area: 78,
  address: 'Nguyễn Huệ',
  bedrooms: 3,
  bathrooms: 2,
  contactName: 'Seller AI',
  contactPhone: '0901234567',
  status: 'DRAFT',
  images: [],
  createdAt: '2026-08-24T08:00:00',
  updatedAt: '2026-08-24T08:00:00',
  version: 0,
}
const pageOf = (content: unknown[]) => ({
  content,
  number: 0,
  size: 20,
  totalElements: content.length,
  totalPages: content.length ? 1 : 0,
  numberOfElements: content.length,
  first: true,
  last: true,
  empty: !content.length,
})

async function mockApi(page: Page) {
  let successfulAttempts = 0
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    let data: unknown = null
    if (path.endsWith('/auth/refresh'))
      data = { accessToken: 'access', tokenType: 'Bearer', user: seller }
    else if (path.endsWith('/categories'))
      data = pageOf([{ id: 11, name: 'Căn hộ', slug: 'can-ho', transactionType: 'BUY' }])
    else if (path.endsWith('/locations/provinces'))
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
    else if (path.endsWith('/projects')) data = pageOf([])
    else if (path.endsWith('/seller/ai-description/quota'))
      data = {
        enabled: true,
        limit: 5,
        successfulAttempts,
        remainingAttempts: 5 - successfulAttempts,
        availableNow: 5 - successfulAttempts,
        resetAt: '2026-08-25T00:00:00+07:00',
        retryAt: null,
      }
    else if (path.endsWith('/seller/ai-description/drafts')) {
      const body = request.postDataJSON()
      expect(body).toMatchObject({
        keywords: 'ban công thoáng',
        categoryId: 11,
        provinceCode: '79',
        communeCode: '26734',
        price: 3_200_000_000,
        area: 78,
      })
      expect(body.contactPhone).toBeUndefined()
      expect(body.latitude).toBeUndefined()
      successfulAttempts += 1
      data = {
        description: `Bản mô tả AI lần ${successfulAttempts}`,
        quota: {
          enabled: true,
          limit: 5,
          successfulAttempts,
          remainingAttempts: 5 - successfulAttempts,
          availableNow: 5 - successfulAttempts,
          resetAt: '2026-08-25T00:00:00+07:00',
          retryAt: null,
        },
      }
    } else if (path.endsWith('/seller/listings/501')) data = listing
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data, message: 'OK', errorCode: null }),
    })
  })
}

for (const scenario of [
  { name: 'create', path: '/seller/listings/new', needsInput: true },
  { name: 'edit', path: '/seller/listings/501/edit', needsInput: false },
]) {
  test(`AI preview/apply works on ${scenario.name} listing form`, async ({ page }) => {
    await mockApi(page)
    await page.goto(scenario.path)
    if (scenario.needsInput) {
      await page.getByLabel(/Danh mục/).selectOption('11')
      await page.getByLabel('Tỉnh / thành phố').selectOption('79')
      await page.getByLabel(/Phường \/ xã \/ đặc khu/).selectOption('26734')
      await page.getByLabel(/Giá/).fill(String(listing.price))
      await page.getByLabel(/Diện tích/).fill(String(listing.area))
      await page.getByLabel(/Mô tả chi tiết/).fill(listing.description)
    }
    await expect(page.getByText('Còn 5/5 lượt hôm nay')).toBeVisible()
    await page.getByLabel('Từ khóa nổi bật').fill('ban công thoáng')
    await page.getByRole('button', { name: 'Tạo mô tả' }).click()
    await expect(page.getByText('Bản mô tả AI lần 1')).toBeVisible()
    await expect(page.getByLabel(/Mô tả chi tiết/)).toHaveValue(listing.description)
    await page.getByRole('button', { name: 'Hủy bản xem trước' }).click()
    await expect(page.getByText('Bản mô tả AI lần 1')).toBeHidden()
    await page.getByRole('button', { name: 'Tạo mô tả' }).click()
    page.once('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'Áp dụng vào mô tả' }).click()
    await expect(page.getByLabel(/Mô tả chi tiết/)).toHaveValue('Bản mô tả AI lần 2')
    await expect(page.getByText('Còn 3/5 lượt hôm nay')).toBeVisible()
  })
}
