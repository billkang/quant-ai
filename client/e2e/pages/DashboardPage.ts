import type { Page } from '@playwright/test'
import { expect } from '../fixtures/base.fixture'
import { BasePage } from './BasePage'

export class DashboardPage extends BasePage {
  async expectWidgetsVisible() {
    await expect(this.page.getByText('自选股数量')).toBeVisible()
    await expect(this.page.getByText('平均涨跌幅')).toBeVisible()
    await expect(this.page.getByText('上涨家数')).toBeVisible()
    await expect(this.page.getByText('下跌家数')).toBeVisible()
  }

  async clickNavItem(name: string) {
    await this.page.getByTestId(`nav-${name}`).click()
  }

  async getWatchlistSummary() {
    return this.page.getByTestId('dashboard-watchlist-table').locator('.ant-table-row').count()
  }

  async expectOnDashboard() {
    await expect(this.page.getByRole('heading', { name: '首页' })).toBeVisible()
  }
}
