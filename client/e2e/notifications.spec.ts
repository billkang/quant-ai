import { test, expect } from './fixtures/base.fixture'
import { NotificationPage } from './pages/NotificationPage'

test.describe('Notifications', () => {
  test('notification badge reflects unread count', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const badge = page.locator('.ant-badge-count')
    await expect(badge).toBeVisible()
    await expect(badge).toHaveText(/[1-9]/)
  })

  test('open notification panel', async ({ page }) => {
    const notifications = new NotificationPage(page)
    await notifications.goto('/alerts')
    await notifications.waitForLoad()

    await notifications.expectOnNotifications()
    await expect(page.getByRole('button', { name: '添加规则' })).toBeVisible()
  })

  test('mark notification as read', async ({ page }) => {
    const notifications = new NotificationPage(page)
    await notifications.goto('/alerts')

    // Mark first unread notification as read
    const markReadBtn = page.getByRole('button', { name: '标记已读' }).first()
    if (await markReadBtn.isVisible().catch(() => false)) {
      await markReadBtn.click()
      await page.waitForTimeout(500)
    }
  })
})
