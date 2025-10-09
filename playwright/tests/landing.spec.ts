import { test, expect } from '@playwright/test'

test('hero quick stack navigates to default summary', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByTestId('hero-section')).toBeVisible()

  await page.getByTestId('hero-stack-react').click()

  await expect(page).toHaveURL(/\/new\/stack\/react\/default\/summary$/)
  await expect(page.getByTestId('stack-summary-page')).toBeVisible()
})

test('hero scan form falls back to existing flow for invalid input', async ({ page }) => {
  await page.goto('/')

  await page.getByTestId('hero-repo-input').fill('not-a-valid-repo')
  await page.getByTestId('hero-scan-button').click()

  await expect(page).toHaveURL(/\/existing$/)
  await expect(page.getByTestId('existing-repo-page')).toBeVisible()
})
