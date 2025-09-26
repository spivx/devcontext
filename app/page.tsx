"use client"

import { useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { InstructionsWizard } from "@/components/instructions-wizard"
import { getHomeMainClasses } from "@/lib/utils"
import { getFormatLabel } from "@/lib/wizard-utils"
import { ANALYTICS_EVENTS } from "@/lib/analytics-events"
import { track } from "@/lib/mixpanel"
import type { FileOutputConfig } from "@/types/wizard"
import { Github } from "lucide-react"
import Link from "next/link"

import Logo from "./../components/Logo"
import filesData from "@/data/files.json"

export default function Home() {
  const [showWizard, setShowWizard] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)

  const fileOptions = useMemo(() => {
    return (filesData as FileOutputConfig[]).filter((file) => file.enabled !== false)
  }, [])

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
    <div className="min-h-screen bg-background text-foreground">
      {/* Top utility bar */}
      <div className="absolute top-4 right-4 z-10">
        <Link href="https://github.com/spivx/devcontext" target="_blank">
          <Button variant="outline" size="sm">
            <Github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <main className={getHomeMainClasses(showWizard)}>
        {showWizard && selectedFileId ? (
          <InstructionsWizard selectedFileId={selectedFileId} onClose={handleWizardClose} />
        ) : (
          <>
            <div className="space-y-6">
              {/* Logo/Title */}
              <Logo />

              {/* Headline */}
              <h1 className="max-w-4xl text-3xl font-bold">
                Assemble Tailored AI Coding Playbooks With a Guided Wizard
              </h1>

              {/* Subheadline */}
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                Move from curated best practices to sharable files like Copilot instructions, Cursor rules, and agents.md playbooks in just a few guided steps.
              </p>

              <p className="max-w-xl text-sm text-muted-foreground/80">
                Use the wizard to generate Copilot instruction files, agents files, comprehensive instruction sets, and Cursor rules without starting from a blank page.
              </p>

              {/* File type CTAs */}
              <div className="pt-6">
                <div className="grid gap-4 md:grid-cols-2">
                  {fileOptions.map((file) => {
                    const formatLabel = getFormatLabel(file.format)
                    return (
                      <button
                        key={file.id}
                        type="button"
                        className="group relative flex w-full flex-col items-start gap-3 rounded-3xl border border-border/60 bg-card/80 p-6 text-left shadow-sm ring-offset-background transition-all hover:-translate-y-1 hover:border-primary/60 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/80"
                        onClick={() => handleFileCtaClick(file)}
                        aria-label={`Create ${file.label}`}
                      >
                        <div className="flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground/80">
                          <span className="inline-flex h-2 w-2 rounded-full bg-primary/70" aria-hidden />
                          <span>Start with</span>
                        </div>
                        <div>
                          <p className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">
                            {file.label}
                          </p>
                          {file.filename ? (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {file.filename}
                            </p>
                          ) : null}
                        </div>
                        {formatLabel ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                            {formatLabel} format
                          </span>
                        ) : null}
                        <span className="pointer-events-none absolute right-6 top-6 text-primary/60 transition-transform group-hover:translate-x-1">
                          →
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
  )
}
