import { request } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:8000'

export const TEST_USER = {
  username: 'e2e-test-user',
  email: 'e2e@test.com',
  password: 'Test1234!',
}

export async function seedAndLogin() {
  const context = await request.newContext({
    baseURL: BASE_URL,
  })

  await context.post('/api/seed/cleanup').catch(() => {})
  await context.post('/api/seed/user', { data: TEST_USER })

  const loginRes = await context.post('/api/auth/login', {
    data: {
      username: TEST_USER.username,
      password: TEST_USER.password,
    },
  })

  const body = await loginRes.json()
  const token = body.data?.access_token

  await context.dispose()
  return token
}
