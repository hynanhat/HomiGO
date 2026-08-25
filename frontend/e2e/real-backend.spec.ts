import { expect, test } from '@playwright/test'

const enabled = process.env.HOMIGO_REAL_BACKEND === '1'
const sellerEmail = process.env.HOMIGO_TEST_SELLER ?? ''
const adminEmail = process.env.HOMIGO_TEST_ADMIN ?? ''
const password = process.env.HOMIGO_TEST_PASSWORD ?? ''

test.skip(!enabled, 'Chỉ chạy khi backend và MySQL local đã sẵn sàng.')

async function login(page: import('@playwright/test').Page, email: string) {
  await page.goto('/auth/login')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Mật khẩu').fill(password)
  await page.getByRole('button', { name: 'Đăng nhập' }).click()
  await expect(page).toHaveURL(/\/$/)
}

test('guest can search and open a real active listing', async ({ page }) => {
  await page.goto('/listings')
  await expect(page.getByRole('link', { name: 'Căn hộ tốt nghiệp 102529', exact: true })).toBeVisible()
  await page.getByRole('link', { name: 'Căn hộ tốt nghiệp 102529', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Căn hộ tốt nghiệp 102529' })).toBeVisible()
  await expect(page).toHaveURL(/\/listings\/HMG-/)
})

test('account and seller can use the authenticated workspace', async ({ page }) => {
  await login(page, sellerEmail)
  await page.goto('/account/profile')
  await expect(page.getByLabel('Họ và tên')).toHaveValue('Seller Demo')
  await page.goto('/saved-listings')
  await expect(page.getByText('Căn hộ tốt nghiệp 102529')).toBeVisible()
  await page.goto('/seller/listings')
  await expect(page.getByRole('heading', { name: 'Tin đăng của tôi' })).toBeVisible()
  await expect(page.getByText('Căn hộ tốt nghiệp 102529')).toBeVisible()
})

test('admin can open the real operations workspace', async ({ page }) => {
  await login(page, adminEmail)
  await page.goto('/admin')
  await expect(page.getByRole('heading', { name: 'Tổng quan vận hành' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Người dùng', exact: true })).toBeVisible()
  await page.goto('/admin/categories')
  await expect(page.getByText('Căn hộ Demo 102529')).toBeVisible()
})
