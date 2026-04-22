import type { Page } from '@playwright/test'
import { expect } from '../fixtures/base.fixture'

export class BasePage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  async goto(path: string) {
    await this.page.goto(path)
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle')
  }

  async expectUrl(path: string) {
    await expect(this.page).toHaveURL(new RegExp(`${path.replace(/\//g, '\\/')}$`))
  }

  async screenshot(name: string) {
    await this.page.screenshot({ path: `./e2e/screenshots/${name}.png`, fullPage: true })
  }
}
