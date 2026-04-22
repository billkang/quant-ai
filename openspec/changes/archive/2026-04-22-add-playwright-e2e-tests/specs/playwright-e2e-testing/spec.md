## ADDED Requirements

### Requirement: Playwright framework initialized
The system SHALL provide a fully configured Playwright testing environment within the `client/` directory.

#### Scenario: Playwright config exists
- **WHEN** a developer clones the repository
- **THEN** `client/playwright.config.ts` exists with sensible defaults for local and CI execution

#### Scenario: Install browsers
- **WHEN** a developer runs `pnpm exec playwright install chromium`
- **THEN** the Chromium browser binary is available for test execution

#### Scenario: Run tests locally
- **WHEN** a developer runs `pnpm run test:e2e`
- **THEN** Playwright executes all tests under `client/e2e/` in headed or headless mode per config

#### Scenario: Run tests with UI mode
- **WHEN** a developer runs `pnpm run test:e2e:ui`
- **THEN** Playwright Test Runner UI opens for interactive debugging

### Requirement: Page Object Model structure
The system SHALL organize E2E test code using the Page Object Model (POM) pattern to decouple page interaction logic from test assertions.

#### Scenario: BasePage exists
- **WHEN** a test author imports `BasePage`
- **THEN** it provides common methods such as `goto`, `waitForLoad`, and `screenshot`

#### Scenario: Page objects cover core pages
- **WHEN** a test needs to interact with a core feature page
- **THEN** a dedicated page object exists in `client/e2e/pages/` for each of: `LoginPage`, `DashboardPage`, `ScreenerPage`, `PortfolioPage`, `QuantPage`, `AiChatPage`, `NotificationPage`

#### Scenario: Page objects use stable selectors
- **WHEN** a page object locates an interactive element
- **THEN** it uses `data-testid` attributes rather than text content or CSS class names

### Requirement: User authentication journey tested
The system SHALL verify that users can register, log in, and log out through the browser UI.

#### Scenario: Successful registration
- **WHEN** an unauthenticated user navigates to `/register`, fills valid credentials, and submits
- **THEN** the user is redirected to `/login` or `/dashboard` and sees a success message

#### Scenario: Successful login
- **WHEN** a registered user navigates to `/login`, fills credentials, and submits
- **THEN** the user is redirected to `/dashboard` and sees personalized content

#### Scenario: Logout
- **WHEN** an authenticated user clicks the logout button
- **THEN** the user is redirected to `/login` and cannot access `/dashboard` without re-authenticating

#### Scenario: Protected routes redirect unauthenticated users
- **WHEN** an unauthenticated user directly visits `/dashboard`
- **THEN** the application redirects the user to `/login`

### Requirement: Dashboard page tested
The system SHALL verify that the Dashboard displays key widgets and navigation correctly.

#### Scenario: Dashboard loads after login
- **WHEN** an authenticated user navigates to `/dashboard`
- **THEN** the page renders the main layout, market overview widget, and watchlist summary without JavaScript errors

#### Scenario: Dashboard navigation menu works
- **WHEN** an authenticated user clicks each navigation item in the sidebar/menu
- **THEN** the browser navigates to the corresponding page (`/screener`, `/portfolio`, `/quant`, `/ai`, `/notifications`)

### Requirement: Stock screener tested
The system SHALL verify that users can filter and view stocks via the browser UI.

#### Scenario: Screener page loads with filters
- **WHEN** an authenticated user navigates to `/screener`
- **THEN** the filter panel and results table are visible

#### Scenario: Apply filters and view results
- **WHEN** the user selects filter criteria (e.g., market cap range, sector) and clicks "Search"
- **THEN** the results table updates to show matching stocks within a reasonable timeout

#### Scenario: Navigate to stock detail from screener
- **WHEN** the user clicks a stock symbol in the results table
- **THEN** the browser navigates to the stock detail page for that symbol

