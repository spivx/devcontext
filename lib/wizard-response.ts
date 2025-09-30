import type { Responses, WizardResponses, WizardStep } from "@/types/wizard"

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

      if (answer !== null && answer !== undefined) {
        if (question.allowMultiple && Array.isArray(answer)) {
          questionsAndAnswers[targetKey] = answer.join(", ")
        } else if (!question.allowMultiple && typeof answer === "string") {
          questionsAndAnswers[targetKey] = answer
        } else {
          questionsAndAnswers[targetKey] = Array.isArray(answer)
            ? answer.join(", ")
            : (answer as string)
        }
      } else {
        questionsAndAnswers[targetKey] = null
      }
    })
  })

  questionsAndAnswers.outputFile = outputFileId

  return questionsAndAnswers
}
