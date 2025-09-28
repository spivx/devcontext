import type { FileOutputConfig, Responses, WizardStep } from "@/types/wizard"

export type CompletionSummaryEntry = {
  id: string
  question: string
  hasSelection: boolean
  answers: string[]
}

const buildFileSummaryEntry = (
  selectedFile: FileOutputConfig | null,
  selectedFileFormatLabel: string | null
): CompletionSummaryEntry => {
  if (!selectedFile) {
    return {
      id: "instructions-file",
      question: "Instructions file",
      hasSelection: false,
      answers: [],
    }
  }

  const answers = [
    selectedFile.label,
    selectedFile.filename ? `Filename: ${selectedFile.filename}` : null,
    selectedFileFormatLabel ? `Format: ${selectedFileFormatLabel}` : null,
  ].filter((entry): entry is string => Boolean(entry))

  return {
    id: "instructions-file",
    question: "Instructions file",
    hasSelection: true,
    answers,
  }
}

export const buildCompletionSummary = (
  selectedFile: FileOutputConfig | null,
  selectedFileFormatLabel: string | null,
  steps: WizardStep[],
  responses: Responses
): CompletionSummaryEntry[] => {
  const summary: CompletionSummaryEntry[] = [
    buildFileSummaryEntry(selectedFile, selectedFileFormatLabel),
  ]

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

      summary.push({
        id: question.id,
        question: question.question,
        hasSelection: selectedAnswers.length > 0,
        answers: selectedAnswers.map((answer) => answer.label),
      })
    })
  })

  return summary
}
