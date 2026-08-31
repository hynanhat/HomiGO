import { expect, test, type Page } from '@playwright/test'

const user = { id: 1, name: 'Nguyễn Minh An', email: 'an@homigo.vn', role: 'USER' }
let profile = { ...user, phone: '0901234567', status: 'ACTIVE', createdAt: '2026-07-01T08:00:00' }
const listing = {
  id: 101,
  publicCode: 'HMG-2026-000101',
  userId: 2,
  version: 1,
  title: 'Căn hộ hai phòng ngủ tại An Khánh',
  description: 'Không gian sáng.',
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
  empty: !content.length,
})
async function mockApi(page: Page) {
  let authenticated = false
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    let data: unknown = null
    if (path.endsWith('/auth/register')) data = user
    else if (path.endsWith('/auth/login')) {
      authenticated = true
      data = { accessToken: 'access', tokenType: 'Bearer', user }
    } else if (path.endsWith('/auth/logout')) {
      authenticated = false
      data = null
    } else if (path.endsWith('/auth/refresh') && authenticated)
      data = { accessToken: 'rotated', tokenType: 'Bearer', user }
    else if (path.endsWith('/auth/refresh')) {
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
    } else if (path.endsWith('/users/me') && request.method() === 'PUT') {
      profile = { ...profile, ...request.postDataJSON() }
      data = profile
    } else if (path.endsWith('/users/me')) data = profile
    else if (path.endsWith('/saved-listings') && request.method() === 'GET')
      data = pageOf([listing])
    else if (path.endsWith('/listings')) data = pageOf([listing])
    else if (path.endsWith('/projects')) data = pageOf([project])
    else if (path.endsWith('/categories') || path.includes('/locations/')) data = pageOf([])
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data, message: 'OK', errorCode: null }),
    })
  })
}

test('register, login, reload, save, update profile and logout', async ({ page }) => {
  await mockApi(page)
  await page.goto('/auth/register')
  await page.getByLabel(/Họ và tên/).fill(user.name)
  await page.getByLabel(/Email/).fill(user.email)
  await page.getByLabel(/^Mật khẩu/).fill('correct-horse')
  await page.getByLabel(/Xác nhận mật khẩu/).fill('correct-horse')
  await page.getByRole('button', { name: 'Đăng ký' }).click()
  await expect(page).toHaveURL(/auth\/login/)
  await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible()
  await page.getByLabel(/Email/).fill(user.email)
  await page.getByLabel(/Mật khẩu/).fill('correct-horse')
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page).toHaveURL(/\/$/)
  await page.reload()
  await page.goto('/listings')
  await page.getByRole('button', { name: 'Lưu tin đăng' }).first().click()
  await expect(page.getByRole('button', { name: 'Bỏ lưu tin đăng' }).first()).toBeVisible()
  await page.goto('/account/profile')
  await page.getByLabel(/Họ và tên/).fill('Nguyễn Minh An Mới')
  await page.getByRole('button', { name: 'Lưu thay đổi' }).click()
  await expect(page.getByText('Đã cập nhật hồ sơ')).toBeVisible()
  await page.getByRole('button', { name: 'Đăng xuất' }).click()
  await expect(page).toHaveURL(/auth\/login/)
})
