import { expect, test, type Page } from '@playwright/test'

const pageOf = (content: unknown[]) => ({ content, number: 0, size: 12, totalElements: content.length, totalPages: content.length ? 1 : 0, numberOfElements: content.length, first: true, last: true, empty: !content.length })
async function mockEmpty(page: Page) {
  await page.route('**/api/v1/**', (route) => {
    const anonymous = new URL(route.request().url()).pathname.endsWith('/auth/refresh')
    return route.fulfill({
      status: anonymous ? 401 : 200,
      contentType: 'application/json',
      body: JSON.stringify(anonymous
        ? { success: false, data: null, message: 'Anonymous', errorCode: 'UNAUTHORIZED' }
        : { success: true, data: pageOf([]), message: 'OK', errorCode: null }),
    })
  })
}
test('layout has no horizontal overflow and mobile controls remain usable', async ({ page }) => {
  await mockEmpty(page); await page.goto('/listings'); const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); expect(overflow).toBeLessThanOrEqual(1)
  if (page.viewportSize()!.width < 768) { await page.getByRole('button', { name: 'Mở menu' }).click(); await expect(page.getByRole('navigation', { name: 'Điều hướng di động' })).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('navigation', { name: 'Điều hướng di động' })).toBeHidden() }
  if (page.viewportSize()!.width < 1024) { await page.getByRole('button', { name: 'Bộ lọc' }).click(); await expect(page.getByRole('dialog', { name: 'Bộ lọc tìm kiếm' })).toBeVisible(); await page.keyboard.press('Escape'); await expect(page.getByRole('dialog')).toBeHidden() }
})
