import { expect, test } from '@playwright/test'

test('supports a complete customer help flow at 320px', async ({ page }) => {
  await page.goto('/auth/login')

  const launcher = page.getByRole('button', { name: 'Mở hỗ trợ khách hàng' })
  await expect(launcher).toBeVisible()
  await launcher.click()

  const dialog = page.getByRole('dialog', { name: 'Hỗ trợ khách hàng' })
  const question = page.getByRole('textbox', { name: 'Câu hỏi của bạn' })
  await expect(dialog).toBeVisible()
  await expect(question).toBeFocused()

  const bounds = await dialog.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds?.x ?? -1).toBeGreaterThanOrEqual(0)
  expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(320)

  await question.fill('toi muon dang tin')
  await question.press('Enter')
  await expect(dialog.getByText(/Để đăng tin, bạn cần đăng nhập/)).toBeVisible()

  const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
  expect(documentWidth).toBeLessThanOrEqual(320)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
  await expect(launcher).toBeFocused()
})
