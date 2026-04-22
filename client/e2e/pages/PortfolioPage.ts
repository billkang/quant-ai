import type { Page } from '@playwright/test'
import { expect } from '../fixtures/base.fixture'
import { BasePage } from './BasePage'

export class PortfolioPage extends BasePage {
  async expectSummaryVisible() {
    await expect(this.page.getByText('持仓市值')).toBeVisible()
    await expect(this.page.getByText('持仓盈亏')).toBeVisible()
    await expect(this.page.getByText('盈亏比例')).toBeVisible()
  }

  async addHolding(symbol: string, quantity: number, price: number) {
    await this.page.getByTestId('portfolio-add-btn').click()
    await this.page.getByTestId('portfolio-modal-stock-code').fill(symbol)
    await this.page.getByTestId('portfolio-modal-quantity').fill(String(quantity))
    await this.page.getByTestId('portfolio-modal-price').fill(String(price))
    await this.page.getByRole('button', { name: '保存' }).click()
  }

  async expectHoldingInList(symbol: string) {
    await expect(this.page.getByText(symbol).first()).toBeVisible()
  }

  async expectOnPortfolio() {
    await expect(this.page.getByRole('heading', { name: '持仓管理' })).toBeVisible()
  }
}
