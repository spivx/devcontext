import type { FreeTextResponses, Responses, WizardResponses, WizardStep } from "@/types/wizard"

const createBaseResponses = (): WizardResponses => ({
  stackSelection: null,
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
})

export const createInitialWizardResponses = () => createBaseResponses()

export const serializeWizardResponses = (
  steps: WizardStep[],
  responses: Responses,
  freeTextResponses: FreeTextResponses,
  outputFileId: string | null
): WizardResponses => {
  const questionsAndAnswers = createBaseResponses()

  steps.forEach((step) => {
    step.questions.forEach((question) => {
      const responseKey = question.responseKey ?? question.id

      if (!(responseKey in questionsAndAnswers)) {
        return
      }

      const answer = responses[question.id]
      const targetKey = responseKey as keyof WizardResponses
      const freeTextValue = typeof freeTextResponses[question.id] === "string"
        ? freeTextResponses[question.id]?.trim()
        : ""
      const entries: string[] = []

      if (answer !== null && answer !== undefined) {
        if (question.allowMultiple && Array.isArray(answer)) {
          entries.push(
            ...answer
              .filter((entry): entry is string => typeof entry === "string")
              .map((entry) => entry)
          )
        } else if (!question.allowMultiple && typeof answer === "string") {
          entries.push(answer)
        } else {
          entries.push(
            ...(Array.isArray(answer)
              ? answer.map((entry) => String(entry))
              : [String(answer)])
          )
        }
      }

      if (freeTextValue.length > 0) {
        questionsAndAnswers[targetKey] = freeTextValue
        return
      }

      if (entries.length > 0) {
        questionsAndAnswers[targetKey] = entries.join(", ")
      } else {
        questionsAndAnswers[targetKey] = null
      }
    })
  })

  questionsAndAnswers.outputFile = outputFileId

  return questionsAndAnswers
}
