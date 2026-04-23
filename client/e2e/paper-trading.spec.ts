import { test, expect } from './fixtures/base.fixture'
import { PaperTradingPage } from './pages/PaperTradingPage'

test.describe('Paper Trading', () => {
  test('paper trading page loads with account info', async ({ page }) => {
    const paper = new PaperTradingPage(page)
    await paper.goto('/paper-trading')
    await paper.waitForLoad()

    await paper.expectOnPaperTrading()
    await expect(page.getByText('初始资金')).toBeVisible()
    await expect(page.getByText('可用资金')).toBeVisible()
  })

  test('buy order and verify in orders table', async ({ page }) => {
    const paper = new PaperTradingPage(page)
    await paper.goto('/paper-trading')
    await paper.waitForLoad()

    await paper.clickOrderButton()
    await paper.fillOrderForm({
      stock_code: '600519',
      stock_name: '贵州茅台',
      side: 'buy',
      quantity: '100',
    })
    await paper.submitOrder()

    await expect(page.getByText('下单成功')).toBeVisible()
    await paper.expectOrderInTable('600519')
  })

  test('reset account clears positions', async ({ page }) => {
    const paper = new PaperTradingPage(page)
    await paper.goto('/paper-trading')
    await paper.waitForLoad()

    await paper.clickResetAccount()
    await expect(page.getByText('账户已重置')).toBeVisible()
  })
})
