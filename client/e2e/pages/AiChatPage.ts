import type { Page } from '@playwright/test'
import { expect } from '../fixtures/base.fixture'
import { BasePage } from './BasePage'

export class AiChatPage extends BasePage {
  async sendMessage(text: string) {
    await this.page.getByTestId('ai-stock-select').click()
    await this.page.getByText(text, { exact: false }).first().click()
    await this.page.getByTestId('ai-analyze-btn').click()
  }

  async expectUserMessage(text: string) {
    await expect(this.page.getByText(text).first()).toBeVisible()
  }

  async expectAiResponse() {
    await expect(this.page.getByText('诊断结果')).toBeVisible({ timeout: 30000 })
  }

  async expectOnAiChat() {
    await expect(this.page.getByRole('heading', { name: 'AI 智能诊断' })).toBeVisible()
  }
}
