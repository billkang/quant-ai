import type { Page } from '@playwright/test'
import { expect } from '../fixtures/base.fixture'
import { BasePage } from './BasePage'

export class ScreenerPage extends BasePage {
  async selectFilter(criteria: { field: string; operator: string; value: number }) {
    await this.page.getByTestId('screener-filters').locator('.ant-select').nth(0).click()
    await this.page.getByTitle(criteria.field, { exact: false }).locator('div').click()
    await this.page.getByTestId('screener-filters').locator('.ant-select').nth(1).click()
    await this.page.getByTitle(criteria.operator, { exact: true }).locator('div').click()
    await this.page
      .getByTestId('screener-filters')
      .locator('.ant-input-number-input')
      .fill(String(criteria.value))
  }

  async clickSearch() {
    await this.page.getByTestId('screener-search-btn').click()
  }

  async expectResultsVisible() {
    await expect(
      this.page.getByTestId('screener-results-table').locator('.ant-table-row').first()
    ).toBeVisible({ timeout: 10000 })
  }

  async clickStockSymbol(symbol: string) {
    await this.page.getByRole('cell', { name: symbol }).click()
  }

  async expectOnScreener() {
    await expect(this.page.getByRole('heading', { name: '智能选股' })).toBeVisible()
  }
}
