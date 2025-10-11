import { test, expect } from "@playwright/test"

test("wizard accepts custom free text answers and shows them in the summary", async ({ page }) => {
  await page.goto("/new/stack")
  await page.evaluate(() => {
    window.localStorage.clear()
  })
  await page.reload()

  await expect(page.getByTestId("instructions-wizard")).toBeVisible()

  await page.getByLabel("Filter options").fill("React")
  await page.getByTestId("answer-option-stackSelection-react").click()

  const fastTrackPrompt = page.getByTestId("wizard-fast-track")
  if (await fastTrackPrompt.isVisible()) {
    await fastTrackPrompt.getByRole("button", { name: "Fill it out step-by-step" }).click()
  }

  const questionHeading = page.getByTestId("wizard-question-heading")
  await expect(questionHeading).toBeVisible()
  await expect(questionHeading).toHaveText("What build tooling do you use?")
  await expect(
    page.getByText("Whatever you type here replaces the presets and goes straight into the AI context file.")
  ).toBeVisible()

  const customAnswer = "Feature pods with co-located tests"
  const customInput = page.getByPlaceholder("Type your custom preference")
  const saveButton = page.getByRole("button", { name: "Save custom answer" })

  await expect(customInput).toBeVisible()
  await expect(saveButton).toBeDisabled()

  await customInput.fill(customAnswer)
  await expect(saveButton).toBeEnabled()
  await saveButton.click()

  const confirmationMessage = page.locator('p', { hasText: "We'll use" }).first()
  await expect(confirmationMessage).toBeVisible()
  await expect(confirmationMessage).toContainText(customAnswer)
  await expect(confirmationMessage).toContainText(
    "for this question when we generate your context file."
  )

  await page.waitForFunction(
    ({ questionId, expected }) => {
      const raw = window.localStorage.getItem("devcontext:wizard:react")
      if (!raw) {
        return false
      }

      try {
        const state = JSON.parse(raw)
        return state.freeTextResponses?.[questionId] === expected
      } catch (error) {
        console.warn("Unable to parse wizard state", error)
        return false
      }
    },
    { questionId: "react-fileStructure", expected: customAnswer }
  )

  const storedState = await page.evaluate(() => {
    const raw = window.localStorage.getItem("devcontext:wizard:react")
    return raw ? JSON.parse(raw) : null
  })

  expect(storedState).not.toBeNull()
  expect(storedState!.freeTextResponses?.["react-fileStructure"]).toBe(customAnswer)
})
