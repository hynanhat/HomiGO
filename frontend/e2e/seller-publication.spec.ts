import { expect, test, type Page } from '@playwright/test'

const user = { id: 1, name: 'Nguyễn Minh An', email: 'an@homigo.vn', role: 'USER' }
let status = 'DRAFT'
let paid = false
const paymentOrderCode = 'HMG-SEPAY-E2E001'
const baseListing = { id: 501, publicCode: 'HMG-2026-000501', userId: 1, categoryId: 11, categoryName: 'Căn hộ', districtId: 32, districtName: 'Thành phố Thủ Đức', provinceName: 'TP. Hồ Chí Minh', wardId: 41, wardName: 'Phường Thảo Điền', title: 'Căn hộ mới đăng', description: 'Mô tả đầy đủ cho căn hộ.', price: 5000000000, area: 80, address: '12 Nguyễn Văn Hưởng', bedrooms: 2, bathrooms: 2, contactName: 'Nguyễn Minh An', contactPhone: '0901234567', status: 'DRAFT', images: [], createdAt: '2026-08-17T08:00:00', updatedAt: '2026-08-17T08:00:00', version: 0 }
const pageOf = (content: unknown[]) => ({ content, number: 0, size: 20, totalElements: content.length, totalPages: content.length ? 1 : 0, numberOfElements: content.length, first: true, last: true, empty: !content.length })
async function mockSellerApi(page: Page) {
  paid = false
  await page.route('https://pay-sandbox.sepay.vn/**', async (route) => {
    await route.fulfill({ status: 302, headers: { location: `http://127.0.0.1:4173/seller/upgrade?payment=success&orderCode=${paymentOrderCode}` } })
  })
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request(); const path = new URL(request.url()).pathname; const method = request.method(); let data: unknown = null
    if (path.endsWith('/auth/refresh')) data = { accessToken: 'access', tokenType: 'Bearer', user: { ...user, role: paid ? 'SELLER' : 'USER' } }
    else if (path.endsWith('/users/me')) data = { ...user, role: paid ? 'SELLER' : 'USER', phone: '', status: 'ACTIVE', createdAt: '2026-08-01T00:00:00' }
    else if (path.endsWith('/payments/sepay/seller-upgrade/offer')) data = { amount: 99000, currency: 'VND', provider: 'SEPAY', environment: 'sandbox', configured: true }
    else if (path.endsWith('/payments/sepay/seller-upgrade') && method === 'POST') data = {
      payment: payment(false), checkoutUrl: 'https://pay-sandbox.sepay.vn/v1/checkout/init', method: 'POST',
      fields: { merchant: 'SP-TEST-E2E', operation: 'PURCHASE', payment_method: 'BANK_TRANSFER', order_invoice_number: paymentOrderCode, order_amount: '99000', currency: 'VND', signature: 'e2e-signature' },
    }
    else if (path.endsWith(`/payments/sepay/seller-upgrade/${paymentOrderCode}`)) { paid = true; data = payment(true) }
    else if (path.endsWith('/payments/sepay/seller-upgrade')) data = pageOf([payment(paid)])
    else if (path.endsWith('/categories')) data = pageOf([{ id: 11, name: 'Căn hộ', slug: 'can-ho', transactionType: 'BUY' }])
    else if (path.endsWith('/locations/provinces')) data = pageOf([{ id: 21, name: 'TP. Hồ Chí Minh' }])
    else if (path.includes('/provinces/21/districts')) data = pageOf([{ id: 32, provinceId: 21, name: 'Thành phố Thủ Đức' }])
    else if (path.includes('/districts/32/wards')) data = pageOf([{ id: 41, districtId: 32, name: 'Phường Thảo Điền', code: 'THAO-DIEN' }])
    else if (path.endsWith('/projects')) data = pageOf([])
    else if (path.endsWith('/seller/listings') && method === 'POST') { status = 'DRAFT'; data = { ...baseListing, ...request.postDataJSON(), status } }
    else if (path.endsWith('/seller/listings')) data = pageOf([{ ...baseListing, status }])
    else if (/\/seller\/listings\/501\/images$/.test(path)) data = `/uploads/${Date.now()}.webp`
    else if (path.endsWith('/seller/listings/501/submit')) { status = 'PENDING'; data = { ...baseListing, status } }
    else if (path.endsWith('/seller/listings/501')) data = { ...baseListing, status }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data, message: 'OK', errorCode: null }) })
  })
}

function payment(success: boolean) {
  return {
    id: 801, orderCode: paymentOrderCode, purpose: 'SELLER_UPGRADE', amount: 99000, currency: 'VND', status: success ? 'SUCCESS' : 'PENDING',
    providerOrderId: success ? 'sepay-order-e2e' : null, providerTransactionId: success ? 'sepay-transaction-e2e' : null, failureReason: null,
    expiresAt: '2026-08-17T12:15:00', completedAt: success ? '2026-08-17T12:01:00' : null, createdAt: '2026-08-17T12:00:00', updatedAt: '2026-08-17T12:01:00',
  }
}

test('USER pays through SePay, creates DRAFT, uploads two images and submits PENDING', async ({ page }) => {
  await mockSellerApi(page)
  await page.goto('/seller/upgrade')
  await page.getByRole('button', { name: 'Thanh toán qua SePay Sandbox' }).click()
  await expect(page.getByRole('heading', { name: 'Thanh toán đã được xác nhận' })).toBeVisible()
  await expect(page.getByText('Tài khoản của bạn đã có quyền người bán.')).toBeVisible()
  await page.getByRole('link', { name: 'Đi tới trang người bán' }).click()
  await page.getByRole('button', { name: 'Tạo tin mới' }).click()
  await page.getByLabel(/Danh mục/).selectOption('11')
  await page.getByLabel('Tỉnh / thành phố').selectOption('21')
  await page.getByLabel(/Quận \/ huyện/).selectOption('32')
  await page.getByLabel(/Tiêu đề/).fill(baseListing.title)
  await page.getByLabel(/Mô tả chi tiết/).fill(baseListing.description)
  await page.getByLabel(/Giá/).fill(String(baseListing.price))
  await page.getByLabel(/Diện tích/).fill(String(baseListing.area))
  await page.getByLabel(/^Địa chỉ/).fill(baseListing.address)
  await page.getByLabel(/Người liên hệ/).fill(baseListing.contactName)
  await page.getByLabel(/Số điện thoại liên hệ/).fill(baseListing.contactPhone)
  await page.getByRole('button', { name: 'Lưu bản nháp' }).click()
  await expect(page).toHaveURL(/seller\/listings\/501$/)
  await page.locator('input[type="file"]').setInputFiles([{ name: 'one.webp', mimeType: 'image/webp', buffer: Buffer.from('one') }, { name: 'two.png', mimeType: 'image/png', buffer: Buffer.from('two') }])
  await page.getByRole('button', { name: /Tải ảnh/ }).click()
  await expect(page.getByText('Đã tải')).toHaveCount(2)
  await page.getByRole('button', { name: 'Gửi duyệt' }).click()
  await page.getByRole('dialog').getByRole('button', { name: 'Xác nhận' }).click()
  await expect(page.getByText('Chờ duyệt', { exact: true })).toBeVisible()
})
