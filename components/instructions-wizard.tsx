"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowLeft, Check, ChevronRight, ExternalLink, Info } from "lucide-react"
import * as simpleIcons from "simple-icons"
import type { SimpleIcon } from "simple-icons"

import rawIdes from "@/data/ides.json"
import rawFrameworks from "@/data/frameworks.json"

type IdeConfig = {
  id: string
  label: string
  icon?: string
  enabled?: boolean
  outputFiles?: string[]
  docs?: string
}

type FrameworkConfig = {
  id: string
  label: string
  icon?: string
  enabled?: boolean
  docs?: string
}

type FrameworkAnswerSource = {
  value: string
  label: string
  icon?: string
  example?: string
  pros?: string[]
  cons?: string[]
  docs?: string
}

type FrameworkQuestionSource = {
  id: string
  question: string
  allowMultiple?: boolean
  answers: FrameworkAnswerSource[]
}

type WizardAnswer = {
  value: string
  label: string
  icon?: string
  example?: string
  infoLines?: string[]
  tags?: string[]
  isDefault?: boolean
  disabled?: boolean
  disabledLabel?: string
  docs?: string
}

type WizardQuestion = {
  id: string
  question: string
  allowMultiple?: boolean
  answers: WizardAnswer[]
}

type WizardStep = {
  id: string
  title: string
  questions: WizardQuestion[]
}

type InstructionsWizardProps = {
  onClose?: () => void
}

type Responses = Record<string, string | string[] | null | undefined>

const FRAMEWORK_STEP_ID = "frameworks"
const FRAMEWORK_QUESTION_ID = "frameworkSelection"

const iconSlugOverrides: Record<string, string> = {
  vscode: "microsoft",
  visualstudiocode: "microsoft",
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

const idesStep: WizardStep = {
  id: "ides",
  title: "Choose Your IDE",
  questions: [
    {
      id: "preferredIdes",
      question: "Which IDEs should we prepare instructions for?",
      allowMultiple: true,
      answers: (rawIdes as IdeConfig[]).map((ide) => ({
        value: ide.id,
        label: ide.label,
        icon: ide.icon,
        example:
          ide.outputFiles && ide.outputFiles.length > 0
            ? `We'll generate: ${ide.outputFiles.join(", ")}`
            : undefined,
        infoLines: ide.enabled ? ["Enabled by default"] : undefined,
        tags: ide.outputFiles,
        isDefault: ide.enabled,
        disabled: ide.enabled === false,
        disabledLabel: ide.enabled === false ? "Soon" : undefined,
        docs: ide.docs,
      })),
    },
  ],
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
      })),
    },
  ],
}

