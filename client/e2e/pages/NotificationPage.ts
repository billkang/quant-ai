import type { Page } from '@playwright/test'
import { expect } from '../fixtures/base.fixture'
import { BasePage } from './BasePage'

export class NotificationPage extends BasePage {
  async expectBadgeCount(count: number) {
    const badge = this.page.locator('.ant-badge-count')
    if (count === 0) {
      await expect(badge).not.toBeVisible()
    } else {
      await expect(badge).toHaveText(String(count))
    }
  }

  async openPanel() {
    await this.page.getByTestId('nav-alerts').click()
  }

  async markAllAsRead() {
    const buttons = this.page.getByRole('button', { name: '标记已读' })
    const count = await buttons.count()
    for (let i = 0; i < count; i++) {
      await buttons.nth(i).click()
      await this.page.waitForTimeout(200)
    }
  }

  async expectNotificationRead() {
    await expect(this.page.locator('.ant-badge-count')).not.toBeVisible()
  }

  async expectOnNotifications() {
    await expect(this.page.getByRole('heading', { name: '告警中心' })).toBeVisible()
  }
}
