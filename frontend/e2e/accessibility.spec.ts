import { expect, test, type Page } from '@playwright/test'

const emptyPage = {
  content: [],
  number: 0,
  size: 12,
  totalElements: 0,
  totalPages: 0,
  numberOfElements: 0,
  first: true,
  last: true,
  empty: true,
}
async function mockEmpty(page: Page) {
  await page.route('**/api/v1/**', (route) => {
    const anonymous = new URL(route.request().url()).pathname.endsWith('/auth/refresh')
    return route.fulfill({
      status: anonymous ? 401 : 200,
      contentType: 'application/json',
      body: JSON.stringify(
        anonymous
          ? { success: false, data: null, message: 'Anonymous', errorCode: 'UNAUTHORIZED' }
          : { success: true, data: emptyPage, message: 'OK', errorCode: null },
      ),
    })
  })
}
test('keyboard order, focus return, headings, labels and errors are accessible', async ({
  page,
}) => {
  await mockEmpty(page)
  await page.goto('/auth/register')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tạo tài khoản')
  await page.locator('.skip-link').focus()
  await expect(page.locator('.skip-link')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('link', { name: 'HomiGO' })).toBeFocused()
  await expect(page.getByLabel(/Email/)).toBeVisible()
  await page.getByRole('button', { name: 'Đăng ký' }).click()
  await expect(page.getByRole('alert').first()).toBeVisible()
  await page.goto('/listings')
  if (page.viewportSize()!.width < 1024) {
    const trigger = page.getByRole('button', { name: 'Bộ lọc' })
    await trigger.click()
    await expect(page.getByRole('button', { name: 'Đóng bộ lọc' })).toBeFocused()
    await page.keyboard.press('Escape')
    await expect(trigger).toBeFocused()
  }
})
