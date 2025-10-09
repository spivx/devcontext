import { test, expect } from '@playwright/test'

test('existing repo entry validates input and redirects', async ({ page }) => {
  await page.goto('/existing')

  await expect(page.getByTestId('existing-repo-page')).toBeVisible()

  await page.getByTestId('existing-repo-input').fill('https://example.com/foo/bar')
  await page.getByTestId('existing-repo-submit').click()

  await expect(page.getByTestId('existing-repo-error')).toContainText('Enter a valid public GitHub repository URL')

  await page.getByTestId('existing-repo-input').fill('https://github.com/vercel/next.js')
  await page.getByTestId('existing-repo-submit').click()

  await expect(page).toHaveURL(/\/existing\/https%3A%2F%2Fgithub.com%2Fvercel%2Fnext\.js$/)
  await expect(page.getByTestId('repo-scan-prompt')).toBeVisible()
})
