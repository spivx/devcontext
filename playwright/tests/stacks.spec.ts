import { test, expect } from '@playwright/test'

test('stack presets navigate to detail and wizard', async ({ page }) => {
  await page.goto('/stacks')

  await expect(page.getByTestId('stacks-index-page')).toBeVisible()

  await page.getByRole('link', { name: 'Preview React preset' }).click()

  await expect(page).toHaveURL(/\/stacks\/react$/)
  await expect(page.getByTestId('stack-detail-page')).toBeVisible()

  await page.getByRole('link', { name: 'Customize in the wizard' }).click()

  await expect(page).toHaveURL(/\/new\/stack\/react$/)
  await expect(page.getByTestId('instructions-wizard')).toBeVisible()
})
