import { test, expect } from './fixtures/base.fixture'
import { ScreenerPage } from './pages/ScreenerPage'

test.describe('Stock Screener', () => {
  test('screener page loads with filters', async ({ page }) => {
    const screener = new ScreenerPage(page)
    await screener.goto('/screener')
    await screener.waitForLoad()

    await screener.expectOnScreener()
    await expect(page.getByText('筛选条件')).toBeVisible()
    await expect(page.getByRole('button', { name: '开始筛选' })).toBeVisible()
  })

  test('apply filters and view results', async ({ page }) => {
    const screener = new ScreenerPage(page)
    await screener.goto('/screener')
    await screener.selectFilter({ field: 'PE(TTM)', operator: '<', value: 50 })
    await screener.clickSearch()

    // Wait for results or empty state
    await page.waitForSelector('.ant-table-row, .ant-empty', { timeout: 15000 })
  })
})
