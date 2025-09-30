import { act, renderHook } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { useAnswerFilter } from "@/hooks/use-answer-filter"
import type { WizardQuestion } from "@/types/wizard"

const buildQuestion = (overrides: Partial<WizardQuestion> = {}): WizardQuestion => ({
  id: "stackSelection",
  question: "Which stack are you using?",
  enableFilter: true,
  answers: [
    { value: "react", label: "React", tags: ["frontend", "spa"] },
    { value: "vue", label: "Vue", tags: ["frontend", "composition"] },
    { value: "python", label: "Python", tags: ["backend", "language"] },
  ],
  ...overrides,
})

describe("useAnswerFilter", () => {
  it("returns all answers when filter disabled", () => {
    const question = buildQuestion({ enableFilter: false })
    const { result } = renderHook(() => useAnswerFilter(question))

    expect(result.current.answers).toHaveLength(3)
    expect(result.current.isFiltering).toBe(false)
  })

  it("filters answers by label, value, or tags", () => {
    const question = buildQuestion()
    const { result } = renderHook(() => useAnswerFilter(question))

    expect(result.current.answers.map((answer) => answer.value)).toEqual(["react", "vue", "python"])

    act(() => {
      result.current.setQuery("vue")
    })

    expect(result.current.isFiltering).toBe(true)
    expect(result.current.answers.map((answer) => answer.value)).toEqual(["vue"])

    act(() => {
      result.current.setQuery("front")
    })

    expect(result.current.answers.map((answer) => answer.value)).toEqual(["react", "vue"])
  })

  it("returns empty list when no matches", () => {
    const question = buildQuestion()
    const { result } = renderHook(() => useAnswerFilter(question))

    act(() => {
      result.current.setQuery("svelte")
    })

    expect(result.current.answers).toHaveLength(0)
    expect(result.current.isFiltering).toBe(true)
  })
})