### Requirement: Portfolio page tested
The system SHALL verify that users can view and manage their portfolio through the browser.

#### Scenario: Portfolio overview displays
- **WHEN** an authenticated user navigates to `/portfolio`
- **THEN** the portfolio summary, holdings list, and performance chart are rendered

#### Scenario: Add stock to portfolio
- **WHEN** the user searches for a stock symbol, selects it, enters quantity and price, and submits
- **THEN** the new holding appears in the holdings list and the summary updates accordingly

### Requirement: Quantitative analysis page tested
The system SHALL verify that users can run technical indicators and backtests via the browser UI.

#### Scenario: Quant page loads indicators
- **WHEN** an authenticated user navigates to `/quant`
- **THEN** the indicator selection panel and chart area are visible

#### Scenario: Run indicator analysis
- **WHEN** the user selects a stock, an indicator (e.g., MACD), a time period, and clicks "Analyze"
- **THEN** the chart renders the indicator overlay and the results panel shows computed values

#### Scenario: Run strategy backtest
- **WHEN** the user configures a backtest strategy, sets parameters, and clicks "Backtest"
- **THEN** the backtest results (return, drawdown, trades) are displayed

### Requirement: AI chat page tested
The system SHALL verify that users can interact with the AI assistant through the browser.

#### Scenario: AI chat page loads
- **WHEN** an authenticated user navigates to `/ai`
- **THEN** the chat interface with input box and message history area is visible

#### Scenario: Send message and receive response
- **WHEN** the user types a message in the input box and submits
- **THEN** the user's message appears in the chat history and an AI response is rendered within a timeout

### Requirement: Notification center tested
The system SHALL verify that users can view and dismiss notifications through the browser UI.

#### Scenario: Notification badge reflects unread count
- **WHEN** there are unread notifications for the authenticated user
- **THEN** the notification bell icon displays the correct unread count badge

#### Scenario: Open notification panel
- **WHEN** the user clicks the notification bell
- **THEN** a dropdown/panel opens listing recent notifications

#### Scenario: Mark notification as read
- **WHEN** the user clicks a specific notification or "Mark all as read"
- **THEN** the badge count updates and the notification is visually marked as read

### Requirement: Test data seeding mechanism
The system SHALL provide a reliable mechanism to initialize test data before E2E tests run.

#### Scenario: Seed data via API
- **WHEN** a test setup script calls the seed API endpoint with test user credentials and sample data
- **THEN** the database contains the pre-defined test user, watchlist items, portfolio holdings, and notifications

#### Scenario: Cleanup after tests
- **WHEN** a test teardown script invokes the cleanup endpoint or uses transaction rollback
- **THEN** all data created during the test is removed, leaving the database in a clean state

### Requirement: Docker integration for E2E tests
The system SHALL support running Playwright E2E tests within the Docker Compose environment.

#### Scenario: Playwright service starts
- **WHEN** a developer runs `docker-compose --profile e2e up --build`
- **THEN** a `playwright` service container starts, waits for `client` and `server` to be healthy, and executes the E2E test suite

#### Scenario: CI runs E2E in Docker
- **WHEN** the CI pipeline executes the E2E job
- **THEN** it spins up the Docker Compose stack, runs tests in headless mode, and uploads `playwright-report/` as an artifact

### Requirement: Reporting and debugging aids
The system SHALL capture evidence when E2E tests fail to facilitate debugging.

#### Scenario: Screenshot on failure
- **WHEN** an E2E test fails
- **THEN** Playwright captures a screenshot of the page at the moment of failure

#### Scenario: Video recording available
- **WHEN** an E2E test fails in CI
- **THEN** a video recording of the test execution is saved to `playwright-report/`

#### Scenario: Trace viewer for local debugging
- **WHEN** a developer runs tests locally with tracing enabled
- **THEN** they can open the generated trace ZIP in Playwright Trace Viewer to inspect DOM, network, and console logs
