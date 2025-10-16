import { test, expect } from '@playwright/test'

// These tests exercise the live GitHub scanning flow via /api/scan-repo.
// They run serially to reduce chances of hitting GitHub rate limits.
test.describe.serial('repo scan live', () => {
  const gotoScanPageAndRun = async (page: any, owner: string, repo: string) => {
    const encoded = encodeURIComponent(`https://github.com/${owner}/${repo}`)
    await page.goto(`/existing/${encoded}`)

    // Confirm the scan
    await expect(page.getByTestId('repo-scan-prompt')).toBeVisible()
    await page.getByTestId('repo-scan-confirm-button').click()

    // Wait up to 60s for scan results to appear (network + GitHub latency)
    await page.waitForSelector('[data-testid="repo-scan-results"]', { timeout: 60_000 })

    // Validate raw JSON includes the expected repo slug
    const rawJsonContainer = page.getByTestId('repo-scan-raw-json')
    await expect(rawJsonContainer).toContainText(`"repo": "${owner}/${repo}"`)
    return rawJsonContainer
  }

  const generateAndAssert = async (page: any, fileName: string, contentHint?: RegExp | string) => {
    // Trigger generation
    await page.getByRole('button', { name: `Generate ${fileName}` }).click()

    // Preview should open and contain content
    await expect(page.getByTestId('final-output-dialog')).toBeVisible()
    const content = await page.getByTestId('final-output-textarea').inputValue()
    expect(content).toBeTruthy()
    if (contentHint) {
      if (contentHint instanceof RegExp) {
        expect(content).toMatch(contentHint)
      } else {
        expect(content).toContain(contentHint)
      }
    }
    await page.getByRole('button', { name: 'Close preview' }).click()
    await expect(page.getByTestId('final-output-dialog')).toBeHidden()
  }

  test('vercel/next.js → detects Next.js/React signals and generates all files', async ({ page }) => {
    const raw = await gotoScanPageAndRun(page, 'vercel', 'next.js')

    // Sanity checks on detection (soft assertions to avoid flakiness)
    await expect(raw).toContainText(/"languages"\s*:\s*\[/)
    // Check frameworks/tooling presence in JSON (any of expected keywords)
    // This repo should show some Next.js/React signals.
    // If frameworks list is empty, the test still passes as long as scan completed and generation works.
    // Prefer a soft assertion on at least one known keyword.
    const rawText = await raw.textContent()
    expect(rawText).toBeTruthy()
    if (rawText) {
      const hasFrameworkSignal = /Next\.js|React/.test(rawText)
      expect(hasFrameworkSignal).toBeTruthy()
    }

    // Generate all three output files
    await generateAndAssert(page, 'copilot-instructions.md', /Copilot Instructions|Project Context/i)
    await generateAndAssert(page, 'agents.md', /Agents Development Guide|Stack Playbook/i)
    await generateAndAssert(page, '.cursor/rules', /"project"\s*:\s*\{/)
  })

  test('nsidnev/fastapi-realworld-example-app → detects Python and generates instructions', async ({ page }) => {
    const raw = await gotoScanPageAndRun(page, 'nsidnev', 'fastapi-realworld-example-app')
    await expect(raw).toContainText(/"language"\s*:\s*"Python"/)

    // Generate at least the main instructions
    await generateAndAssert(page, 'copilot-instructions.md', /Project Context|Security|Testing/i)
  })

  test('spring-projects/spring-petclinic → detects Java in languages and generates instructions', async ({ page }) => {
    const raw = await gotoScanPageAndRun(page, 'spring-projects', 'spring-petclinic')
    // Primary language can vary (e.g., CSS can be dominant by bytes),
    // so assert that Java appears in the languages list instead of as the top language.
    await expect(raw).toContainText(/"languages"\s*:\s*\[([\s\S]*?)"Java"/)

    await generateAndAssert(page, 'copilot-instructions.md', /Project Context|Commit & PR/i)
  })

  test('elixir-lang/elixir → non-JS/Python stack still scans and generates', async ({ page }) => {
    const raw = await gotoScanPageAndRun(page, 'elixir-lang', 'elixir')
    await expect(raw).toContainText(/"language"\s*:\s*"Elixir"/)

    // Even if frameworks are not recognized, generation should work
    await generateAndAssert(page, 'copilot-instructions.md', /Project Context|Editor Setup/i)
  })
})
