import { describe, expect, it } from "vitest"

import { buildCompletionSummary } from "@/lib/wizard-summary"
import type { FreeTextResponses, Responses, WizardStep } from "@/types/wizard"

const baseStep: WizardStep = {
  id: "react",
  title: "React Preferences",
  questions: [
    {
      id: "react-fileStructure",
      question: "How do you prefer to organize your components?",
      responseKey: "fileStructure",
      answers: [
        {
          value: "flat",
          label: "Flat structure",
        },
        {
          value: "nested",
          label: "Nested folders",
          isDefault: true,
        },
      ],
    },
  ],
}

describe("buildCompletionSummary", () => {
  it("uses custom free text when no preset answers are selected", () => {
    const responses: Responses = {}
    const freeTextResponses: FreeTextResponses = {
      "react-fileStructure": "Feature pods with co-located tests",
    }

    const summary = buildCompletionSummary(
      null,
      null,
      null,
      [baseStep],
      responses,
      freeTextResponses,
      {},
      {},
      false
    )

    expect(summary).toHaveLength(1)
    const entry = summary[0]
    expect(entry.hasSelection).toBe(true)
    expect(entry.answers).toEqual([
      "Custom: Feature pods with co-located tests",
    ])
  })

  it("prefers custom free text over preset answers", () => {
    const responses: Responses = {
      "react-fileStructure": "flat",
    }
    const freeTextResponses: FreeTextResponses = {
      "react-fileStructure": "Group by domain",
    }

    const summary = buildCompletionSummary(
      null,
      null,
      null,
      [baseStep],
      responses,
      freeTextResponses,
      {},
      {},
      false
    )

    expect(summary).toHaveLength(1)
    const entry = summary[0]
    expect(entry.answers).toEqual([
      "Custom: Group by domain",
    ])
  })
})
