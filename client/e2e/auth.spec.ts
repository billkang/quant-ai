import { test, expect } from '@playwright/test'
import { LoginPage } from './pages/LoginPage'
import { TEST_USER } from './utils/auth'

test.describe('Authentication', () => {
  test('successful registration', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto('/login')

    const uniqueUser = `e2e-${Date.now()}`
    await loginPage.fillRegisterInfo(uniqueUser, `${uniqueUser}@test.com`, 'Test1234!')
    await loginPage.submit()

    await expect(page).toHaveURL(/\/$/)
  })

  test('successful login', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto('/login')
    await loginPage.fillCredentials(TEST_USER.username, TEST_USER.password)
    await loginPage.submit()

    await expect(page).toHaveURL(/\/$/)
  })

  test('logout', async ({ page }) => {
    const loginPage = new LoginPage(page)
    await loginPage.goto('/login')
    await loginPage.fillCredentials(TEST_USER.username, TEST_USER.password)
    await loginPage.submit()
    await expect(page).toHaveURL(/\/$/)

    // Click user dropdown then logout
    await page.getByRole('button', { name: '用户菜单' }).click()
    await page.getByText('登出').click()

    await expect(page).toHaveURL(/\/login/)
  })

  test('protected routes redirect unauthenticated users', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/login/)
  })
})
