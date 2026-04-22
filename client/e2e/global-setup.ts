import { request } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8000'
const TEST_USER = {
  username: 'e2e-test-user',
  email: 'e2e@test.com',
  password: 'Test1234!',
}

export default async function globalSetup() {
  const context = await request.newContext({
    baseURL: BASE_URL,
  })

  // Cleanup any existing seed data
  try {
    await context.post('/api/seed/cleanup')
  } catch {
    // ignore cleanup errors
  }

  // Seed test user
  await context.post('/api/seed/user', {
    data: TEST_USER,
  })

  // Login to get token
  const loginRes = await context.post('/api/auth/login', {
    data: {
      username: TEST_USER.username,
      password: TEST_USER.password,
    },
  })

  const loginBody = await loginRes.json()
  const token = loginBody.data?.access_token

  if (!token) {
    throw new Error('Failed to login test user during global setup')
  }

  // Seed some watchlist items
  await context.post('/api/seed/watchlist', {
    data: { stock_code: '600519', stock_name: '贵州茅台' },
    headers: { Authorization: `Bearer ${token}` },
  })

  // Seed a position
  await context.post('/api/seed/position', {
    data: { stock_code: '600519', stock_name: '贵州茅台', quantity: 100, cost_price: 1600 },
    headers: { Authorization: `Bearer ${token}` },
  })

  // Seed an unread alert
  await context.post('/api/seed/alert', {
    data: {
      stock_code: '600519',
      alert_type: 'price_break',
      condition: 'price > 1600',
      message: '贵州茅台股价突破1600元',
    },
    headers: { Authorization: `Bearer ${token}` },
  })

  // Save storage state for reuse across tests
  await context.storageState({ path: './e2e/.auth/user.json' })

  await context.dispose()
}
