import { useEffect, useMemo, useState } from "react"

import type { WizardAnswer, WizardQuestion } from "@/types/wizard"

type UseAnswerFilterResult = {
  query: string
  setQuery: (value: string) => void
  answers: WizardAnswer[]
  isFiltering: boolean
}

const buildSearchableText = (answer: WizardAnswer) => {
  const parts = [answer.label, answer.value]

  if (answer.tags && answer.tags.length > 0) {
    parts.push(answer.tags.join(" "))
  }

  if (answer.example) {
    parts.push(answer.example)
  }

  return parts
    .filter((part) => typeof part === "string" && part.length > 0)
    .join(" ")
    .toLowerCase()
}

export function useAnswerFilter(question: WizardQuestion | null): UseAnswerFilterResult {
  const [query, setQuery] = useState("")

  useEffect(() => {
    setQuery("")
  }, [question?.id])

  const answers = useMemo(() => {
    if (!question) {
      return []
    }

    if (!question.enableFilter) {
      return question.answers
    }

    const trimmed = query.trim().toLowerCase()

    if (trimmed.length === 0) {
      return question.answers
    }

    return question.answers.filter((answer) => {
      const searchable = buildSearchableText(answer)
      return searchable.includes(trimmed)
    })
  }, [question, query])

  const isFiltering = Boolean(question?.enableFilter && query.trim().length > 0)

  return {
    query,
    setQuery,
    answers,
    isFiltering,
  }
}

export function buildFilterPlaceholder(question: WizardQuestion | null) {
  if (!question?.enableFilter) {
    return ""
  }

  const defaultAnswer = question.answers.find((answer) => answer.isDefault && !answer.disabled)
  const exampleLabel = defaultAnswer?.label?.trim() || defaultAnswer?.value?.trim()

  if (exampleLabel && exampleLabel.length > 0) {
    return `Type ${exampleLabel} for example...`
  }

  return "Type to filter options..."
}
