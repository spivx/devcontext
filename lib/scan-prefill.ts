import { buildResponsesFromScan } from "@/lib/scan-to-wizard"
import { buildStepsForStack } from "@/lib/wizard-summary-data"
import { STACK_QUESTION_ID } from "@/lib/wizard-config"
import { persistWizardState } from "@/lib/wizard-storage"
import type { RepoScanSummary } from "@/types/repo-scan"
import type { FreeTextResponses, Responses, WizardQuestion, WizardResponses } from "@/types/wizard"

const normalizeValueForQuestion = (value: string | null, question: WizardQuestion) => {
  if (!value) {
    return undefined
  }

  if (question.allowMultiple) {
    const entries = value
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0)

    return entries.length > 0 ? entries : undefined
  }

  return value
}

export const prefillWizardFromScan = async (scan: RepoScanSummary) => {
  const { stack, responses: wizardResponses } = buildResponsesFromScan(scan)
  const { steps, stackLabel } = await buildStepsForStack(stack)

  const responses: Responses = {
    [STACK_QUESTION_ID]: stack,
  }
  const freeTextResponses: FreeTextResponses = {}
  const autoFilledMap: Record<string, boolean> = {}

  const setIfPresent = (question: WizardQuestion, allResponses: WizardResponses) => {
    const key = (question.responseKey ?? question.id) as keyof WizardResponses
    const value = normalizeValueForQuestion(allResponses[key] ?? null, question)

    if (value === undefined) {
      return
    }

    responses[question.id] = value

    if (question.id !== STACK_QUESTION_ID) {
      autoFilledMap[question.id] = true
    }
  }

  steps.forEach((step) => {
    step.questions.forEach((question) => {
      setIfPresent(question, wizardResponses)
    })
  })

  persistWizardState({
    stackId: stack,
    stackLabel,
    responses,
    freeTextResponses,
    autoFilledMap,
    updatedAt: Date.now(),
  })

  return {
    stackId: stack,
    stackLabel,
  }
}