export function InstructionsWizard({ onClose }: InstructionsWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Responses>({})
  const [dynamicSteps, setDynamicSteps] = useState<WizardStep[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [selectedFramework, setSelectedFramework] = useState<string | null>(null)
  const [isLoadingFrameworkQuestions, setIsLoadingFrameworkQuestions] = useState(false)

  const baseSteps = useMemo(() => [idesStep, frameworksStep], [])
  const wizardSteps = useMemo(() => [...baseSteps, ...dynamicSteps], [baseSteps, dynamicSteps])

  const currentStep = wizardSteps[currentStepIndex]
  const currentQuestion = currentStep?.questions[currentQuestionIndex]

  const totalQuestions = useMemo(
    () => wizardSteps.reduce((count, step) => count + step.questions.length, 0),
    [wizardSteps]
  )

  const answeredQuestionsCount = useMemo(() => {
    return wizardSteps.reduce((count, step) => {
      return (
        count +
        step.questions.filter((question) => {
          const value = responses[question.id]
          if (question.allowMultiple) {
            return Array.isArray(value) && value.length > 0
          }
          return value !== undefined && value !== null
        }).length
      )
    }, 0)
  }, [responses, wizardSteps])

  if (!currentStep || !currentQuestion) {
    return null
  }

  const currentAnswerValue = responses[currentQuestion.id]

  const isAnswerSelected = (value: string) => {
    if (currentQuestion.allowMultiple) {
      return Array.isArray(currentAnswerValue) && currentAnswerValue.includes(value)
    }

    return currentAnswerValue === value
  }

  const toggleAnswer = (value: string) => {
    setResponses((prev) => {
      const previousValue = prev[currentQuestion.id]

      if (currentQuestion.allowMultiple) {
        const values = Array.isArray(previousValue) ? previousValue : []
        const exists = values.includes(value)
        const nextValues = exists ? values.filter((item) => item !== value) : [...values, value]
        return {
          ...prev,
          [currentQuestion.id]: nextValues,
        }
      }

      return {
        ...prev,
        [currentQuestion.id]: previousValue === value ? undefined : value,
      }
    })
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

  const goToNext = () => {
    if (currentQuestion.allowMultiple) {
      if (!Array.isArray(currentAnswerValue) || currentAnswerValue.length === 0) {
        return
      }
    } else if (currentAnswerValue === undefined || currentAnswerValue === null) {
      return
    }

    advanceToNextQuestion()
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
    setIsLoadingFrameworkQuestions(true)
    try {
      const questionsModule = await import(`@/data/questions/${frameworkId}.json`)
      const questionsData = (questionsModule.default ?? questionsModule) as FrameworkQuestionSource[]

      const mappedQuestions: WizardQuestion[] = questionsData.map((question) => ({
        id: question.id,
        question: question.question,
        allowMultiple: question.allowMultiple,
        answers: question.answers.map((answer) => {
          const infoLines: string[] = []
          if (answer.pros && answer.pros.length > 0) {
            infoLines.push(`Pros: ${answer.pros.join(", ")}`)
          }
          if (answer.cons && answer.cons.length > 0) {
            infoLines.push(`Cons: ${answer.cons.join(", ")}`)
          }

          return {
            value: answer.value,
            label: answer.label,
            icon: answer.icon,
            example: answer.example,
            infoLines: infoLines.length > 0 ? infoLines : undefined,
            docs: answer.docs,
          }
        }),
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

      setSelectedFramework(frameworkId)
      setCurrentStepIndex(baseSteps.length)
      setCurrentQuestionIndex(0)
      setIsComplete(false)
    } catch (error) {
      console.error(`Unable to load questions for framework "${frameworkId}"`, error)
      setDynamicSteps([])
      setSelectedFramework(null)
    } finally {
      setIsLoadingFrameworkQuestions(false)
    }
  }

  const handleAnswerClick = async (answer: WizardAnswer) => {
    if (answer.disabled) {
      return
    }

    if (!currentQuestion.allowMultiple && currentAnswerValue === answer.value) {
      toggleAnswer(answer.value)
      if (currentQuestion.id === FRAMEWORK_QUESTION_ID) {
        setSelectedFramework(null)
        setDynamicSteps([])
      }
      return
    }

    toggleAnswer(answer.value)

    if (currentQuestion.id === FRAMEWORK_QUESTION_ID) {
      await loadFrameworkQuestions(answer.value, answer.label)
    }
  }

  const skipQuestion = () => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: null,
    }))

    if (currentQuestion.id === FRAMEWORK_QUESTION_ID) {
      setDynamicSteps([])
      setSelectedFramework(null)
    }

    advanceToNextQuestion()
  }

  const resetWizard = () => {
    setResponses({})
    setDynamicSteps([])
    setSelectedFramework(null)
    setCurrentStepIndex(0)
    setCurrentQuestionIndex(0)
    setIsComplete(false)
  }

  const renderCompletion = () => {
    const summary = wizardSteps.flatMap((step) =>
      step.questions.map((question) => {
        const value = responses[question.id]
        const selectedAnswers = question.answers.filter((answer) => {
          if (value === null) {
            return false
          }

          if (Array.isArray(value)) {
            return value.includes(answer.value)
          }

          return value === answer.value
        })

        return {
          question: question.question,
          skipped: value === null,
          answers: selectedAnswers.map((answer) => answer.label),
        }
      })
    )

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
              {entry.skipped ? (
                <p className="mt-2 text-base font-semibold text-foreground">Skipped</p>
              ) : (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                  {entry.answers.map((answer) => (
                    <li key={answer}>{answer}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" onClick={resetWizard}>
            Start Over
          </Button>
          {onClose ? (
            <Button onClick={onClose}>
              Continue
            </Button>
          ) : null}
        </div>
      </div>
    )
  }

  const questionNumber = wizardSteps
    .slice(0, currentStepIndex)
    .reduce((count, step) => count + step.questions.length, 0) + currentQuestionIndex + 1

  const isNextDisabled = (() => {
    if (isLoadingFrameworkQuestions) {
      return true
    }

    if (currentQuestion.id === FRAMEWORK_QUESTION_ID && selectedFramework === null) {
      return true
    }

    if (currentQuestion.allowMultiple) {
      return !Array.isArray(currentAnswerValue) || currentAnswerValue.length === 0
    }

    return currentAnswerValue === undefined || currentAnswerValue === null
  })()

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      {onClose ? (
        <Button variant="ghost" onClick={onClose} className="self-start -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      ) : null}

      {isComplete ? (
        renderCompletion()
      ) : (
        <>
          <header className="flex items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold text-foreground">
              {currentQuestion.question}
            </h1>
            <Button variant="ghost" onClick={skipQuestion} className="shrink-0">
              Skip
            </Button>
          </header>

          <section className="rounded-3xl border border-border/80 bg-card/95 p-6 shadow-md">
            <div className="grid gap-3 sm:grid-cols-2">
              {currentQuestion.answers.map((answer) => {
                const normalizedIconSlug = normalizeIconSlug(answer.icon ?? answer.value)
                const simpleIconData = normalizedIconSlug
                  ? simpleIconBySlug.get(normalizedIconSlug) ?? null
                  : null
                const fallbackInitials = answer.label
                  .split(" ")
                  .map((part) => part.charAt(0))
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()

                const iconElement = simpleIconData ? (
                  <span
                    aria-hidden
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40 text-muted-foreground ring-1 ring-border/40"
                  >
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center text-current [&>svg]:h-full [&>svg]:w-full"
                      style={{ color: getAccessibleIconColor(simpleIconData.hex) }}
                      dangerouslySetInnerHTML={{ __html: getSimpleIconMarkup(simpleIconData) }}
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
                  <button
                    key={answer.value}
                    type="button"
                    onClick={() => {
                      void handleAnswerClick(answer)
                    }}
                    aria-disabled={answer.disabled}
                    className={cn(
                      "group relative flex h-full items-center justify-between rounded-2xl border border-border/60 bg-background/90 px-5 py-4 text-left transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      answer.disabled &&
                      "cursor-not-allowed opacity-60 hover:border-border/60 hover:shadow-none focus-visible:ring-0",
                      isAnswerSelected(answer.value) &&
                      !answer.disabled &&
                      "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {iconElement}
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-foreground">
                          {answer.label}
                        </span>
                        {hasTooltipContent ? (
                          <span className="relative flex items-center group/icon">
                            <Info className="h-4 w-4 cursor-pointer text-muted-foreground transition-colors group-hover/icon:text-primary" />
                            <div className="pointer-events-none absolute left-0 top-full z-20 hidden w-60 rounded-xl border border-border/70 bg-popover p-3 text-xs leading-relaxed text-popover-foreground shadow-xl transition-all duration-150 ease-out group-hover/icon:flex group-hover/icon:flex-col group-hover/icon:pointer-events-auto group-hover/icon:opacity-100 group-hover/icon:translate-y-0 opacity-0 translate-y-2">
                              {answer.infoLines?.map((line) => (
                                <span key={line} className="text-foreground">
                                  {line}
                                </span>
                              ))}
                              {answer.example ? (
                                <span className="mt-1 text-muted-foreground">{answer.example}</span>
                              ) : null}
                              {answer.tags && answer.tags.length > 0 ? (
                                <div className="mt-3 flex flex-wrap gap-1 text-[10px] uppercase tracking-wide text-muted-foreground/80">
                                  {answer.tags.map((tag) => (
                                    <span key={tag} className="rounded-full bg-muted/80 px-2 py-0.5">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              ) : null}
                              {answer.docs ? (
                                <a
                                  href={answer.docs}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                >
                                  <span>Open documentation</span>
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </a>
                              ) : null}
                            </div>
                          </span>
                        ) : null}
                        {answer.disabledLabel ? (
                          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
                            {answer.disabledLabel}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isAnswerSelected(answer.value) && !answer.disabled ? (
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <Check className="h-4 w-4" />
                        </span>
                      ) : null}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={goToPrevious}
                disabled={currentStepIndex === 0 && currentQuestionIndex === 0}
              >
                Back
              </Button>
              <div className="text-xs text-muted-foreground">
                Question {questionNumber} of {totalQuestions} · {answeredQuestionsCount} answered
              </div>
              <Button onClick={goToNext} disabled={isNextDisabled}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
