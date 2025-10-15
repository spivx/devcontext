import type { FreeTextResponses, Responses, WizardStep } from "@/types/wizard"
import {
  STACK_QUESTION_ID,
  getSuffixSteps,
  loadStackWizardStep,
  stacksStep,
} from "@/lib/wizard-config"

export type DefaultSummaryData = {
  steps: WizardStep[]
  responses: Responses
  freeTextResponses: FreeTextResponses
  autoFilledMap: Record<string, boolean>
  defaultedMap: Record<string, boolean>
  stackLabel: string
}

const buildDefaultsForSteps = (steps: WizardStep[], stackId: string): {
  responses: Responses
  freeTextResponses: FreeTextResponses
  autoFilledMap: Record<string, boolean>
  defaultedMap: Record<string, boolean>
} => {
  const responses: Responses = {
    [STACK_QUESTION_ID]: stackId,
  }
  const freeTextResponses: FreeTextResponses = {}
  const autoFilledMap: Record<string, boolean> = {}
  const defaultedMap: Record<string, boolean> = {}

  steps.forEach((step) => {
    step.questions.forEach((question) => {
      if (question.id === STACK_QUESTION_ID) {
        responses[STACK_QUESTION_ID] = stackId
        return
      }

      const defaultAnswers = question.answers.filter((answer) => answer.isDefault && !answer.disabled)

      if (defaultAnswers.length === 0) {
        return
      }

      autoFilledMap[question.id] = true

      responses[question.id] = question.allowMultiple
        ? defaultAnswers.map((answer) => answer.value)
        : defaultAnswers[0]?.value

      defaultedMap[question.id] = true
    })
  })

  return { responses, freeTextResponses, autoFilledMap, defaultedMap }
}

export const buildDefaultSummaryData = async (stackId: string): Promise<DefaultSummaryData> => {
  const { step, label } = await loadStackWizardStep(stackId)
  const steps: WizardStep[] = [stacksStep, step, ...getSuffixSteps()]
  const { responses, freeTextResponses, autoFilledMap, defaultedMap } = buildDefaultsForSteps(steps, stackId)

  return {
    steps,
    responses,
    freeTextResponses,
    autoFilledMap,
    defaultedMap,
    stackLabel: label,
  }
}

export const buildStepsForStack = async (stackId: string): Promise<{ steps: WizardStep[]; stackLabel: string }> => {
  const { step, label } = await loadStackWizardStep(stackId)
  return {
    steps: [stacksStep, step, ...getSuffixSteps()],
    stackLabel: label,
  }
}
