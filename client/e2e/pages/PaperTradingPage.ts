import type { Page } from '@playwright/test'
import { expect } from '../fixtures/base.fixture'
import { BasePage } from './BasePage'

export class PaperTradingPage extends BasePage {
  async expectOnPaperTrading() {
    await expect(this.page.getByRole('heading', { name: '虚拟盘' })).toBeVisible()
  }

  async clickOrderButton() {
    await this.page.getByRole('button', { name: '下单' }).click()
  }

  async fillOrderForm(data: { stock_code: string; stock_name: string; side: string; quantity: string }) {
    await this.page.locator('.ant-modal').getByPlaceholder('如 600519').fill(data.stock_code)
    await this.page.locator('.ant-modal').getByPlaceholder('如 贵州茅台').fill(data.stock_name)
    await this.page.locator('.ant-modal').getByRole('combobox').click()
    await this.page.getByTitle(data.side === 'buy' ? '买入' : '卖出').click()
    await this.page.locator('.ant-modal').getByRole('spinbutton').fill(data.quantity)
  }

  async submitOrder() {
    await this.page.locator('.ant-modal').getByRole('button', { name: 'OK' }).click()
  }

  async expectOrderInTable(stockCode: string) {
    await expect(this.page.getByRole('cell', { name: stockCode })).toBeVisible()
  }

  async clickResetAccount() {
    await this.page.getByRole('button', { name: '重置账户' }).click()
    await this.page.getByRole('button', { name: '确认' }).click()
  }
}
