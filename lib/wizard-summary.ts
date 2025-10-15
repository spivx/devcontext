import type { FileOutputConfig, FreeTextResponses, Responses, WizardStep } from "@/types/wizard"

type SummaryQuestionDetails = {
  id: string
  question: string
  isReadOnlyOnSummary?: boolean
}

export type CompletionSummaryEntry = {
  id: string
  question: string
  hasSelection: boolean
  answers: string[]
  isAutoFilled?: boolean
  isReadOnlyOnSummary?: boolean
}

const buildFileSummaryEntry = (
  fileQuestion: SummaryQuestionDetails | null,
  selectedFile: FileOutputConfig | null,
  selectedFileFormatLabel: string | null
): CompletionSummaryEntry => {
  const questionId = fileQuestion?.id ?? "instructions-file"
  const questionLabel = fileQuestion?.question ?? "Instructions file"
  const questionReadOnly = fileQuestion?.isReadOnlyOnSummary ?? false

  if (!selectedFile) {
    return {
      id: questionId,
      question: questionLabel,
      hasSelection: false,
      answers: [],
      isReadOnlyOnSummary: questionReadOnly,
    }
  }

  const answers = [
    selectedFile.label,
    selectedFile.filename ? `Filename: ${selectedFile.filename}` : null,
    selectedFileFormatLabel ? `Format: ${selectedFileFormatLabel}` : null,
  ].filter((entry): entry is string => Boolean(entry))

  return {
    id: questionId,
    question: questionLabel,
    hasSelection: true,
    answers,
    isReadOnlyOnSummary: questionReadOnly,
  }
}

export const buildCompletionSummary = (
  fileQuestion: SummaryQuestionDetails | null,
  selectedFile: FileOutputConfig | null,
  selectedFileFormatLabel: string | null,
  steps: WizardStep[],
  responses: Responses,
  freeTextResponses: FreeTextResponses,
  autoFilledMap: Record<string, boolean> = {},
  includeFileEntry = true
): CompletionSummaryEntry[] => {
  const summary: CompletionSummaryEntry[] = includeFileEntry
    ? [buildFileSummaryEntry(fileQuestion, selectedFile, selectedFileFormatLabel)]
    : []

  steps.forEach((step) => {
    step.questions.forEach((question) => {
      const value = responses[question.id]
      const selectedAnswers = question.answers.filter((answer) => {
        if (value === null || value === undefined) {
          return false
        }

        if (Array.isArray(value)) {
          return value.includes(answer.value)
        }

        return value === answer.value
      })

      const storedFreeTextValue = freeTextResponses[question.id]
      const freeTextValue = typeof storedFreeTextValue === "string"
        ? storedFreeTextValue.trim()
        : ""
      const customAnswer = freeTextValue.length > 0 ? `Custom: ${freeTextValue}` : null
      const answerSummaries = customAnswer
        ? [customAnswer]
        : selectedAnswers.map((answer) => answer.label)

      summary.push({
        id: question.id,
        question: question.question,
        hasSelection: answerSummaries.length > 0,
        answers: answerSummaries,
        isAutoFilled: Boolean(autoFilledMap[question.id]),
        isReadOnlyOnSummary: Boolean(question.isReadOnlyOnSummary),
      })
    })
  })

  return summary
}
