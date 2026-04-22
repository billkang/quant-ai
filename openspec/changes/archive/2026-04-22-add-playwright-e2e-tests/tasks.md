## 1. Playwright Framework Setup

- [x] 1.1 Install `@playwright/test` as a devDependency in `client/package.json`
- [x] 1.2 Create `client/playwright.config.ts` with base URL `http://localhost:4000`, Chromium project, screenshot-on-failure, video-on-failure, and trace-on-first-retry
- [x] 1.3 Add `test:e2e` and `test:e2e:ui` scripts to `client/package.json`
- [x] 1.4 Update `client/.gitignore` to exclude `test-results/`, `playwright-report/`, and `playwright/.cache/`
- [x] 1.5 Verify Playwright installs correctly by running `pnpm exec playwright install chromium` locally

## 2. Test Infrastructure & Fixtures

- [x] 2.1 Create `client/e2e/fixtures/base.fixture.ts` exporting a `test` fixture that provides `page`, `request`, and a seeded `authState` storage
- [x] 2.2 Implement backend seed API in `server/src/api/seed.py` (or reuse e2e fixture logic) providing endpoints to create test user, watchlist, portfolio holdings, and notifications; gate behind `E2E_SEED_ENABLED=true`
- [x] 2.3 Implement cleanup endpoint or database transaction rollback mechanism to tear down seeded data after tests
- [x] 2.4 Create `client/e2e/utils/auth.ts` helper to perform seed + login via API and save storage state to `client/e2e/.auth/user.json`
- [x] 2.5 Configure `playwright.config.ts` `globalSetup` to seed a default test user before the test suite runs

## 3. Page Object Models

- [x] 3.1 Create `client/e2e/pages/BasePage.ts` with common methods: `goto(path)`, `waitForLoad()`, `expectUrl(path)`, `screenshot(name)`
- [x] 3.2 Create `client/e2e/pages/LoginPage.ts` with methods: `fillCredentials(email, password)`, `submit()`, `expectErrorMessage()`
- [x] 3.3 Create `client/e2e/pages/DashboardPage.ts` with methods: `expectWidgetsVisible()`, `clickNavItem(name)`, `getWatchlistSummary()`
- [x] 3.4 Create `client/e2e/pages/ScreenerPage.ts` with methods: `selectFilter(criteria)`, `clickSearch()`, `expectResultsVisible()`, `clickStockSymbol(symbol)`
- [x] 3.5 Create `client/e2e/pages/PortfolioPage.ts` with methods: `expectSummaryVisible()`, `addHolding(symbol, quantity, price)`, `expectHoldingInList(symbol)`
- [x] 3.6 Create `client/e2e/pages/QuantPage.ts` with methods: `selectStock(symbol)`, `selectIndicator(name)`, `clickAnalyze()`, `expectChartRendered()`, `runBacktest(params)`
- [x] 3.7 Create `client/e2e/pages/AiChatPage.ts` with methods: `sendMessage(text)`, `expectUserMessage(text)`, `expectAiResponse()`
- [x] 3.8 Create `client/e2e/pages/NotificationPage.ts` with methods: `expectBadgeCount(count)`, `openPanel()`, `markAllAsRead()`, `expectNotificationRead()`

## 4. Core User Journey Tests

- [x] 4.1 Write `client/e2e/auth.spec.ts` covering: successful registration, successful login, logout, and protected route redirect
- [x] 4.2 Write `client/e2e/dashboard.spec.ts` covering: dashboard loads after login, navigation menu routes to all core pages
- [x] 4.3 Write `client/e2e/screener.spec.ts` covering: page loads with filters, apply filters and view results, navigate to stock detail
- [x] 4.4 Write `client/e2e/portfolio.spec.ts` covering: portfolio overview displays, add stock to portfolio and verify list update
- [x] 4.5 Write `client/e2e/quant.spec.ts` covering: quant page loads indicators, run MACD analysis and verify chart, run strategy backtest and verify results
- [x] 4.6 Write `client/e2e/ai-chat.spec.ts` covering: AI chat page loads, send message and receive AI response
- [x] 4.7 Write `client/e2e/notifications.spec.ts` covering: notification badge reflects unread count, open notification panel, mark as read and verify badge update

## 5. Docker & CI Integration

- [x] 5.1 Update `docker-compose.yml` to add a `playwright` service using `mcr.microsoft.com/playwright:v1.51.0-jammy` (or latest stable) image, depending on `client` and `server` healthchecks, and running `pnpm run test:e2e`
- [x] 5.2 Ensure the `playwright` service shares the app network and mounts `client/` as a volume (or uses a built client image)
- [x] 5.3 Add `--profile e2e` support so `docker-compose --profile e2e up --build` starts server, client, and playwright services together
- [x] 5.4 Verify E2E tests pass end-to-end inside Docker Compose with `docker-compose --profile e2e up --build --exit-code-from playwright`
- [x] 5.5 Update CI workflow (e.g., `.github/workflows/ci.yml` or equivalent) to add an `e2e` job that runs the Docker Compose E2E stack and uploads `client/playwright-report/` as an artifact on failure
- [x] 5.6 Document local E2E workflow in `AGENTS.md` (or `README.md` if appropriate): how to install browsers, run tests locally, run tests in Docker, and view reports

## 6. UI Stabilization (data-testid)

- [x] 6.1 Audit core interactive components across pages (`client/src/pages/`) and add `data-testid` attributes to elements targeted by E2E tests (buttons, inputs, tables, navigation items, chart containers)
- [x] 6.2 Update POM selectors to reference the new `data-testid` attributes
- [x] 6.3 Run the full E2E suite locally to confirm all tests pass with stable selectors
