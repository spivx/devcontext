import { test, expect } from '@playwright/test'

test('default summary generates preview', async ({ page }) => {
  await page.goto('/new/stack/react/default/summary')

  await expect(page.getByTestId('stack-summary-page')).toBeVisible()

  await page.route('**/api/generate/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        fileName: 'copilot-instructions.md',
        content: '# Generated instructions\n',
      }),
    })
  })

  await page.getByRole('button', { name: 'Generate copilot-instructions.md' }).click()

  await expect(page.getByTestId('final-output-dialog')).toBeVisible()
  await expect(page.getByTestId('final-output-textarea')).toHaveValue('# Generated instructions\n')

  await page.getByRole('button', { name: 'Close preview' }).click()
  await expect(page.getByTestId('final-output-dialog')).toBeHidden()
})
