import { test, expect } from '@playwright/test'

test('wizard summary can generate all file types', async ({ page }) => {
  // Go directly to the default summary for a supported stack (React)
  await page.goto('/new/stack/react/default/summary')

  // Summary page should load
  await expect(page.getByTestId('stack-summary-page')).toBeVisible()

  // Helper to click a generate button and verify preview shows non-empty content
  const generateAndAssert = async (buttonName: string, expectSnippet: RegExp | string) => {
    await page.getByRole('button', { name: `Generate ${buttonName}` }).click()
    await expect(page.getByTestId('final-output-dialog')).toBeVisible()
    const content = await page.getByTestId('final-output-textarea').inputValue()
    expect(content).toBeTruthy()
    if (expectSnippet) {
      if (expectSnippet instanceof RegExp) {
        expect(content).toMatch(expectSnippet)
      } else {
        expect(content).toContain(expectSnippet)
      }
    }
    await page.getByRole('button', { name: 'Close preview' }).click()
    await expect(page.getByTestId('final-output-dialog')).toBeHidden()
  }

  // 1) copilot-instructions.md
  await generateAndAssert('copilot-instructions.md', /Project Context & Priorities|Copilot Instructions/i)

  // 2) agents.md
  await generateAndAssert('agents.md', /Agents Development Guide|Stack Playbook/i)

  // 3) .cursor\/rules
  await generateAndAssert('.cursor/rules', /"project"\s*:\s*\{/)
})

