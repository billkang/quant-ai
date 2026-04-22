import { test as base, expect } from '@playwright/test'

export const test = base.extend({
  storageState: './e2e/.auth/user.json',
})

export { expect }
