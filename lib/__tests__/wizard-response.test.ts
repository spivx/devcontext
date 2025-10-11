import { describe, expect, it } from "vitest"

import { serializeWizardResponses } from "@/lib/wizard-response"
import type { FreeTextResponses, Responses, WizardStep } from "@/types/wizard"

const step: WizardStep = {
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
        },
      ],
    },
  ],
}

describe("serializeWizardResponses", () => {
  it("returns the custom free text when no other answers exist", () => {
    const responses: Responses = {}
    const freeTextResponses: FreeTextResponses = {
      "react-fileStructure": "Domain pods",
    }

    const result = serializeWizardResponses([step], responses, freeTextResponses, null)

    expect(result.fileStructure).toBe("Domain pods")
  })

  it("prefers custom free text over preset selections", () => {
    const responses: Responses = {
      "react-fileStructure": ["flat", "nested"],
    }
    const freeTextResponses: FreeTextResponses = {
      "react-fileStructure": "Add shared ui layer",
    }

    const result = serializeWizardResponses([step], responses, freeTextResponses, null)

    expect(result.fileStructure).toBe("Add shared ui layer")
  })
})
