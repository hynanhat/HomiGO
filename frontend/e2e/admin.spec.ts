import { expect, test, type Page } from '@playwright/test'

const admin = { id: 9, name: 'Quản trị viên', email: 'admin@homigo.vn', role: 'ADMIN' }
const seller = {
  id: 301,
  name: 'Lê Hoàng',
  email: 'seller@homigo.vn',
  phone: '0909000001',
  role: 'SELLER',
  status: 'ACTIVE',
  createdAt: '2026-07-01T08:00:00',
}
const category = { id: 11, name: 'Căn hộ', slug: 'can-ho', transactionType: 'BUY' }
const pending = (id: number) => ({
  id,
  publicCode: `HMG-2026-000${id}`,
  title: `Tin chờ duyệt ${id}`,
  sellerId: 301,
  sellerEmail: seller.email,
  status: 'PENDING',
  createdAt: '2026-08-15T08:00:00',
  version: 0,
})
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
async function mockAdmin(page: Page, user = admin) {
  let moderation = [pending(401), pending(402)]
  let userStatus = 'ACTIVE'
  const categories = [category]
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const path = new URL(request.url()).pathname
    const method = request.method()
    let data: unknown = null
    if (path.endsWith('/auth/refresh')) data = { accessToken: 'access', tokenType: 'Bearer', user }
    else if (path.endsWith('/admin/listings') && method === 'GET') data = pageOf(moderation)
    else if (path.endsWith('/approve')) {
      const id = Number(path.split('/').at(-2))
      moderation = moderation.filter((item) => item.id !== id)
      data = { ...pending(id), status: 'ACTIVE' }
    } else if (path.endsWith('/reject')) {
      const id = Number(path.split('/').at(-2))
      moderation = moderation.filter((item) => item.id !== id)
      data = { ...pending(id), status: 'REJECTED', rejectionReason: request.postDataJSON().reason }
    } else if (path.endsWith('/admin/users') && method === 'GET')
      data = pageOf([{ ...seller, status: userStatus }])
    else if (path.endsWith('/ban')) {
      userStatus = 'BANNED'
      data = { ...seller, status: userStatus }
    } else if (path.endsWith('/unban')) {
      userStatus = 'ACTIVE'
      data = { ...seller, status: userStatus }
    } else if (path.endsWith('/admin/categories') && method === 'GET') data = pageOf(categories)
    else if (path.endsWith('/admin/categories') && method === 'POST') {
      const created = { id: 99, ...request.postDataJSON() }
      categories.push(created)
      data = created
    } else if (path.endsWith('/admin/projects')) data = pageOf([])
    else if (path.includes('/admin/locations/')) data = pageOf([])
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data, message: 'OK', errorCode: null }),
    })
  })
}

test('ADMIN moderates, bans/unbans and creates master data', async ({ page }) => {
  await mockAdmin(page)
  await page.goto('/admin/listings')
  await page.getByRole('button', { name: 'Duyệt' }).first().click()
  await expect(page.getByText('Đã duyệt tin đăng')).toBeVisible()
  await page.getByRole('button', { name: 'Từ chối' }).first().click()
  await page.getByLabel(/Lý do từ chối/).fill('Thiếu thông tin pháp lý')
  await page.getByRole('button', { name: 'Xác nhận từ chối' }).click()
  await expect(page.getByText('Đã từ chối tin đăng')).toBeVisible()
  await page.goto('/admin/users')
  await page.getByRole('button', { name: 'Khóa' }).click()
  await page.getByLabel(/Lý do khóa/).fill('Vi phạm quy định')
  await page.getByRole('button', { name: 'Xác nhận khóa' }).click()
  await expect(page.getByText('Đã khóa tài khoản')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mở khóa' })).toBeVisible()
  await page.getByRole('button', { name: 'Mở khóa' }).click()
  await page.goto('/admin/categories')
  await page.getByRole('button', { name: 'Thêm danh mục' }).click()
  await page.getByLabel(/Tên danh mục/).fill('Đất nền')
  await page.getByLabel(/Slug/).fill('dat-nen')
  await page.getByRole('button', { name: 'Lưu' }).click()
  await expect(page.getByText('Đã lưu danh mục')).toBeVisible()
  await expect(page.getByText('Đất nền')).toBeVisible()
})

test('non-admin receives an explicit access-denied page', async ({ page }) => {
  await mockAdmin(page, { id: 1, name: 'Người dùng', email: 'user@homigo.vn', role: 'USER' })
  await page.goto('/admin')
  await expect(page).toHaveURL(/access-denied/)
  await expect(page.getByRole('heading', { name: 'Không có quyền truy cập' })).toBeVisible()
})
