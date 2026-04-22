import { test } from './fixtures/base.fixture'
import { PortfolioPage } from './pages/PortfolioPage'

test.describe('Portfolio', () => {
  test('portfolio overview displays', async ({ page }) => {
    const portfolio = new PortfolioPage(page)
    await portfolio.goto('/portfolio')
    await portfolio.waitForLoad()

    await portfolio.expectOnPortfolio()
    await portfolio.expectSummaryVisible()
  })

  test('add stock to portfolio', async ({ page }) => {
    const portfolio = new PortfolioPage(page)
    await portfolio.goto('/portfolio')

    await portfolio.addHolding('000001', 1000, 10.5)
    await portfolio.expectHoldingInList('000001')
  })
})
