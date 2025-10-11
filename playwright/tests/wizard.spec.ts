import { test, expect } from '@playwright/test'

test('wizard supports filtering, defaults, and reset', async ({ page }) => {
  await page.goto('/new/stack')
  await page.evaluate(() => {
    window.localStorage.clear()
  })
  await page.reload()

  await expect(page.getByTestId('instructions-wizard')).toBeVisible()
  await expect(page.getByTestId('wizard-question-heading')).toHaveText('Which stack are you working with?')

  await page.getByLabel('Filter options').fill('React')
  await expect(page.getByTestId('answer-option-stackSelection-react')).toBeVisible()

  await page.getByTestId('answer-option-stackSelection-react').click()

  await expect(page.getByTestId('wizard-question-heading')).toHaveText('What build tooling do you use?')

  await page.getByRole('button', { name: /Use default/ }).click()
  await expect(page.getByRole('button', { name: /Use default/ })).toBeDisabled()

  await page.getByRole('button', { name: 'Start Over' }).click()
  await expect(page.getByTestId('wizard-confirmation-dialog')).toBeVisible()
  await page.getByTestId('wizard-confirmation-confirm').click({ noWaitAfter: true })

  await expect(page.getByTestId('wizard-question-heading')).toHaveText('Which stack are you working with?')
})
