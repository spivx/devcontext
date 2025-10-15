import { test, expect } from '@playwright/test'

const sampleScanResponse = {
  repo: 'vercel/next.js',
  defaultBranch: 'main',
  language: 'TypeScript',
  languages: ['TypeScript', 'JavaScript'],
  frameworks: ['Next.js', 'React'],
  tooling: ['ESLint', 'Prettier'],
  testing: ['Playwright'],
  structure: {
    src: true,
    components: true,
    tests: true,
    apps: true,
    packages: false,
  },
  topics: ['nextjs', 'react'],
  warnings: [],
}

test('repo scan success path generates instructions preview', async ({ page }) => {
  await page.route('**/api/scan-repo?*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sampleScanResponse),
    })
  })

  await page.goto('/existing/https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js')

  await expect(page.getByTestId('repo-scan-prompt')).toBeVisible()

  await page.getByTestId('repo-scan-confirm-button').click()

  await expect(page.getByTestId('repo-scan-results')).toBeVisible()
  await expect(page.getByText('TypeScript').first()).toBeVisible()
  await expect(page.getByText('Playwright').first()).toBeVisible()

  await page.route('**/api/scan-generate/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        fileName: 'copilot-instructions.md',
        content: '# Repo scan generated instructions\n',
      }),
    })
  })

  await page.getByRole('button', { name: 'Generate copilot-instructions.md' }).click()

  await expect(page.getByTestId('final-output-dialog')).toBeVisible()
  await expect(page.getByTestId('final-output-textarea')).toHaveValue('# Repo scan generated instructions\n')
})

test('repo scan retries after server error', async ({ page }) => {
  let callCount = 0

  await page.route('**/api/scan-repo?*', async (route) => {
    callCount += 1

    if (callCount === 1) {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Repository unavailable' }),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(sampleScanResponse),
    })
  })

  await page.goto('/existing/https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js')

  await page.getByTestId('repo-scan-confirm-button').click()

  await expect(page.getByTestId('repo-scan-error')).toBeVisible()
  await expect(page.getByTestId('repo-scan-retry-button')).toBeVisible()

  await page.getByTestId('repo-scan-retry-button').click()

  await expect(page.getByTestId('repo-scan-results')).toBeVisible()
})
