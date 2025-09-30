"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Undo2 } from "lucide-react"

import type { DataQuestionSource, FileOutputConfig, InstructionsWizardProps, Responses, WizardAnswer, WizardConfirmationIntent, WizardQuestion, WizardStep } from "@/types/wizard"
import { buildFilterPlaceholder, useAnswerFilter } from "@/hooks/use-answer-filter"
import stacksData from "@/data/stacks.json"
import generalData from "@/data/general.json"
import architectureData from "@/data/architecture.json"
import performanceData from "@/data/performance.json"
import securityData from "@/data/security.json"
import commitsData from "@/data/commits.json"
import filesData from "@/data/files.json"
import FinalOutputView from "./final-output-view"
import { WizardAnswerGrid } from "./wizard-answer-grid"
import { WizardCompletionSummary } from "./wizard-completion-summary"
import { WizardConfirmationDialog } from "./wizard-confirmation-dialog"
import { WizardEditAnswerDialog } from "./wizard-edit-answer-dialog"

import { generateInstructions } from "@/lib/instructions-api"
import { buildCompletionSummary } from "@/lib/wizard-summary"
import { serializeWizardResponses } from "@/lib/wizard-response"
import { buildFileOptionsFromQuestion, buildStepFromQuestionSet, getFormatLabel, mapAnswerSourceToWizard } from "@/lib/wizard-utils"
import type { GeneratedFileResult } from "@/types/output"

const STACK_STEP_ID = "stacks"
const STACK_QUESTION_ID = "stackSelection"
const DEVCONTEXT_ROOT_URL = "https://devcontext.xyz/"

const stackQuestionSet = stacksData as DataQuestionSource[]
const stacksStep = buildStepFromQuestionSet(
  STACK_STEP_ID,
  "Choose Your Stack",
  stackQuestionSet
)
const stackQuestion = stacksStep.questions.find((question) => question.id === STACK_QUESTION_ID) ?? null

const fileQuestionSet = filesData as DataQuestionSource[]
const fileQuestion = fileQuestionSet[0] ?? null
const fileOptions = buildFileOptionsFromQuestion(fileQuestion)
const defaultFileOption =
  fileOptions.find((file) => file.isDefault) ??
  fileOptions[0] ??
  null
const fileSummaryQuestion = fileQuestion
  ? {
      id: fileQuestion.id,
      question: fileQuestion.question,
      isReadOnlyOnSummary: fileQuestion.isReadOnlyOnSummary,
    }
  : null

const generalStep = buildStepFromQuestionSet(
  "general",
  "Project Foundations",
  generalData as DataQuestionSource[]
)

const architectureStep = buildStepFromQuestionSet(
  "architecture",
  "Architecture Practices",
  architectureData as DataQuestionSource[]
)

const performanceStep = buildStepFromQuestionSet(
  "performance",
  "Performance Guidelines",
  performanceData as DataQuestionSource[]
)

const securityStep = buildStepFromQuestionSet(
  "security",
  "Security & Compliance",
  securityData as DataQuestionSource[]
)

const commitsStep = buildStepFromQuestionSet(
  "commits",
  "Collaboration & Version Control",
  commitsData as DataQuestionSource[]
)

const suffixSteps: WizardStep[] = [
  generalStep,
  architectureStep,
  performanceStep,
  securityStep,
  commitsStep,
]

