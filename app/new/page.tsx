"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { InstructionsWizard } from "@/components/instructions-wizard"
import { AnimatedBackground } from "@/components/AnimatedBackground"
import { getHomeMainClasses } from "@/lib/utils"
import { ANALYTICS_EVENTS } from "@/lib/analytics-events"
import { track } from "@/lib/mixpanel"
import type { DataQuestionSource, FileOutputConfig } from "@/types/wizard"
import { Github } from "lucide-react"
import Link from "next/link"

import filesData from "@/data/files.json"
import { buildFileOptionsFromQuestion } from "@/lib/wizard-utils"

const fileQuestionSet = filesData as DataQuestionSource[]
const fileQuestion = fileQuestionSet[0] ?? null
const fileOptionsFromData = buildFileOptionsFromQuestion(fileQuestion)

export default function NewInstructionsPage() {
  const [showWizard, setShowWizard] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const fileOptions = useMemo(() => fileOptionsFromData, [])

  const handleFileCtaClick = (file: FileOutputConfig) => {
    setSelectedFileId(file.id)
    setShowWizard(true)
    track(ANALYTICS_EVENTS.CREATE_INSTRUCTIONS_FILE, {
      fileId: file.id,
      fileLabel: file.label,
    })
  }

  const handleWizardClose = () => {
    setShowWizard(false)
    setSelectedFileId(null)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Top utility bar */}
        <div
          className={`absolute inset-x-0 top-4 flex items-center px-6 sm:px-8 lg:px-12 ${showWizard ? "justify-end" : "justify-between"}`}
        >
          {!showWizard ? (
            <>
              <Link href="/" className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
                DevContext
              </Link>
              <Link href="https://github.com/spivx/devcontext" target="_blank">
                <Button variant="outline" size="sm">
                  <Github className="mr-2 h-4 w-4" />
                  GitHub
                </Button>
              </Link>
            </>
          ) : (
            <Link href="https://github.com/spivx/devcontext" target="_blank">
              <Button variant="outline" size="sm">
                <Github className="mr-2 h-4 w-4" />
                GitHub
              </Button>
            </Link>
          )}
        </div>

        {/* Hero Section */}
        <main className={getHomeMainClasses(showWizard)}>
          {showWizard && selectedFileId ? (
            <InstructionsWizard selectedFileId={selectedFileId} onClose={handleWizardClose} />
          ) : (
            <>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-3xl font-bold">Start a new instructions project</h1>
                  <p className="mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                    Choose the file preset that matches what you need. The wizard will open with targeted questions and save progress as you go.
                  </p>
                  <div className="mx-auto max-w-2xl text-left text-sm text-muted-foreground/90 md:text-base">
                    <ul className="list-disc space-y-2 pl-5">
                      <li>Pick a preset to load stack, architecture, and workflow prompts.</li>
                      <li>Answer or skip questions — you can revisit any step before exporting.</li>
                      <li>Download the generated file once every section shows as complete.</li>
                    </ul>
                  </div>
                </div>

                {/* File type CTAs */}
                <div className="pt-6">
                  <div className="flex flex-wrap items-center justify-center gap-5">
                    {fileOptions.map((file) => {
                      return (
                        <button
                          key={file.id}
                          type="button"
                          className="group inline-flex h-32 w-32 items-center justify-center rounded-full border border-border/60 bg-gradient-to-br from-card/95 via-card/90 to-card/80 px-6 text-sm font-medium text-foreground text-center shadow-sm ring-offset-background transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
                          onClick={() => handleFileCtaClick(file)}
                          aria-label={`Create ${file.label}`}
                        >
                          <span className="break-words text-sm font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-primary/90">
                            {file.filename ?? file.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
