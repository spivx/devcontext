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

  await expect(customInput).toBeVisible()
  await customInput.click()
  await customInput.fill("")
  await customInput.type(customAnswer)
  await expect(customInput).toHaveValue(customAnswer)

  const saveButton = page.getByRole("button", { name: "Save custom answer" })
  await expect(saveButton).toBeEnabled()
  await customInput.press("Enter")

  await expect(questionHeading).toHaveText("What language do you use?")

  await expect.poll(
    () =>
      page.evaluate(({ questionId }) => {
        const raw = window.localStorage.getItem("devcontext:wizard:react")
        if (!raw) {
          return null
        }

        try {
          const state = JSON.parse(raw)
          return state.freeTextResponses?.[questionId] ?? null
        } catch (error) {
          console.warn("Unable to parse wizard state", error)
          return "PARSE_ERROR"
        }
      }, { questionId: "react-tooling" }),
    { timeout: 15000 }
  ).toBe(customAnswer)

  const storedState = await page.evaluate(() => {
    const raw = window.localStorage.getItem("devcontext:wizard:react")
    return raw ? JSON.parse(raw) : null
  })

  expect(storedState).not.toBeNull()
  expect(storedState!.freeTextResponses?.["react-tooling"]).toBe(customAnswer)
})