export function InstructionsWizard({ onClose, selectedFileId, initialStackId }: InstructionsWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Responses>({})
  const [dynamicSteps, setDynamicSteps] = useState<WizardStep[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<WizardConfirmationIntent | null>(null)
  const [generatedFile, setGeneratedFile] = useState<GeneratedFileResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isStackFastTrackPromptVisible, setIsStackFastTrackPromptVisible] = useState(false)
  const [autoFilledQuestionMap, setAutoFilledQuestionMap] = useState<Record<string, boolean>>({})
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null)
  const [activeEditQuestionId, setActiveEditQuestionId] = useState<string | null>(null)
  const hasAppliedInitialStack = useRef<string | null>(null)

  useEffect(() => {
    if (!isComplete && activeEditQuestionId) {
      setActiveEditQuestionId(null)
    }
  }, [isComplete, activeEditQuestionId])

  const selectedFile = useMemo(() => {
    if (selectedFileId) {
      const matchedFile = fileOptions.find((file) => file.id === selectedFileId)
      if (matchedFile) {
        return matchedFile
      }
    }

    return defaultFileOption
  }, [selectedFileId])

  const selectedFileFormatLabel = useMemo(
    () => (selectedFile ? getFormatLabel(selectedFile.format) : null),
    [selectedFile]
  )

  const wizardSteps = useMemo(
    () => [stacksStep, ...dynamicSteps, ...suffixSteps],
    [dynamicSteps]
  )

  const nonStackSteps = useMemo(
    () => wizardSteps.filter((step) => step.id !== STACK_STEP_ID),
    [wizardSteps]
  )

  const wizardQuestionsById = useMemo(() => {
    const lookup: Record<string, WizardQuestion> = {}

    wizardSteps.forEach((step) => {
      step.questions.forEach((question) => {
        lookup[question.id] = question
      })
    })

    return lookup
  }, [wizardSteps])

  const editingQuestion = activeEditQuestionId ? wizardQuestionsById[activeEditQuestionId] ?? null : null
  const editingAnswerValue = editingQuestion ? responses[editingQuestion.id] : undefined

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

  const totalQuestions = useMemo(
    () => wizardSteps.reduce((count, step) => count + step.questions.length, 0),
    [wizardSteps]
  )

  const remainingQuestionCount = useMemo(
    () => nonStackSteps.reduce((count, step) => count + step.questions.length, 0),
    [nonStackSteps]
  )

  const completionSummary = useMemo(
    () =>
      buildCompletionSummary(
        fileSummaryQuestion,
        selectedFile ?? null,
        selectedFileFormatLabel,
        wizardSteps,
        responses,
        autoFilledQuestionMap
      ),
    [fileSummaryQuestion, selectedFile, selectedFileFormatLabel, wizardSteps, responses, autoFilledQuestionMap]
  )

  const currentAnswerValue = currentQuestion ? responses[currentQuestion.id] : undefined

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
    !isComplete &&
    currentQuestion &&
    defaultAnswer &&
    !defaultAnswer.disabled &&
    (!isDefaultSelected || currentQuestion.allowMultiple)
  )

  const defaultButtonLabel = defaultAnswer
    ? `Use default (${defaultAnswer.label})`
    : "Use default"

  const showStackPivot = !isComplete && isStackFastTrackPromptVisible
  const showQuestionControls = !isComplete && !isStackFastTrackPromptVisible

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

  const closeEditDialog = useCallback(() => {
    setActiveEditQuestionId(null)
  }, [])

  if (!currentStep || !currentQuestion) {
    return null
  }

  const isAnswerSelected = (value: string) => {
    if (currentQuestion.allowMultiple) {
      return Array.isArray(currentAnswerValue) && currentAnswerValue.includes(value)
    }

    return currentAnswerValue === value
  }

  const advanceToNextQuestion = () => {
    const isLastQuestionInStep = currentQuestionIndex === currentStep.questions.length - 1
    const isLastStep = currentStepIndex === wizardSteps.length - 1

    if (isLastQuestionInStep && isLastStep) {
      setIsComplete(true)
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

    const isFirstQuestionInStep = currentQuestionIndex === 0
    const isFirstStep = currentStepIndex === 0

    if (isFirstQuestionInStep && isFirstStep) {
      return
    }

    if (isFirstQuestionInStep) {
      const previousStepIndex = Math.max(currentStepIndex - 1, 0)
      const previousStep = wizardSteps[previousStepIndex]
      setCurrentStepIndex(previousStepIndex)
      setCurrentQuestionIndex(previousStep.questions.length - 1)
      setIsComplete(false)
      return
    }

    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0))
    setIsComplete(false)
  }

  const loadStackQuestions = useCallback(async (stackId: string, stackLabel?: string) => {
    try {
      setGeneratedFile(null)

      const questionsModule = await import(`@/data/questions/${stackId}.json`)
      const questionsData = (questionsModule.default ?? questionsModule) as DataQuestionSource[]

      const mappedQuestions: WizardQuestion[] = questionsData.map((question) => ({
        id: question.id,
        question: question.question,
        allowMultiple: question.allowMultiple,
        responseKey: question.responseKey,
        answers: question.answers.map(mapAnswerSourceToWizard),
      }))

      const followUpQuestionCount =
        mappedQuestions.length + suffixSteps.reduce((count, step) => count + step.questions.length, 0)

      setAutoFilledQuestionMap({})
      setAutoFillNotice(null)

      const resolvedStackLabel =
        stackLabel ?? stackQuestion?.answers.find((answer) => answer.value === stackId)?.label ?? stackId

      setDynamicSteps([
        {
          id: `stack-${stackId}`,
          title: `${resolvedStackLabel} Preferences`,
          questions: mappedQuestions,
        },
      ])

      setIsStackFastTrackPromptVisible(followUpQuestionCount > 0)

      setResponses((prev) => {
        const next = { ...prev }
        mappedQuestions.forEach((question) => {
          delete next[question.id]
        })
        return next
      })

      setCurrentStepIndex(1)
      setCurrentQuestionIndex(0)
      setIsComplete(false)
    } catch (error) {
      console.error(`Unable to load questions for stack "${stackId}"`, error)
      setDynamicSteps([])
      setIsStackFastTrackPromptVisible(false)
    }
  }, [])

  useEffect(() => {
    if (!initialStackId) {
      return
    }

    if (hasAppliedInitialStack.current === initialStackId) {
      return
    }

    const stackAnswer = stackQuestion?.answers.find((answer) => answer.value === initialStackId)

    if (!stackAnswer) {
      return
    }

    hasAppliedInitialStack.current = initialStackId

    setResponses((prev) => ({
      ...prev,
      [STACK_QUESTION_ID]: stackAnswer.value,
    }))

    void loadStackQuestions(stackAnswer.value, stackAnswer.label)
  }, [initialStackId, loadStackQuestions])

  const applyDefaultsAcrossWizard = () => {
    setGeneratedFile(null)
    setAutoFilledQuestionMap({})

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

    markQuestionsAutoFilled(autoFilledIds)

    if (autoFilledIds.length > 0) {
      setAutoFillNotice("We applied the recommended defaults for you. Tweak any section before generating.")
    } else {
      setAutoFillNotice(null)
    }

    setIsStackFastTrackPromptVisible(false)

    const lastStepIndex = Math.max(wizardSteps.length - 1, 0)
    const lastStep = wizardSteps[lastStepIndex]
    const lastQuestionIndex = lastStep ? Math.max(lastStep.questions.length - 1, 0) : 0

    setCurrentStepIndex(lastStepIndex)
    setCurrentQuestionIndex(lastQuestionIndex)
    setIsComplete(true)
  }

  const beginStepByStepFlow = () => {
    const firstNonStackIndex = wizardSteps.findIndex((step) => step.id !== STACK_STEP_ID)

    if (firstNonStackIndex !== -1) {
      setCurrentStepIndex(firstNonStackIndex)
      setCurrentQuestionIndex(0)
    }

    setIsStackFastTrackPromptVisible(false)
    setIsComplete(false)
    setAutoFillNotice(null)
  }

  const handleEditEntry = (entryId: string) => {
    if (!entryId) {
      return
    }

    const question = wizardQuestionsById[entryId]

    if (!question) {
      return
    }

    setActiveEditQuestionId(entryId)
  }

  const handleQuestionAnswerSelection = async (
    question: WizardQuestion,
    answer: WizardAnswer,
    { skipAutoAdvance = false }: { skipAutoAdvance?: boolean } = {}
  ) => {
    if (answer.disabled) {
      return
    }

    setGeneratedFile(null)

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
        await loadStackQuestions(answer.value, answer.label)
      } else {
        setDynamicSteps([])
        setIsStackFastTrackPromptVisible(false)
      }
    }
  }

  const handleAnswerClick = (answer: WizardAnswer) => {
    if (!currentQuestion) {
      return
    }

    void handleQuestionAnswerSelection(currentQuestion, answer)
  }

  const applyDefaultAnswer = async () => {
    if (!defaultAnswer || defaultAnswer.disabled) {
      return
    }

    setGeneratedFile(null)

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
      await loadStackQuestions(defaultAnswer.value, defaultAnswer.label)
      return
    }

    setTimeout(() => {
      advanceToNextQuestion()
    }, 0)
  }
  const resetWizardState = () => {
    setResponses({})
    setDynamicSteps([])
    setCurrentStepIndex(0)
    setCurrentQuestionIndex(0)
    setIsComplete(false)
    setGeneratedFile(null)
    setIsGenerating(false)
    setIsStackFastTrackPromptVisible(false)
    setAutoFilledQuestionMap({})
    setAutoFillNotice(null)
    hasAppliedInitialStack.current = null
  }

  const resetWizard = () => {
    if (onClose) {
      resetWizardState()
      onClose()
      return
    }

    resetWizardState()
  }

  const requestResetWizard = () => {
    setPendingConfirmation("reset")
  }

  const requestChangeFile = () => {
    if (typeof window !== "undefined") {
      window.location.assign(DEVCONTEXT_ROOT_URL)
    }
  }

  const confirmPendingConfirmation = () => {
    if (!pendingConfirmation) {
      return
    }

    if (pendingConfirmation === "reset") {
      resetWizard()
    }

    if (pendingConfirmation === "change-file") {
      if (typeof window !== "undefined") {
        window.location.assign(DEVCONTEXT_ROOT_URL)
        return
      }
      resetWizard()
      onClose?.()
    }

    setPendingConfirmation(null)
  }

  const cancelPendingConfirmation = () => {
    setPendingConfirmation(null)
  }

  const generateInstructionsFile = async () => {
    if (isGenerating) {
      return
    }

    const outputFileId = selectedFile?.id ?? null
    if (!outputFileId) {
      console.error("No instructions file selected. Cannot generate output.")
      return
    }

    setIsGenerating(true)
    setGeneratedFile(null)

    try {
      const questionsAndAnswers = serializeWizardResponses(wizardSteps, responses, outputFileId)

      console.log("Template combination data:", {
        outputFile: questionsAndAnswers.outputFile,
        stack: questionsAndAnswers.stackSelection,
      })

      const stackSegment = questionsAndAnswers.stackSelection ?? "general"
      const fileConfig = fileOptions.find((file) => file.id === outputFileId)

      const result = await generateInstructions({
        stackSegment,
        outputFileId,
        responses: questionsAndAnswers,
        fileFormat: fileConfig?.format,
      })

      if (result) {
        setGeneratedFile(result)
      }
    } catch (error) {
      console.error("Error calling generate API:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const questionNumber = wizardSteps
    .slice(0, currentStepIndex)
    .reduce((count, step) => count + step.questions.length, 0) + currentQuestionIndex + 1

  const isAtFirstQuestion = currentStepIndex === 0 && currentQuestionIndex === 0
  const backDisabled = isAtFirstQuestion && !isComplete
  const defaultButtonTitle = !canUseDefault
    ? isComplete
      ? "Questions complete"
      : defaultAnswer?.disabled
        ? "Default option unavailable"
        : isDefaultSelected && !currentQuestion.allowMultiple
          ? "Default already selected"
          : defaultAnswer
            ? undefined
            : "No default available"
    : undefined
  const showChangeFile = Boolean(onClose && selectedFile)

  const topButtonLabel = showStackPivot ? "Choose a different stack" : "Start Over"
  const topButtonHandler = showStackPivot ? () => goToPrevious() : () => requestResetWizard()

  const wizardLayout = (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Button
        variant="destructive"
        size="sm"
        onClick={topButtonHandler}
        className="fixed left-4 top-4 z-40"
      >
        {topButtonLabel}
      </Button>

      {selectedFile ? (
        <section className="rounded-3xl border border-border/70 bg-secondary/20 p-5 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-lg font-semibold text-foreground">
                {selectedFile.filename ?? selectedFile.label}
              </p>
            </div>
            {showChangeFile ? (
              <Button variant="outline" size="sm" onClick={requestChangeFile}>
                Change File
              </Button>
            ) : null}
          </div>
        </section>
      ) : null}

      {showStackPivot ? (
        <section className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-lg">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground">Skip the deep dive?</h1>
                <p className="text-sm text-muted-foreground">
                  We can auto-apply the recommended answers for the next {remainingQuestionCount}{" "}
                  {remainingQuestionCount === 1 ? "question" : "questions"} across these sections. (You can still tweak the defaults.)
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" className="px-5" onClick={() => beginStepByStepFlow()}>
                    Fill it out step-by-step
                  </Button>
                  <Button
                    onClick={() => applyDefaultsAcrossWizard()}
                    disabled={remainingQuestionCount === 0}
                    className="px-5"
                  >
                    Use recommended defaults
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </section>
      ) : null}

      {showQuestionControls ? (
        <section className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-lg">
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
                title={defaultButtonTitle}
              >
                {defaultButtonLabel}
              </Button>
            </div>

            <h1 className="text-3xl font-semibold text-foreground">
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
                </div>
                {isFilteringAnswers && !showNoFilterMatches ? (
                  <p className="text-xs text-muted-foreground sm:text-right">
                    Showing {filteredAnswers.length} of {currentQuestion.answers.length}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          {showNoFilterMatches ? (
            <p className="mt-6 rounded-xl border border-border/70 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
              No options match "{answerFilterQuery}". Try a different search.
            </p>
          ) : (
            <WizardAnswerGrid
              answers={filteredAnswers}
              onAnswerClick={handleAnswerClick}
              isSelected={isAnswerSelected}
            />
          )}

          <div className="mt-6 flex items-center justify-end">
            <div className="text-xs text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>
        </section>
      ) : null}

      {isComplete ? (
        <WizardCompletionSummary
          summary={completionSummary}
          onBack={goToPrevious}
          onGenerate={() => void generateInstructionsFile()}
          isGenerating={isGenerating}
          autoFillNotice={autoFillNotice}
          onEditEntry={handleEditEntry}
        />
      ) : null}

      {pendingConfirmation ? (
        <WizardConfirmationDialog
          intent={pendingConfirmation}
          onCancel={cancelPendingConfirmation}
          onConfirm={confirmPendingConfirmation}
        />
      ) : null}
    </div>
  )

  return (
    <>
      {wizardLayout}
      {editingQuestion ? (
        <WizardEditAnswerDialog
          question={editingQuestion}
          value={editingAnswerValue}
          onAnswerSelect={async (selectedAnswer) => {
            await handleQuestionAnswerSelection(editingQuestion, selectedAnswer, { skipAutoAdvance: true })

            if (!editingQuestion.allowMultiple) {
              closeEditDialog()
            }
          }}
          onClose={closeEditDialog}
        />
      ) : null}
      {generatedFile ? (
        <FinalOutputView
          fileName={generatedFile.fileName}
          fileContent={generatedFile.fileContent}
          mimeType={generatedFile.mimeType}
          onClose={() => setGeneratedFile(null)}
        />
      ) : null}
    </>
  )
}
