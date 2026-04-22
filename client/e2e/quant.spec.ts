import { test, expect } from './fixtures/base.fixture'
import { QuantPage } from './pages/QuantPage'

test.describe('Quantitative Analysis', () => {
  test('quant page loads indicators', async ({ page }) => {
    const quant = new QuantPage(page)
    await quant.goto('/backtest')
    await quant.waitForLoad()

    await quant.expectOnQuant()
    await expect(page.getByText('回测配置')).toBeVisible()
  })

  test('run strategy backtest', async ({ page }) => {
    const quant = new QuantPage(page)
    await quant.goto('/backtest')

    await quant.runBacktest({
      stockCode: '600519',
      strategy: 'MA交叉',
      initialCash: 100000,
    })

    // Wait for results to appear
    await expect(page.getByText('总收益').first()).toBeVisible({ timeout: 20000 })
  })
})
