import type { Page } from '@playwright/test'
import { BasePage } from './BasePage'

export class LoginPage extends BasePage {
  async fillCredentials(username: string, password: string) {
    await this.page.getByTestId('login-username').fill(username)
    await this.page.getByTestId('login-password').fill(password)
  }

  async fillRegisterInfo(username: string, email: string, password: string) {
    await this.page.getByTestId('auth-tabs').getByText('注册').click()
    await this.page.getByTestId('register-username').fill(username)
    await this.page.getByTestId('register-email').fill(email)
    await this.page.getByTestId('register-password').fill(password)
  }

  async submit() {
    const activeTab = await this.page
      .getByTestId('auth-tabs')
      .locator('.ant-tabs-tab-active')
      .textContent()
    if (activeTab?.includes('注册')) {
      await this.page.getByTestId('register-submit').click()
    } else {
      await this.page.getByTestId('login-submit').click()
    }
  }

  async expectErrorMessage() {
    await this.page.waitForSelector('.ant-message-notice-error', { timeout: 5000 })
  }

  async switchToRegisterTab() {
    await this.page.getByTestId('auth-tabs').getByText('注册').click()
  }
}
