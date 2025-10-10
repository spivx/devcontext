"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import FinalOutputView from "@/components/final-output-view"
import { generateInstructions } from "@/lib/instructions-api"
import { buildCompletionSummary } from "@/lib/wizard-summary"
import { serializeWizardResponses } from "@/lib/wizard-response"
import {
  STACK_QUESTION_ID,
  stackQuestion,
  getFileOptions,
  getFileSummaryQuestion,
} from "@/lib/wizard-config"
import { loadWizardState, persistWizardState } from "@/lib/wizard-storage"
import { buildDefaultSummaryData, buildStepsForStack } from "@/lib/wizard-summary-data"
import type { FileOutputConfig, Responses, WizardQuestion, WizardAnswer, WizardStep } from "@/types/wizard"
import type { GeneratedFileResult } from "@/types/output"
import { WizardEditAnswerDialog } from "@/components/wizard-edit-answer-dialog"

const fileOptions = getFileOptions()
const fileSummaryQuestion = getFileSummaryQuestion()
type StackSummaryPageProps = {
  stackId: string | null
  mode: "default" | "user"
}

export function StackSummaryPage({ stackId, mode }: StackSummaryPageProps) {
  const [wizardSteps, setWizardSteps] = useState<WizardStep[] | null>(null)
  const [responses, setResponses] = useState<Responses | null>(null)
  const [autoFilledMap, setAutoFilledMap] = useState<Record<string, boolean>>({})
  const [stackLabel, setStackLabel] = useState<string | null>(null)
  const [autoFillNotice, setAutoFillNotice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [generatedFile, setGeneratedFile] = useState<GeneratedFileResult | null>(null)
  const [isGeneratingMap, setIsGeneratingMap] = useState<Record<string, boolean>>({})
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)

  useEffect(() => {
    if (!stackId) {
      setErrorMessage("Select a stack to review your summary.")
      setIsLoading(false)
      return
    }

    let isActive = true

    const loadSummaryData = async () => {
      setIsLoading(true)
      setErrorMessage(null)
      try {
        if (mode === "default") {
          const { steps, responses: defaultResponses, autoFilledMap: defaultsMap, stackLabel: label } =
            await buildDefaultSummaryData(stackId)

          if (!isActive) {
            return
          }

          setWizardSteps(steps)
          setResponses(defaultResponses)
          setAutoFilledMap(defaultsMap)
          setStackLabel(label)
          setAutoFillNotice("We applied the recommended defaults for you. Tweak any section before generating.")

          persistWizardState({
            stackId,
            stackLabel: label,
            responses: defaultResponses,
            autoFilledMap: defaultsMap,
            updatedAt: Date.now(),
          })
        } else {
          const { steps, stackLabel: computedLabel } = await buildStepsForStack(stackId)

          if (!isActive) {
            return
          }

          const storedState = loadWizardState(stackId)

          if (!storedState) {
            setWizardSteps(steps)
            setResponses(null)
            setAutoFilledMap({})
            setStackLabel(computedLabel)
            setAutoFillNotice(null)
            setErrorMessage("We couldn't find saved answers for this stack. Complete the wizard to generate your own summary.")
            return
          }

          const normalizedResponses: Responses = {
            ...storedState.responses,
            [STACK_QUESTION_ID]: stackId,
          }

          setWizardSteps(steps)
          setResponses(normalizedResponses)
          setAutoFilledMap(storedState.autoFilledMap ?? {})
          setStackLabel(storedState.stackLabel ?? computedLabel)
          setAutoFillNotice(null)
        }
      } catch (error) {
        console.error(`Unable to prepare summary for stack "${stackId}"`, error)
        if (isActive) {
          setErrorMessage("We couldn't load the summary for this stack. Try selecting it again from the wizard.")
        }
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadSummaryData()

    return () => {
      isActive = false
    }
  }, [stackId, mode])

  const summaryEntries = useMemo(() => {
    if (!wizardSteps || !responses) {
      return []
    }

    return buildCompletionSummary(
      fileSummaryQuestion,
      null,
      null,
      wizardSteps,
      responses,
      autoFilledMap,
      false
    )
  }, [wizardSteps, responses, autoFilledMap])

  const handleGenerate = useCallback(
    async (fileOption: FileOutputConfig) => {
      if (!wizardSteps || !responses || !stackId) {
        return
      }

      setIsGeneratingMap((prev) => ({ ...prev, [fileOption.id]: true }))
      setGeneratedFile(null)

      try {
        const payload = serializeWizardResponses(wizardSteps, responses, fileOption.id)

        const result = await generateInstructions({
          stackSegment: stackId,
          outputFileId: fileOption.id,
          responses: payload,
          fileFormat: fileOption.format,
        })

        if (result) {
          setGeneratedFile(result)
        }
      } catch (error) {
        console.error("Error generating instructions", error)
        setErrorMessage("We hit a snag generating that file. Please try again.")
      } finally {
        setIsGeneratingMap((prev) => ({ ...prev, [fileOption.id]: false }))
      }
    },
    [wizardSteps, responses, stackId]
  )

  const summaryHeader = stackLabel ??
    (stackQuestion?.answers.find((answer) => answer.value === stackId)?.label ?? stackId ?? "Your stack")

  const questionLookup = useMemo(() => {
    const map: Record<string, WizardQuestion> = {}
    wizardSteps?.forEach((step) => {
      step.questions.forEach((question) => {
        map[question.id] = question
      })
    })
    return map
  }, [wizardSteps])

  const handleEditClick = (questionId: string) => {
    setEditingQuestionId(questionId)
  }

  const handleCloseEdit = () => {
    setEditingQuestionId(null)
  }

  const applyAnswerUpdate = useCallback(
    (question: WizardQuestion, answer: WizardAnswer) => {
      const currentResponses: Responses = responses ? { ...responses } : {}
      const currentAutoMap = { ...autoFilledMap }
      const prevValue = currentResponses[question.id]
      let nextValue: Responses[keyof Responses] | undefined

      if (question.allowMultiple) {
        const prevArray = Array.isArray(prevValue) ? prevValue : []
        if (prevArray.includes(answer.value)) {
          const filtered = prevArray.filter((item) => item !== answer.value)
          nextValue = filtered.length > 0 ? filtered : undefined
        } else {
          nextValue = [...prevArray, answer.value]
        }
      } else {
        nextValue = prevValue === answer.value ? undefined : answer.value
      }

      if (nextValue === undefined || (Array.isArray(nextValue) && nextValue.length === 0)) {
        delete currentResponses[question.id]
      } else {
        currentResponses[question.id] = nextValue
      }

      delete currentAutoMap[question.id]
      setResponses(currentResponses)
      setAutoFilledMap(currentAutoMap)
      setAutoFillNotice(null)

      if (stackId) {
        persistWizardState({
          stackId,
          stackLabel: stackLabel ?? summaryHeader,
          responses: currentResponses,
          autoFilledMap: currentAutoMap,
          updatedAt: Date.now(),
        })
      }

      if (!question.allowMultiple) {
        handleCloseEdit()
      }
    },
    [responses, autoFilledMap, stackId, stackLabel, summaryHeader]
  )

  if (isLoading) {
    return (
      <div
        className="flex flex-1 items-center justify-center text-sm text-muted-foreground"
        data-testid="stack-summary-loading"
      >
        Preparing your summary…
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div
        className="flex flex-1 flex-col items-center justify-center gap-4 text-center"
        data-testid="stack-summary-error"
      >
        <p className="text-base text-muted-foreground">{errorMessage}</p>
        <Button asChild>
          <Link href={stackId ? `/new/stack/${stackId}` : "/new/stack"}>Back to wizard</Link>
        </Button>
      </div>
    )
  }

  if (!responses || !wizardSteps || !stackId) {
    return null
  }

  return (
    <div
      className="mx-auto flex w-full max-w-5xl flex-col gap-6"
      data-testid="stack-summary-page"
    >
      <section className="rounded-3xl border border-border/80 bg-card/95 p-8 shadow-lg">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Generate context files</h2>
            <p className="text-sm text-muted-foreground">
              Pick the output format you need. Each option uses the summary on this page.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {fileOptions.map((file) => {
              const isGenerating = Boolean(isGeneratingMap[file.id])
              return (
                <Button
                  key={file.id}
                  onClick={() => void handleGenerate(file)}
                  disabled={isGenerating}
                  className="flex h-[38px] min-w-[190px] items-center justify-center rounded-full px-6 py-0 text-base leading-none shadow-lg shadow-primary/20"
                >
                  <span className="text-sm font-semibold text-foreground">
                    {isGenerating ? `Generating ${file.filename}…` : `Generate ${file.filename}`}
                  </span>
                </Button>
              )
            })}
          </div>
        </div>
      </section>

      <div className="rounded-3xl border border-border/80 bg-card/95 p-8 shadow-lg">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">{summaryHeader} instructions overview</h1>
            <p className="text-sm text-muted-foreground">
              Share this page to sync on conventions, or jump back into the wizard to fine-tune answers.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href={`/new/stack/${stackId}`}>
                Choose different options
              </Link>
            </Button>
          </div>
        </div>
        {autoFillNotice ? (
          <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
            {autoFillNotice}
          </div>
        ) : null}
      </div>

      <section className="space-y-4 rounded-3xl border border-border/80 bg-card/95 p-8 shadow-lg">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Selections in this summary</h2>
          <p className="text-sm text-muted-foreground">
            Reopen any question from the wizard to change these selections.
          </p>
        </div>
        <div className="space-y-3">
          {summaryEntries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-2xl border border-border/70 bg-background/90 p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="text-sm font-medium text-muted-foreground">{entry.question}</p>
              </div>
              {entry.hasSelection ? (
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                  {entry.answers.map((answer) => (
                    <li key={answer}>
                      <div className="flex items-center gap-2">
                        <span>{answer}</span>
                        {!entry.isReadOnlyOnSummary && stackId ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="px-2 text-xs font-semibold text-primary hover:text-primary"
                            onClick={() => handleEditClick(entry.id)}
                          >
                            Edit
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-base font-semibold text-foreground">
                  <span>No selection</span>
                  {!entry.isReadOnlyOnSummary && stackId ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="px-2 text-xs font-semibold text-primary hover:text-primary"
                      onClick={() => handleEditClick(entry.id)}
                    >
                      Edit
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {editingQuestionId ? (
        (() => {
          const editingQuestion = questionLookup[editingQuestionId]
          if (!editingQuestion) {
            return null
          }
          const currentValue = responses ? responses[editingQuestion.id] : undefined
          return (
            <WizardEditAnswerDialog
              question={editingQuestion}
              value={currentValue}
              onAnswerSelect={(answer) => applyAnswerUpdate(editingQuestion, answer)}
              onClose={handleCloseEdit}
            />
          )
        })()
      ) : null}

      {generatedFile ? (
        <FinalOutputView
          fileName={generatedFile.fileName}
          fileContent={generatedFile.fileContent}
          mimeType={generatedFile.mimeType}
          onClose={() => setGeneratedFile(null)}
        />
      ) : null}
    </div>
  )
}
