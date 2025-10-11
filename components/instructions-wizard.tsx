"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Undo2 } from "lucide-react"

import type {
  InstructionsWizardProps,
  Responses,
  WizardAnswer,
  WizardQuestion,
  WizardStep,
  WizardConfirmationIntent,
  FreeTextResponses,
} from "@/types/wizard"
import { buildFilterPlaceholder, useAnswerFilter } from "@/hooks/use-answer-filter"
import {
  STACK_QUESTION_ID,
  STACK_STEP_ID,
  loadStackWizardStep,
  stackQuestion,
  stacksStep,
  getSuffixSteps,
} from "@/lib/wizard-config"
import { persistWizardState, clearWizardState } from "@/lib/wizard-storage"
import { WizardAnswerGrid } from "./wizard-answer-grid"
import { WizardConfirmationDialog } from "./wizard-confirmation-dialog"

const suffixSteps = getSuffixSteps()

export function InstructionsWizard({
  initialStackId,
  initialStackLabel = null,
  initialStackStep = null,
  onStackSelected,
  onStackCleared,
  autoStartAfterStackSelection = true,
  onComplete,
}: InstructionsWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(() => (initialStackStep ? 1 : 0))
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Responses>(() =>
    initialStackId ? { [STACK_QUESTION_ID]: initialStackId } : {}
  )
  const [freeTextResponses, setFreeTextResponses] = useState<FreeTextResponses>({})
  const [dynamicSteps, setDynamicSteps] = useState<WizardStep[]>(() =>
    initialStackStep ? [initialStackStep] : []
  )
  const [isStackFastTrackPromptVisible, setIsStackFastTrackPromptVisible] = useState(() => {
    if (!initialStackStep) {
      return false
    }

    if (autoStartAfterStackSelection) {
      return false
    }

    return initialStackStep.questions.length > 0
  })
  const [pendingConfirmation, setPendingConfirmation] = useState<WizardConfirmationIntent | null>(null)
  const [autoFilledQuestionMap, setAutoFilledQuestionMap] = useState<Record<string, boolean>>({})
  const hasAppliedInitialStack = useRef<string | null>(
    initialStackStep && initialStackId ? initialStackId : null
  )
  const [activeStackLabel, setActiveStackLabel] = useState<string | null>(initialStackLabel)

  const wizardSteps = useMemo(() => [stacksStep, ...dynamicSteps, ...suffixSteps], [dynamicSteps])
  const currentStep = wizardSteps[currentStepIndex] ?? null
  const currentQuestion = currentStep?.questions[currentQuestionIndex] ?? null

  const {
    answers: filteredAnswers,
    query: answerFilterQuery,
    setQuery: setAnswerFilterQuery,
    isFiltering: isFilteringAnswers,
  } = useAnswerFilter(currentQuestion ?? null)

  const filterPlaceholder = buildFilterPlaceholder(currentQuestion ?? null)
  const showNoFilterMatches = Boolean(
    currentQuestion?.enableFilter &&
    filteredAnswers.length === 0 &&
    answerFilterQuery.trim().length > 0
  )
  const filterInputId = currentQuestion ? `answer-filter-${currentQuestion.id}` : "answer-filter"

  const currentAnswerValue = currentQuestion ? responses[currentQuestion.id] : undefined
  const currentFreeTextValue = useMemo(() => {
    if (!currentQuestion) {
      return ""
    }

    const value = freeTextResponses[currentQuestion.id]
    return typeof value === "string" ? value : ""
  }, [currentQuestion, freeTextResponses])
  const freeTextConfig = currentQuestion?.freeText ?? null
  const freeTextInputId = currentQuestion ? `free-text-${currentQuestion.id}` : "free-text"
  const canSubmitFreeText = Boolean(freeTextConfig?.enabled && currentFreeTextValue.trim().length > 0)
  const hasSavedCustomFreeText = Boolean(freeTextConfig?.enabled && currentFreeTextValue.trim().length > 0)

  const savedCustomFreeTextValue = currentFreeTextValue.trim()

  const defaultAnswer = useMemo(
    () => currentQuestion?.answers.find((answer) => answer.isDefault) ?? null,
    [currentQuestion]
  )

  const isDefaultSelected = useMemo(() => {
    if (!currentQuestion || !defaultAnswer) {
      return false
    }

    if (currentQuestion.allowMultiple) {
      return Array.isArray(currentAnswerValue) && currentAnswerValue.includes(defaultAnswer.value)
    }

    return currentAnswerValue === defaultAnswer.value
  }, [currentAnswerValue, currentQuestion, defaultAnswer])

  const canUseDefault = Boolean(
    currentQuestion &&
    defaultAnswer &&
    !defaultAnswer.disabled &&
    (!isDefaultSelected || currentQuestion.allowMultiple)
  )

  const defaultButtonLabel = defaultAnswer
    ? `Use default (${defaultAnswer.label})`
    : "Use default"

  const selectedStackId = useMemo(() => {
    const value = responses[STACK_QUESTION_ID]
    return typeof value === "string" && value.length > 0 ? value : null
  }, [responses])

  const markQuestionsAutoFilled = useCallback((questionIds: string[]) => {
    if (questionIds.length === 0) {
      return
    }

    setAutoFilledQuestionMap((prev) => {
      const next = { ...prev }
      questionIds.forEach((id) => {
        if (id !== STACK_QUESTION_ID) {
          next[id] = true
        }
      })
      return next
    })
  }, [])

  const clearAutoFilledFlag = useCallback((questionId: string) => {
    setAutoFilledQuestionMap((prev) => {
      if (!prev[questionId]) {
        return prev
      }

      const next = { ...prev }
      delete next[questionId]
      return next
    })
  }, [])

  const persistStateIfPossible = useCallback(
    (
      nextResponses: Responses,
      nextFreeText: FreeTextResponses,
      nextAutoFilled: Record<string, boolean>,
      stackId: string | null,
      stackLabel?: string | null
    ) => {
      if (!stackId) {
        return
      }

      persistWizardState({
        stackId,
        stackLabel: stackLabel ?? undefined,
        responses: nextResponses,
        freeTextResponses: nextFreeText,
        autoFilledMap: nextAutoFilled,
        updatedAt: Date.now(),
      })
    },
    []
  )

  const applyStackStep = useCallback(
    (step: WizardStep, label: string | null, options?: { skipFastTrackPrompt?: boolean; stackId?: string }) => {
      const skipFastTrackPrompt = options?.skipFastTrackPrompt ?? false
      const nextStackId = options?.stackId

      setActiveStackLabel(label)
      setDynamicSteps([step])
      setIsStackFastTrackPromptVisible(!skipFastTrackPrompt && step.questions.length > 0)

      setResponses((prev) => {
        const next: Responses = { ...prev }

        if (nextStackId) {
          next[STACK_QUESTION_ID] = nextStackId
        }

        step.questions.forEach((question) => {
          if (question.id === STACK_QUESTION_ID) {
            return
          }

          delete next[question.id]
        })

        return next
      })

      setFreeTextResponses((prev) => {
        if (Object.keys(prev).length === 0) {
          return prev
        }

        let didMutate = false
        const next = { ...prev }

        step.questions.forEach((question) => {
          if (question.id === STACK_QUESTION_ID) {
            return
          }

          if (next[question.id] !== undefined) {
            delete next[question.id]
            didMutate = true
          }
        })

        return didMutate ? next : prev
      })

      setCurrentStepIndex(1)
      setCurrentQuestionIndex(0)
      setAutoFilledQuestionMap({})
    },
    []
  )

  const loadStackQuestions = useCallback(
    async (
      stackId: string,
      stackLabelFromAnswer?: string,
      options?: { skipFastTrackPrompt?: boolean }
    ) => {
      try {
        const { step, label } = await loadStackWizardStep(stackId, stackLabelFromAnswer)
        applyStackStep(step, label, {
          skipFastTrackPrompt: options?.skipFastTrackPrompt,
          stackId,
        })
      } catch (error) {
        console.error(`Unable to load questions for stack "${stackId}"`, error)
        setDynamicSteps([])
        setIsStackFastTrackPromptVisible(false)
        setActiveStackLabel(null)
      }
    },
    [applyStackStep]
  )

  useEffect(() => {
    if (!initialStackId) {
      hasAppliedInitialStack.current = null
      return
    }

    const stackAnswer = stackQuestion?.answers.find((answer) => answer.value === initialStackId)

    if (!stackAnswer) {
      return
    }

    if (initialStackStep) {
      hasAppliedInitialStack.current = initialStackId
      applyStackStep(initialStackStep, initialStackLabel ?? stackAnswer.label ?? null, {
        skipFastTrackPrompt: autoStartAfterStackSelection,
        stackId: stackAnswer.value,
      })
      return
    }

    if (hasAppliedInitialStack.current === initialStackId) {
      return
    }

    hasAppliedInitialStack.current = initialStackId

    setResponses((prev) => ({
      ...prev,
      [STACK_QUESTION_ID]: stackAnswer.value,
    }))

    void loadStackQuestions(stackAnswer.value, stackAnswer.label, {
      skipFastTrackPrompt: autoStartAfterStackSelection,
    })
  }, [
    initialStackId,
    initialStackStep,
    initialStackLabel,
    applyStackStep,
    loadStackQuestions,
    autoStartAfterStackSelection,
  ])

  useEffect(() => {
    if (!selectedStackId) {
      return
    }

    persistStateIfPossible(responses, freeTextResponses, autoFilledQuestionMap, selectedStackId, activeStackLabel)
  }, [
    responses,
    freeTextResponses,
    autoFilledQuestionMap,
    selectedStackId,
    activeStackLabel,
    persistStateIfPossible,
  ])

  const handleWizardCompletion = useCallback(() => {
    if (!selectedStackId) {
      return
    }

    onComplete?.(selectedStackId)
  }, [selectedStackId, onComplete])

  const advanceToNextQuestion = () => {
    const currentStepForAdvance = wizardSteps[currentStepIndex]
    const isLastQuestionInStep =
      currentStepForAdvance ? currentQuestionIndex === currentStepForAdvance.questions.length - 1 : false
    const isLastStep = currentStepIndex === wizardSteps.length - 1

    if (isLastQuestionInStep && isLastStep) {
      handleWizardCompletion()
      return
    }

    if (isLastQuestionInStep) {
      setCurrentStepIndex((prev) => Math.min(prev + 1, wizardSteps.length - 1))
      setCurrentQuestionIndex(0)
      return
    }

    setCurrentQuestionIndex((prev) => prev + 1)
  }

  const goToPrevious = () => {
    if (isStackFastTrackPromptVisible) {
      setIsStackFastTrackPromptVisible(false)
    }

    setCurrentQuestionIndex((prevQuestionIndex) => {
      if (prevQuestionIndex > 0) {
        return prevQuestionIndex - 1
      }

      let targetStepIndex = currentStepIndex

      setCurrentStepIndex((prevStepIndex) => {
        if (prevStepIndex === 0) {
          targetStepIndex = prevStepIndex
          return prevStepIndex
        }

        const nextStepIndex = Math.max(prevStepIndex - 1, 0)
        targetStepIndex = nextStepIndex
        return nextStepIndex
      })

      const targetStep = wizardSteps[targetStepIndex] ?? null

      if (targetStep && targetStep.questions.length > 0) {
        return targetStep.questions.length - 1
      }

      return 0
    })
  }

  const applyDefaultsAcrossWizard = useCallback(() => {
    const autoFilledIds: string[] = []

    setResponses((prev) => {
      const next: Responses = { ...prev }

      wizardSteps.forEach((step) => {
        step.questions.forEach((question) => {
          if (question.id === STACK_QUESTION_ID) {
            return
          }

          const defaultAnswers = question.answers.filter((answer) => answer.isDefault && !answer.disabled)

          if (defaultAnswers.length === 0) {
            return
          }

          autoFilledIds.push(question.id)

          next[question.id] = question.allowMultiple
            ? defaultAnswers.map((answer) => answer.value)
            : defaultAnswers[0]?.value
        })
      })

      return next
    })

    setFreeTextResponses((prev) => (Object.keys(prev).length > 0 ? {} : prev))

    markQuestionsAutoFilled(autoFilledIds)
    setIsStackFastTrackPromptVisible(false)
    handleWizardCompletion()
  }, [markQuestionsAutoFilled, wizardSteps, handleWizardCompletion])

  const beginStepByStepFlow = () => {
    const firstNonStackIndex = wizardSteps.findIndex((step) => step.id !== STACK_STEP_ID)

    if (firstNonStackIndex !== -1) {
      setCurrentStepIndex(firstNonStackIndex)
      setCurrentQuestionIndex(0)
    }

    setIsStackFastTrackPromptVisible(false)
  }

  const handleQuestionAnswerSelection = async (
    question: WizardQuestion,
    answer: WizardAnswer,
    { skipAutoAdvance = false }: { skipAutoAdvance?: boolean } = {}
  ) => {
    if (answer.disabled) {
      return
    }

    const prevValue = responses[question.id]
    let nextValue: Responses[keyof Responses]
    let didAddSelection = false

    if (question.allowMultiple) {
      const prevArray = Array.isArray(prevValue) ? prevValue : []

      if (prevArray.includes(answer.value)) {
        nextValue = prevArray.filter((item) => item !== answer.value)
      } else {
        nextValue = [...prevArray, answer.value]
        didAddSelection = true
      }
    } else {
      if (prevValue === answer.value) {
        nextValue = undefined
      } else {
        nextValue = answer.value
        didAddSelection = true
      }
    }

    setResponses((prev) => ({
      ...prev,
      [question.id]: nextValue,
    }))

    clearAutoFilledFlag(question.id)

    const isStackQuestion = question.id === STACK_QUESTION_ID

    const shouldAutoAdvance =
      !skipAutoAdvance &&
      !isStackQuestion &&
      ((question.allowMultiple && Array.isArray(nextValue) && nextValue.length > 0 && didAddSelection) ||
        (!question.allowMultiple && nextValue !== undefined && nextValue !== null && didAddSelection))

    if (shouldAutoAdvance) {
      setTimeout(() => {
        advanceToNextQuestion()
      }, 0)
    }

    if (isStackQuestion) {
      if (nextValue === answer.value) {
        await loadStackQuestions(answer.value, answer.label, {
          skipFastTrackPrompt: autoStartAfterStackSelection,
        })
        onStackSelected?.(answer.value, answer.label)
      } else {
        setDynamicSteps([])
        setIsStackFastTrackPromptVisible(false)
        onStackCleared?.()
      }
    }
  }

  const handleAnswerClick = (answer: WizardAnswer) => {
    if (!currentQuestion) {
      return
    }

    void handleQuestionAnswerSelection(currentQuestion, answer)
  }

  const handleFreeTextChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const question = currentQuestion

      if (!question) {
        return
      }

      const { value } = event.target
      let didChange = false

      setFreeTextResponses((prev) => {
        const existing = prev[question.id]

        if (value.length === 0) {
          if (existing === undefined) {
            return prev
          }

          const next = { ...prev }
          delete next[question.id]
          didChange = true
          return next
        }

        if (existing === value) {
          return prev
        }

        didChange = true
        return {
          ...prev,
          [question.id]: value,
        }
      })

      if (didChange) {
        clearAutoFilledFlag(question.id)
      }
    },
    [clearAutoFilledFlag, currentQuestion]
  )

  const hasSelectionForQuestion = useCallback(
    (question: WizardQuestion) => {
      const value = responses[question.id]

      if (question.allowMultiple) {
        return Array.isArray(value) && value.length > 0
      }

      return typeof value === "string" && value.length > 0
    },
    [responses]
  )

  const commitFreeTextValue = (
    question: WizardQuestion,
    rawValue: string,
    options?: { allowAutoAdvance?: boolean }
  ) => {
    const allowAutoAdvance = options?.allowAutoAdvance ?? true
    const trimmedValue = rawValue.trim()
    const existingValue = typeof freeTextResponses[question.id] === "string" ? freeTextResponses[question.id] : ""

    if (trimmedValue === existingValue) {
      if (allowAutoAdvance && trimmedValue.length > 0 && !hasSelectionForQuestion(question)) {
        setTimeout(() => {
          advanceToNextQuestion()
        }, 0)
      }

      return
    }

    setFreeTextResponses((prev) => {
      if (trimmedValue.length === 0) {
        if (!(question.id in prev)) {
          return prev
        }

        const next = { ...prev }
        delete next[question.id]
        return next
      }

      return {
        ...prev,
        [question.id]: trimmedValue,
      }
    })

    clearAutoFilledFlag(question.id)

    if (allowAutoAdvance && trimmedValue.length > 0 && !hasSelectionForQuestion(question)) {
      setTimeout(() => {
        advanceToNextQuestion()
      }, 0)
    }
  }

  const handleFreeTextSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentQuestion) {
      return
    }

    commitFreeTextValue(currentQuestion, currentFreeTextValue)
  }

  const handleFreeTextClear = () => {
    if (!currentQuestion) {
      return
    }

    commitFreeTextValue(currentQuestion, "", { allowAutoAdvance: false })
  }

  const applyDefaultAnswer = async () => {
    if (!defaultAnswer || defaultAnswer.disabled || !currentQuestion) {
      return
    }

    const nextValue: Responses[keyof Responses] = currentQuestion.allowMultiple
      ? [defaultAnswer.value]
      : defaultAnswer.value

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: nextValue,
    }))

    clearAutoFilledFlag(currentQuestion.id)

    const isStackQuestion = currentQuestion.id === STACK_QUESTION_ID

    if (isStackQuestion) {
      await loadStackQuestions(defaultAnswer.value, defaultAnswer.label, {
        skipFastTrackPrompt: autoStartAfterStackSelection,
      })
      onStackSelected?.(defaultAnswer.value, defaultAnswer.label)
      return
    }

    setTimeout(() => {
      advanceToNextQuestion()
    }, 0)
  }

  const resetWizardState = () => {
    const stackIdToClear = selectedStackId
    setResponses({})
    setFreeTextResponses({})
    setDynamicSteps([])
    setCurrentStepIndex(0)
    setCurrentQuestionIndex(0)
    setIsStackFastTrackPromptVisible(false)
    setAutoFilledQuestionMap({})
    setActiveStackLabel(null)
    hasAppliedInitialStack.current = null
    if (stackIdToClear) {
      clearWizardState(stackIdToClear)
    }
  }

  const resetWizard = () => {
    resetWizardState()
    onStackCleared?.()
  }

  const requestResetWizard = () => {
    setPendingConfirmation("reset")
  }

  const confirmPendingConfirmation = () => {
    if (!pendingConfirmation) {
      return
    }

    if (pendingConfirmation === "reset") {
      resetWizard()
    }

    setPendingConfirmation(null)
  }

  const cancelPendingConfirmation = () => {
    setPendingConfirmation(null)
  }

  const isAnswerSelected = (value: string) => {
    if (currentQuestion?.allowMultiple) {
      return Array.isArray(currentAnswerValue) && currentAnswerValue.includes(value)
    }

    return currentAnswerValue === value
  }

  const questionNumber = wizardSteps
    .slice(0, currentStepIndex)
    .reduce((count, step) => count + step.questions.length, 0) + currentQuestionIndex + 1

  const totalQuestions = useMemo(
    () => wizardSteps.reduce((count, step) => count + step.questions.length, 0),
    [wizardSteps]
  )

  const remainingQuestionCount = useMemo(() => {
    return wizardSteps
      .slice(currentStepIndex)
      .reduce((count, step, stepIndex) => {
        if (stepIndex === 0) {
          return count + (step.questions.length - currentQuestionIndex)
        }
        return count + step.questions.length
      }, 0)
  }, [wizardSteps, currentStepIndex, currentQuestionIndex])

  const isAtFirstQuestion = currentStepIndex === 0 && currentQuestionIndex === 0
  const backDisabled = isAtFirstQuestion

  if (!currentStep || !currentQuestion) {
    return null
  }

  const wizardLayout = (
    <div
      className="mx-auto flex w-full max-w-4xl flex-col gap-6"
      data-testid="instructions-wizard"
    >
      <div className="flex items-center justify-start">
        <Link
          href="/"
          className="text-sm font-semibold text-foreground transition hover:text-primary"
        >
          DevContext
        </Link>
      </div>

      {isStackFastTrackPromptVisible ? (
        <section
          className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-lg"
          data-testid="wizard-fast-track"
        >
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground">Skip the deep dive?</h1>
                <p className="text-sm text-muted-foreground">
                  We can auto-apply the recommended answers for the next {remainingQuestionCount}{" "}
                  {remainingQuestionCount === 1 ? "question" : "questions"}. You can still tweak everything later.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="secondary" className="px-5" onClick={() => beginStepByStepFlow()}>
                  Fill it out step-by-step
                </Button>
                <Button onClick={() => applyDefaultsAcrossWizard()} className="px-5">
                  Use recommended defaults
                </Button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section
          className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-lg"
          data-testid="wizard-question-section"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                className="px-5"
                onClick={goToPrevious}
                disabled={backDisabled}
              >
                <Undo2 className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => void applyDefaultAnswer()}
                disabled={!canUseDefault}
              >
                {defaultButtonLabel}
              </Button>
            </div>

            <h1
              className="text-3xl font-semibold text-foreground"
              data-testid="wizard-question-heading"
            >
              {currentQuestion.question}
            </h1>

            {currentQuestion.enableFilter ? (
              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label
                  htmlFor={filterInputId}
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Filter options
                </label>
                <div className="relative w-full sm:w-auto sm:min-w-[240px]">
                  <input
                    id={filterInputId}
                    type="text"
                    value={answerFilterQuery}
                    onChange={(event) => setAnswerFilterQuery(event.target.value)}
                    placeholder={filterPlaceholder}
                    className="w-full rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  />
                  {isFilteringAnswers ? (
                    <span className="absolute inset-y-0 right-3 inline-flex items-center text-xs text-muted-foreground">
                      Filtering…
                    </span>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {showNoFilterMatches ? (
            <p className="mt-6 rounded-xl border border-border/70 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              No options match “{answerFilterQuery}”. Try a different search.
            </p>
          ) : (
            <WizardAnswerGrid
              answers={filteredAnswers}
              onAnswerClick={handleAnswerClick}
              isSelected={isAnswerSelected}
              questionId={currentQuestion?.id ?? null}
            />
          )}

          {freeTextConfig?.enabled ? (
            <div className="mt-6 space-y-3 rounded-2xl border border-border/60 bg-background/80 p-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-foreground">Need something else?</p>
                <p className="text-xs text-muted-foreground">
                  {hasSavedCustomFreeText
                    ? "Your custom answer below is what we'll keep when generating the AI context file."
                    : "Whatever you type here replaces the presets and goes straight into the AI context file."}
                </p>
              </div>
              <form
                className="flex flex-col gap-2 sm:flex-row sm:items-center"
                onSubmit={handleFreeTextSubmit}
              >
                <Input
                  id={freeTextInputId}
                  value={currentFreeTextValue}
                  onChange={handleFreeTextChange}
                  placeholder="Type your custom preference"
                  className="sm:flex-1"
                  autoComplete="off"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={!canSubmitFreeText}>
                    Save custom answer
                  </Button>
                  {currentFreeTextValue.length > 0 ? (
                    <Button type="button" size="sm" variant="ghost" onClick={handleFreeTextClear}>
                      Clear
                    </Button>
                  ) : null}
                </div>
              </form>
              {hasSavedCustomFreeText ? (
                <p className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>
                    We'll use
                    {" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium">
                      {savedCustomFreeTextValue}
                    </code>
                    {" "}
                    for this question when we generate your context file.
                  </span>
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={requestResetWizard}
            >
              Start Over
            </Button>
          </div>
        </section>
      )}
    </div>
  )

  return (
    <>
      {wizardLayout}
      {pendingConfirmation ? (
        <WizardConfirmationDialog
          intent={pendingConfirmation}
          onCancel={cancelPendingConfirmation}
          onConfirm={confirmPendingConfirmation}
        />
      ) : null}
    </>
  )
}
