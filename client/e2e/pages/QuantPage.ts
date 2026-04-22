import type { Page } from '@playwright/test'
import { expect } from '../fixtures/base.fixture'
import { BasePage } from './BasePage'

export class QuantPage extends BasePage {
  async selectStock(symbol: string) {
    await this.page.getByTestId('backtest-config-card').getByPlaceholder('如：600519').fill(symbol)
  }

  async selectIndicator(name: string) {
    await this.page.getByTestId('backtest-config-card').locator('.ant-select').first().click()
    await this.page.getByTitle(name, { exact: false }).locator('div').click()
  }

  async clickAnalyze() {
    await this.page.getByTestId('backtest-run-btn').click()
  }

  async expectChartRendered() {
    await expect(this.page.locator('canvas').first()).toBeVisible({ timeout: 15000 })
  }

  async runBacktest(params: { stockCode: string; strategy: string; initialCash: number }) {
    await this.page
      .getByTestId('backtest-config-card')
      .getByPlaceholder('如：600519')
      .fill(params.stockCode)
    await this.page.getByTestId('backtest-config-card').locator('.ant-select').first().click()
    await this.page.getByTitle(params.strategy, { exact: false }).locator('div').click()
    await this.page
      .getByTestId('backtest-config-card')
      .getByRole('textbox')
      .nth(2)
      .fill(String(params.initialCash))
    await this.page.getByTestId('backtest-run-btn').click()
  }

  async expectOnQuant() {
    await expect(this.page.getByRole('heading', { name: '策略回测' })).toBeVisible()
  }
}
