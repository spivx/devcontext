import type { Responses, WizardStep } from "@/types/wizard"
import {
  STACK_QUESTION_ID,
  getSuffixSteps,
  loadStackWizardStep,
  stacksStep,
} from "@/lib/wizard-config"

export type DefaultSummaryData = {
  steps: WizardStep[]
  responses: Responses
  autoFilledMap: Record<string, boolean>
  stackLabel: string
}

const buildDefaultsForSteps = (steps: WizardStep[], stackId: string): {
  responses: Responses
  autoFilledMap: Record<string, boolean>
} => {
  const responses: Responses = {
    [STACK_QUESTION_ID]: stackId,
  }
  const autoFilledMap: Record<string, boolean> = {}

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
    })
  })

  return { responses, autoFilledMap }
}

export const buildDefaultSummaryData = async (stackId: string): Promise<DefaultSummaryData> => {
  const { step, label } = await loadStackWizardStep(stackId)
  const steps: WizardStep[] = [stacksStep, step, ...getSuffixSteps()]
  const { responses, autoFilledMap } = buildDefaultsForSteps(steps, stackId)

  return {
    steps,
    responses,
    autoFilledMap,
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
