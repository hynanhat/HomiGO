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
const detailFor = (item: ReturnType<typeof pending>) => ({
  listing: {
    id: item.id,
    publicCode: item.publicCode,
    userId: seller.id,
    version: item.version,
    title: item.title,
    description: 'Nhà phố hai tầng, có ban công, pháp lý rõ ràng và đầy đủ thông tin liên hệ.',
    categoryName: category.name,
    categoryId: category.id,
    transactionType: category.transactionType,
    projectName: null,
    projectId: null,
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
    floors: 2,
    contactName: seller.name,
    contactPhone: seller.phone,
    status: item.status,
    images: ['/fixtures/moderation-front.webp', '/fixtures/moderation-room.webp'],
    imageIds: [901, 902],
    createdAt: item.createdAt,
    updatedAt: item.createdAt,
    publishedAt: item.status === 'ACTIVE' ? '2026-08-16T08:00:00' : null,
    expiresAt: null,
  },
  seller,
  history: [
    {
      id: 1,
      fromStatus: 'DRAFT',
      toStatus: 'PENDING',
      reason: null,
      changedById: seller.id,
      changedAt: item.createdAt,
    },
  ],
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
    else if (path.endsWith('/admin/listings') && method === 'GET') {
      const status = new URL(request.url()).searchParams.get('status')
      data = pageOf(moderation.filter((item) => !status || item.status === status))
    } else if (/\/admin\/listings\/\d+$/.test(path) && method === 'GET') {
      const id = Number(path.split('/').at(-1))
      data = detailFor(moderation.find((item) => item.id === id) ?? pending(id))
    } else if (path.endsWith('/approve')) {
      const id = Number(path.split('/').at(-2))
      moderation = moderation.map((item) =>
        item.id === id ? { ...item, status: 'ACTIVE', version: item.version + 1 } : item,
      )
      data = moderation.find((item) => item.id === id)
    } else if (path.endsWith('/reject')) {
      const id = Number(path.split('/').at(-2))
      moderation = moderation.map((item) =>
        item.id === id ? { ...item, status: 'REJECTED', version: item.version + 1 } : item,
      )
      data = moderation.find((item) => item.id === id)
    } else if (path.endsWith('/remove')) {
      const id = Number(path.split('/').at(-2))
      moderation = moderation.map((item) =>
        item.id === id ? { ...item, status: 'REMOVED', version: item.version + 1 } : item,
      )
      data = moderation.find((item) => item.id === id)
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
  await page.getByRole('link', { name: 'Xem chi tiết' }).first().click()
  await expect(page.getByText(/Nhà phố hai tầng, có ban công/)).toBeVisible()
  await page.getByRole('button', { name: 'Duyệt tin' }).click()
  await expect(page.getByText('Đã duyệt tin đăng')).toBeVisible()
  await page.getByRole('button', { name: 'Gỡ khỏi công khai' }).click()
  await page.getByLabel(/Lý do gỡ tin/).fill('Thông tin đã được xác minh là không còn hợp lệ')
  await page.getByRole('button', { name: 'Xác nhận gỡ tin' }).click()
  await expect(page.getByText('Đã gỡ tin khỏi công khai')).toBeVisible()
  await page.getByRole('link', { name: 'Trở lại hàng đợi' }).click()
  await page.locator('a[href="/admin/listings/402"]').click()
  await page.getByRole('button', { name: 'Từ chối' }).click()
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
