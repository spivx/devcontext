import { describe, expect, it } from "vitest"

import { renderTemplate } from "@/lib/template-render"
import type { WizardResponses } from "@/types/wizard"

const buildResponses = (): WizardResponses => ({
  stackSelection: "react",
  tooling: "vite",
  language: "TypeScript",
  fileStructure: "feature-based",
  styling: "tailwind",
  testingUT: "jest",
  testingE2E: "cypress",
  projectPriority: "developer velocity",
  codeStyle: "eslint-config-next",
  variableNaming: "camelCase",
  fileNaming: "kebab-case",
  componentNaming: "PascalCase",
  exports: "named",
  comments: "jsdoc",
  collaboration: "github",
  stateManagement: "redux",
  apiLayer: "trpc",
  folders: "by-feature",
  dataFetching: "swr",
  reactPerf: "memoization",
  auth: "oauth",
  validation: "zod",
  logging: "pino",
  commitStyle: "conventional",
  prRules: "reviewRequired",
  outputFile: "instructions-md",
})

describe("renderTemplate", () => {
  it("annotates defaulted responses passed from the scan pipeline", async () => {
    const responses = buildResponses()

    const result = await renderTemplate({
      responses,
      frameworkFromPath: "react",
      fileNameFromPath: "instructions-md",
      defaultedResponses: {
        tooling: {
          label: "Vite",
          value: "vite",
          questionId: "react-tooling",
        },
      },
    })

    expect(result.content).toContain("Vite (stack default - not detected via repo scan)")
  })
})
