import { buildStepsForStack } from "@/lib/wizard-summary-data"
import { isWizardResponseKey } from "@/lib/wizard-responses"
import type { WizardResponses, WizardStep } from "@/types/wizard"

export const normalizeConventionValue = (value: string): string => value.trim().toLowerCase()

export type StackQuestionDefault = {
  questionId: string
  responseKey: keyof WizardResponses
  value: string
  label: string
}

export type StackQuestionMetadata = {
  defaults: StackQuestionDefault[]
  answersByResponseKey: Partial<Record<keyof WizardResponses, string[]>>
}

const metadataCache = new Map<string, StackQuestionMetadata>()

const extractQuestionMetadata = (steps: WizardStep[], stack: string): StackQuestionMetadata => {
  const defaults: StackQuestionDefault[] = []
  const answersByResponseKey: Partial<Record<keyof WizardResponses, string[]>> = {}

  steps.forEach((step) => {
    step.questions.forEach((question) => {
      const rawKey = question.responseKey ?? question.id
      if (!rawKey || rawKey === "stackSelection" || !isWizardResponseKey(rawKey)) {
        return
      }

      const key = rawKey as keyof WizardResponses
      const enabledAnswers = question.answers.filter((answer) => !answer.disabled)

      if (enabledAnswers.length > 0) {
        const seen = new Set<string>()
        answersByResponseKey[key] = enabledAnswers.reduce<string[]>((list, answer) => {
          const value = typeof answer.value === "string" ? answer.value : ""
          if (!value || seen.has(value.toLowerCase())) {
            return list
          }
          seen.add(value.toLowerCase())
          list.push(value)
          return list
        }, [])
      }

      const defaultAnswer = enabledAnswers.find((answer) => answer.isDefault)
      if (defaultAnswer && typeof defaultAnswer.value === "string" && defaultAnswer.value.trim().length > 0) {
        defaults.push({
          questionId: question.id,
          responseKey: key,
          value: defaultAnswer.value,
          label: defaultAnswer.label ?? defaultAnswer.value,
        })
      }
    })
  })

  return { defaults, answersByResponseKey }
}

export const loadStackQuestionMetadata = async (stack: string): Promise<StackQuestionMetadata> => {
  const normalized = stack.trim().toLowerCase()
  if (metadataCache.has(normalized)) {
    return metadataCache.get(normalized)!
  }

  const { steps } = await buildStepsForStack(stack)
  const metadata = extractQuestionMetadata(steps, stack)
  metadataCache.set(normalized, metadata)
  return metadata
}
