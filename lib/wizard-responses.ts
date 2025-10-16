import type { WizardResponses } from "@/types/wizard"

const RESPONSE_KEYS = [
  "stackSelection",
  "tooling",
  "language",
  "fileStructure",
  "styling",
  "testingUT",
  "testingE2E",
  "projectPriority",
  "codeStyle",
  "variableNaming",
  "fileNaming",
  "componentNaming",
  "exports",
  "comments",
  "collaboration",
  "stateManagement",
  "apiLayer",
  "folders",
  "dataFetching",
  "reactPerf",
  "auth",
  "validation",
  "logging",
  "commitStyle",
  "prRules",
  "outputFile",
] as const satisfies ReadonlyArray<keyof WizardResponses>

const BASE_RESPONSES: Omit<WizardResponses, "stackSelection"> = {
  tooling: null,
  language: null,
  fileStructure: null,
  styling: null,
  testingUT: null,
  testingE2E: null,
  projectPriority: null,
  codeStyle: null,
  variableNaming: null,
  fileNaming: null,
  componentNaming: null,
  exports: null,
  comments: null,
  collaboration: null,
  stateManagement: null,
  apiLayer: null,
  folders: null,
  dataFetching: null,
  reactPerf: null,
  auth: null,
  validation: null,
  logging: null,
  commitStyle: null,
  prRules: null,
  outputFile: null,
}

const RESPONSE_KEY_SET = new Set<keyof WizardResponses>(RESPONSE_KEYS)

export const createEmptyResponses = (stack: string): WizardResponses => ({
  stackSelection: stack,
  ...BASE_RESPONSES,
})

export const isWizardResponseKey = (value: string): value is keyof WizardResponses =>
  RESPONSE_KEY_SET.has(value as keyof WizardResponses)

