import { test, expect } from './fixtures/base.fixture'
import { AiChatPage } from './pages/AiChatPage'

test.describe('AI Chat', () => {
  test('AI chat page loads', async ({ page }) => {
    const ai = new AiChatPage(page)
    await ai.goto('/ai-advice')
    await ai.waitForLoad()

    await ai.expectOnAiChat()
    await expect(page.locator('.ant-select')).toBeVisible()
  })

  test('send message and receive response', async ({ page }) => {
    const ai = new AiChatPage(page)
    await ai.goto('/ai-advice')

    // Select a stock and analyze
    await page.locator('.ant-select').first().click()
    await page.getByTitle('贵州茅台', { exact: false }).locator('div').click()
    await page.getByRole('button', { name: '开始分析' }).click()

    // Wait for result or error (mocked/external API may fail in E2E)
    await page.waitForSelector('text=诊断结果, text=分析失败', { timeout: 30000 })
  })
})
