"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Undo2 } from "lucide-react"
import * as simpleIcons from "simple-icons"
import type { SimpleIcon } from "simple-icons"

import type { DataQuestionSource, FileOutputConfig, FrameworkConfig, InstructionsWizardProps, Responses, WizardAnswer, WizardConfirmationIntent, WizardQuestion, WizardResponses, WizardStep } from "@/types/wizard"
import rawFrameworks from "@/data/frameworks.json"
import generalData from "@/data/general.json"
import architectureData from "@/data/architecture.json"
import performanceData from "@/data/performance.json"
import securityData from "@/data/security.json"
import commitsData from "@/data/commits.json"
import filesData from "@/data/files.json"
import { InstructionsAnswerCard } from "./instructions-answer-card"
import FinalOutputView from "./final-output-view"

import { ANALYTICS_EVENTS } from "@/lib/analytics-events"
import { track } from "@/lib/mixpanel"
import { buildStepFromQuestionSet, getFormatLabel, getMimeTypeForFormat, mapAnswerSourceToWizard } from "@/lib/wizard-utils"
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

const iconSlugOverrides: Record<string, string> = {
  vscode: "microsoft",
  visualstudiocode: "microsoft",
  css3: "css",
  materialui: "mui",
  rxjs: "reactivex",
}

const iconColorOverrides: Record<string, string> = {
  nextdotjs: "#0070F3",
  angular: "#DD0031",
}

const customIconBySlug: Record<string, { svg: string; hex: string }> = {
  "folder-tree": {
    hex: "#6366F1",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h5l2 2h11a1 1 0 0 1 1 1v2" /><path d="M3 6v12a1 1 0 0 0 1 1h7" /><path d="M12 13h6" /><path d="M16 9v8" /></svg>',
  },
  layout: {
    hex: "#F97316",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M9 4v16" /><path d="M3 10h6" /></svg>',
  },
  microsoftazure: {
    hex: "#0078D4",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M10.6 3.2 3.1 20.8a.6.6 0 0 0 .55.84h5.26a.8.8 0 0 0 .68-.39l2.44-4.12h5.28l-2.1 4.94a.6.6 0 0 0 .55.84h4.84a.6.6 0 0 0 .57-.38L21 17.5a.8.8 0 0 0-.74-1.09h-5.33l3.36-7.62a.6.6 0 0 0-.56-.83h-6.23l1.06-2.57a.6.6 0 0 0-.56-.79h-1.01a.8.8 0 0 0-.73.5Z" /></svg>',
  },
  playwright: {
    hex: "#2AC866",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M6.84 3.85a2.4 2.4 0 0 1 2.18-.29l12.37 4.09c1.7.56 2.13 2.74.75 3.92l-7.45 6.43a2.4 2.4 0 0 1-2.44.38l-11.01-4.34C.5 13.31.19 11.15 1.7 10l5.14-4.12Zm6 1.62L3.82 6.8a1.2 1.2 0 0 0-.8 1.99l8.82 8.78a1.2 1.2 0 0 0 1.65.02l7.14-6.18a1.2 1.2 0 0 0-.34-2.03l-7.45-2.93Zm1.21 2.72c1.76 0 3.18 1.51 3.18 3.38s-1.42 3.39-3.18 3.39c-1.76 0-3.18-1.52-3.18-3.39s1.42-3.38 3.18-3.38Zm0 1.8c-.8 0-1.44.72-1.44 1.58 0 .87.65 1.59 1.44 1.59.8 0 1.45-.72 1.45-1.59 0-.86-.65-1.58-1.45-1.58Z" /></svg>',
  },
}

const simpleIconBySlug = (() => {
  const map = new Map<string, SimpleIcon>()
  const isSimpleIcon = (icon: unknown): icon is SimpleIcon =>
    typeof icon === "object" && icon !== null && "slug" in icon && "svg" in icon

  Object.values(simpleIcons).forEach((icon) => {
    if (isSimpleIcon(icon)) {
      map.set(icon.slug, icon)
    }
  })

  return map
})()

const simpleIconMarkupCache = new Map<string, string>()

const getSimpleIconMarkup = (icon: SimpleIcon) => {
  if (simpleIconMarkupCache.has(icon.slug)) {
    return simpleIconMarkupCache.get(icon.slug)!
  }

  const markup = icon.svg.replace(
    "<svg ",
    '<svg fill="currentColor" class="fill-current" '
  )

  simpleIconMarkupCache.set(icon.slug, markup)
  return markup
}

const normalizeHex = (hex: string) => {
  const trimmed = hex.trim().replace(/^#/, "")
  if (trimmed.length === 3) {
    return trimmed
      .split("")
      .map((char) => char + char)
      .join("")
  }
  return trimmed.padEnd(6, "0").slice(0, 6)
}

const getAccessibleIconColor = (hex: string) => {
  const normalized = normalizeHex(hex)
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)

  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255

  if (Number.isNaN(luminance)) {
    return "#A0AEC0"
  }

  if (luminance < 0.35) {
    const lighten = (component: number) =>
      Math.min(255, Math.round(component + (255 - component) * 0.45))

    const lr = lighten(r)
    const lg = lighten(g)
    const lb = lighten(b)

    return `#${lr.toString(16).padStart(2, "0")}${lg
      .toString(16)
      .padStart(2, "0")}${lb.toString(16).padStart(2, "0")}`
  }

  return `#${normalized}`
}

