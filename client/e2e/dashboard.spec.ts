import { test, expect } from './fixtures/base.fixture'
import { DashboardPage } from './pages/DashboardPage'

test.describe('Dashboard', () => {
  test('dashboard loads after login', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.goto('/')
    await dashboard.waitForLoad()

    await dashboard.expectOnDashboard()
    await dashboard.expectWidgetsVisible()
  })

  test('navigation menu routes to all core pages', async ({ page }) => {
    const dashboard = new DashboardPage(page)
    await dashboard.goto('/')

    const routes = [
      { name: '选股', path: '/screener' },
      { name: '持仓', path: '/portfolio' },
      { name: '回测', path: '/backtest' },
      { name: 'AI诊断', path: '/ai-advice' },
      { name: '资讯', path: '/news' },
    ]

    for (const route of routes) {
      await dashboard.clickNavItem(route.name)
      await expect(page).toHaveURL(new RegExp(`${route.path.replace(/\//g, '\\/')}$`))
      // Navigate back to dashboard for next iteration
      await dashboard.goto('/')
    }
  })
})
