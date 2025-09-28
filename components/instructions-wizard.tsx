"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Undo2 } from "lucide-react"

import type { DataQuestionSource, FileOutputConfig, FrameworkConfig, InstructionsWizardProps, Responses, WizardAnswer, WizardConfirmationIntent, WizardQuestion, WizardStep } from "@/types/wizard"
import rawFrameworks from "@/data/frameworks.json"
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

import { generateInstructions } from "@/lib/instructions-api"
import { buildCompletionSummary } from "@/lib/wizard-summary"
import { serializeWizardResponses } from "@/lib/wizard-response"
import { buildStepFromQuestionSet, getFormatLabel, mapAnswerSourceToWizard } from "@/lib/wizard-utils"
import type { GeneratedFileResult } from "@/types/output"

const fileOptions = filesData as FileOutputConfig[]
const defaultFileOption =
  fileOptions.find((file) => file.isDefault) ??
  fileOptions.find((file) => file.enabled !== false) ??
  fileOptions[0] ??
  null

const FRAMEWORK_STEP_ID = "frameworks"
const FRAMEWORK_QUESTION_ID = "frameworkSelection"
const DEVCONTEXT_ROOT_URL = "https://devcontext.xyz/"

const frameworksStep: WizardStep = {
  id: FRAMEWORK_STEP_ID,
  title: "Choose Your Framework",
  questions: [
    {
      id: FRAMEWORK_QUESTION_ID,
      question: "Which framework are you working with?",
      answers: (rawFrameworks as FrameworkConfig[]).map((framework) => ({
        value: framework.id,
        label: framework.label,
        icon: framework.icon,
        disabled: framework.enabled === false,
        disabledLabel: framework.enabled === false ? "Soon" : undefined,
        docs: framework.docs,
        isDefault: framework.isDefault,
      })),
    },
  ],
}

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

export function InstructionsWizard({ onClose, selectedFileId }: InstructionsWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Responses>({})
  const [dynamicSteps, setDynamicSteps] = useState<WizardStep[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<WizardConfirmationIntent | null>(null)
  const [generatedFile, setGeneratedFile] = useState<GeneratedFileResult | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

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
    () => [frameworksStep, ...dynamicSteps, ...suffixSteps],
    [dynamicSteps]
  )

  const currentStep = wizardSteps[currentStepIndex] ?? null
  const currentQuestion = currentStep?.questions[currentQuestionIndex] ?? null

  const totalQuestions = useMemo(
    () => wizardSteps.reduce((count, step) => count + step.questions.length, 0),
    [wizardSteps]
  )

  const completionSummary = useMemo(
    () => buildCompletionSummary(selectedFile ?? null, selectedFileFormatLabel, wizardSteps, responses),
    [selectedFile, selectedFileFormatLabel, wizardSteps, responses]
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

  const loadFrameworkQuestions = async (frameworkId: string, frameworkLabel: string) => {
    try {
      setGeneratedFile(null)

      const questionsModule = await import(`@/data/questions/${frameworkId}.json`)
      const questionsData = (questionsModule.default ?? questionsModule) as DataQuestionSource[]

      const mappedQuestions: WizardQuestion[] = questionsData.map((question) => ({
        id: question.id,
        question: question.question,
        allowMultiple: question.allowMultiple,
        responseKey: question.responseKey,
        answers: question.answers.map(mapAnswerSourceToWizard),
      }))

      setDynamicSteps([
        {
          id: `framework-${frameworkId}`,
          title: `${frameworkLabel} Preferences`,
          questions: mappedQuestions,
        },
      ])

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
      console.error(`Unable to load questions for framework "${frameworkId}"`, error)
      setDynamicSteps([])
    } finally {
    }
  }

  const handleAnswerClick = async (answer: WizardAnswer) => {
    if (answer.disabled) {
      return
    }

    setGeneratedFile(null)

    const previousValue = responses[currentQuestion.id]
    let nextValue: Responses[keyof Responses]
    let didAddSelection = false

    if (currentQuestion.allowMultiple) {
      const prevArray = Array.isArray(previousValue) ? previousValue : []
      if (prevArray.includes(answer.value)) {
        nextValue = prevArray.filter((item) => item !== answer.value)
      } else {
        nextValue = [...prevArray, answer.value]
        didAddSelection = true
      }
    } else {
      if (previousValue === answer.value) {
        nextValue = undefined
      } else {
        nextValue = answer.value
        didAddSelection = true
      }
    }

    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: nextValue,
    }))

    const isFrameworkQuestion = currentQuestion.id === FRAMEWORK_QUESTION_ID
    const shouldAutoAdvance =
      !isFrameworkQuestion &&
      ((currentQuestion.allowMultiple && Array.isArray(nextValue) && nextValue.length > 0 && didAddSelection) ||
        (!currentQuestion.allowMultiple && nextValue !== undefined && nextValue !== null && didAddSelection))

    if (shouldAutoAdvance) {
      setTimeout(() => {
        advanceToNextQuestion()
      }, 0)
    }

    if (isFrameworkQuestion) {
      if (nextValue === answer.value) {
        await loadFrameworkQuestions(answer.value, answer.label)
      } else {
        setDynamicSteps([])
      }
    }
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

    const isFrameworkQuestion = currentQuestion.id === FRAMEWORK_QUESTION_ID

    if (isFrameworkQuestion) {
      await loadFrameworkQuestions(defaultAnswer.value, defaultAnswer.label)
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
        framework: questionsAndAnswers.frameworkSelection,
      })

      const frameworkSegment = questionsAndAnswers.frameworkSelection ?? "general"
      const fileConfig = fileOptions.find((file) => file.id === outputFileId)

      const result = await generateInstructions({
        frameworkSegment,
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

  const wizardLayout = (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <Button
        variant="destructive"
        size="sm"
        onClick={requestResetWizard}
        className="fixed left-4 top-4 z-40"
      >
        Start Over
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

      {isComplete ? (
        <WizardCompletionSummary
          summary={completionSummary}
          onBack={goToPrevious}
          onGenerate={() => void generateInstructionsFile()}
          isGenerating={isGenerating}
        />
      ) : (
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
          </div>

          <WizardAnswerGrid
            answers={currentQuestion.answers}
            onAnswerClick={handleAnswerClick}
            isSelected={isAnswerSelected}
          />

          <div className="mt-6 flex items-center justify-end">
            <div className="text-xs text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>
        </section>
      )}

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