const normalizeIconSlug = (raw?: string) => {
  if (!raw) {
    return null
  }

  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^cdn\.simpleicons\.org\//, "")
    .replace(/^\/icons\//, "")
    .replace(/\.svg$/, "")

  if (!cleaned) {
    return null
  }

  return iconSlugOverrides[cleaned] ?? cleaned
}

type IconDescriptor = {
  slug: string
  markup: string
  hex: string
}

const getIconDescriptor = (raw?: string): IconDescriptor | null => {
  const normalized = normalizeIconSlug(raw)
  if (!normalized) {
    return null
  }

  const customIcon = customIconBySlug[normalized]
  if (customIcon) {
    return {
      slug: normalized,
      markup: customIcon.svg,
      hex: customIcon.hex,
    }
  }

  const simpleIcon = simpleIconBySlug.get(normalized)
  if (simpleIcon) {
    return {
      slug: simpleIcon.slug,
      markup: getSimpleIconMarkup(simpleIcon),
      hex: simpleIcon.hex,
    }
  }

  return null
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const hexToRgba = (hex: string, alpha: number) => {
  const normalized = normalizeHex(hex)
  const r = parseInt(normalized.slice(0, 2), 16)
  const g = parseInt(normalized.slice(2, 4), 16)
  const b = parseInt(normalized.slice(4, 6), 16)

  if ([r, g, b].some((component) => Number.isNaN(component))) {
    return null
  }

  const clampedAlpha = clamp(alpha, 0, 1)

  return `rgba(${r}, ${g}, ${b}, ${clampedAlpha})`
}

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
      track(ANALYTICS_EVENTS.CREATE_INSTRUCTIONS_FILE, {
        outputFile: outputFileId,
      })
      // Create a JSON object with question IDs as keys and their answers as values
      const questionsAndAnswers: WizardResponses = {
      frameworkSelection: null,
      tooling: null,
      language: null,
      fileStructure: null,
      styling: null,
      testingUT: null,
      testingE2E: null,
      projectPriority: null,
      codeStyle: null,
      variableNaming: null,
      fileNaming: null,
      componentNaming: null,
      exports: null,
      comments: null,
      collaboration: null,
      stateManagement: null,
      apiLayer: null,
      folders: null,
      dataFetching: null,
      reactPerf: null,
      auth: null,
      validation: null,
      logging: null,
      commitStyle: null,
      prRules: null,
      outputFile: null,
    }

    wizardSteps.forEach((step) => {
      step.questions.forEach((question) => {
        const responseKey = question.responseKey ?? question.id

        if (!(responseKey in questionsAndAnswers)) {
          return
        }

        const answer = responses[question.id]
        const targetKey = responseKey as keyof WizardResponses

        if (answer !== null && answer !== undefined) {
          if (question.allowMultiple && Array.isArray(answer)) {
            // For all other multi-selects, keep as array
            questionsAndAnswers[targetKey] = answer.join(", ")
          } else if (!question.allowMultiple && typeof answer === 'string') {
            questionsAndAnswers[targetKey] = answer
          } else {
            questionsAndAnswers[targetKey] = Array.isArray(answer) ? answer.join(", ") : (answer as string)
          }
        } else {
          questionsAndAnswers[targetKey] = null
        }
      })
    })

      questionsAndAnswers.outputFile = outputFileId

      // Ensure we have the combination data for the API
      // The API will now use outputFile + frameworkSelection to determine the template
      console.log('Template combination data:', {
        outputFile: questionsAndAnswers.outputFile,
        framework: questionsAndAnswers.frameworkSelection
      })

      // console.log('Questions and Answers JSON:', JSON.stringify(questionsAndAnswers, null, 2))

      // Call the API to generate the instructions file
      if (questionsAndAnswers.outputFile) {
        const frameworkSegment = questionsAndAnswers.frameworkSelection ?? 'general'
        const fileNameSegment = questionsAndAnswers.outputFile

        try {
          const response = await fetch(
            `/api/generate/${encodeURIComponent(frameworkSegment)}/${encodeURIComponent(fileNameSegment)}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(questionsAndAnswers),
            }
          )

          if (response.ok) {
            const data = await response.json()
            const fileConfig = fileOptions.find((file) => file.id === questionsAndAnswers.outputFile)
            const mimeType = getMimeTypeForFormat(fileConfig?.format)

            setGeneratedFile({
              fileName: data.fileName,
              fileContent: data.content,
              mimeType: mimeType ?? null,
            })
          } else {
            console.error('Failed to generate file:', await response.text())
          }
        } catch (error) {
          console.error('Error calling generate API:', error)
        }
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const renderCompletion = () => {
    const summary = [
      selectedFile
        ? {
          question: "Instructions file",
          hasSelection: true,
          answers: [
            selectedFile.label,
            selectedFile.filename ? `Filename: ${selectedFile.filename}` : null,
            selectedFileFormatLabel ? `Format: ${selectedFileFormatLabel}` : null,
          ].filter((entry): entry is string => Boolean(entry)),
        }
        : {
          question: "Instructions file",
          hasSelection: false,
          answers: [],
        },
      ...wizardSteps.flatMap((step) =>
        step.questions.map((question) => {
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

          return {
            question: question.question,
            hasSelection: selectedAnswers.length > 0,
            answers: selectedAnswers.map((answer) => answer.label),
          }
        })
      ),
    ]

    return (
      <div className="space-y-6 rounded-3xl border border-border/80 bg-card/95 p-8 shadow-lg">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Review your selections</h2>
          <p className="text-sm text-muted-foreground">
            Adjust anything before we create your instruction files.
          </p>
        </div>

        <div className="space-y-3">
          {summary.map((entry, index) => (
            <div
              key={`${entry.question}-${index}`}
              className="rounded-2xl border border-border/70 bg-background/90 p-5"
            >
              <p className="text-sm font-medium text-muted-foreground">{entry.question}</p>
              {entry.hasSelection ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                  {entry.answers.map((answer) => (
                    <li key={answer}>{answer}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-base font-semibold text-foreground">No selection</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={goToPrevious}>
            Back to questions
          </Button>
          <Button onClick={() => void generateInstructionsFile()} disabled={isGenerating}>
            {isGenerating ? 'Generating...' : 'Generate My Instructions'}
          </Button>
        </div>
      </div>
    )
  }

  const questionNumber = wizardSteps
    .slice(0, currentStepIndex)
    .reduce((count, step) => count + step.questions.length, 0) + currentQuestionIndex + 1

  const isChangeFileConfirmation = pendingConfirmation === "change-file"
  const confirmationTitle = isChangeFileConfirmation ? "Change file?" : "Start over?"
  const confirmationDescription = isChangeFileConfirmation
    ? "Switching files will clear all of your current selections. Are you sure you want to continue?"
    : "This will clear all of your current selections. Are you sure you want to continue?"
  const confirmationConfirmLabel = isChangeFileConfirmation ? "Change File" : "Reset Wizard"

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
        renderCompletion()
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

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {currentQuestion.answers.map((answer) => {
              const iconDescriptor = getIconDescriptor(answer.icon ?? answer.value)
              const iconHex = iconDescriptor
                ? iconColorOverrides[iconDescriptor.slug] ?? iconDescriptor.hex
                : undefined
                const iconColor = iconHex ? getAccessibleIconColor(iconHex) : undefined
                const iconBackgroundColor = iconColor ? hexToRgba(iconColor, 0.18) : null
                const iconRingColor = iconColor ? hexToRgba(iconColor, 0.32) : null
                const fallbackInitials = answer.label
                  .split(" ")
                  .map((part) => part.charAt(0))
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()
                const iconElement = iconDescriptor ? (
                  <span
                    aria-hidden
                    className={`flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground ring-1 ring-border/40${iconColor ? "" : " bg-secondary/40"}`}
                    style={{
                      color: iconColor,
                      backgroundColor: iconBackgroundColor ?? undefined,
                      boxShadow: iconRingColor ? `inset 0 0 0 1px ${iconRingColor}` : undefined,
                    }}
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center text-current [&>svg]:h-full [&>svg]:w-full"
                      style={{ color: iconColor }}
                      dangerouslySetInnerHTML={{ __html: iconDescriptor.markup }}
                    />
                  </span>
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border/40">
                    {fallbackInitials}
                  </span>
                )

                const hasTooltipContent = Boolean(
                  (answer.infoLines && answer.infoLines.length > 0) ||
                  answer.example ||
                  (answer.tags && answer.tags.length > 0) ||
                  answer.docs
                )

                return (
                  <InstructionsAnswerCard
                    key={answer.value}
                    onClick={() => {
                      void handleAnswerClick(answer)
                    }}
                    label={answer.label}
                    iconElement={iconElement}
                    hasTooltipContent={hasTooltipContent}
                    infoLines={answer.infoLines}
                    example={answer.example}
                    tags={answer.tags}
                    docs={answer.docs}
                    selected={isAnswerSelected(answer.value)}
                    disabled={answer.disabled}
                    disabledLabel={answer.disabledLabel}
                  />
                )
              })}
          </div>

          <div className="mt-6 flex items-center justify-end">
            <div className="text-xs text-muted-foreground">
              Question {questionNumber} of {totalQuestions}
            </div>
          </div>
        </section>
      )}

      {pendingConfirmation ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-2xl">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground">{confirmationTitle}</h3>
              <p className="text-sm text-muted-foreground">{confirmationDescription}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="ghost" onClick={cancelPendingConfirmation}>
                Keep My Answers
              </Button>
              <Button variant="destructive" onClick={confirmPendingConfirmation}>
                {confirmationConfirmLabel}
              </Button>
            </div>
          </div>
        </div>
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
