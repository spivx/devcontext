"use client"

import { useState, type FormEvent } from "react"

import { motion } from "framer-motion"
import { ArrowRight, Github } from "lucide-react"
import { useRouter } from "next/navigation"

import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { normalizeGitHubRepoInput } from "@/lib/github"
import stacksData from "@/data/stacks.json"
import type { DataQuestionSource } from "@/types/wizard"
import { getIconDescriptor, iconColorOverrides, getAccessibleIconColor, hexToRgba, getFallbackInitials } from "@/lib/icon-utils"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { ease: "easeOut", duration: 0.7 } },
}

const stackQuestion = (stacksData as DataQuestionSource[])[0]
const stackAnswers = stackQuestion?.answers ?? []
const selectionCardClass =
  "rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm text-left"

export function Hero() {
  const router = useRouter()
  const [githubRepo, setGithubRepo] = useState("")
  const popularStacks = stackAnswers.slice(0, 3)

  const handleMoreStacks = () => {
    router.push(`/new/stack`)
  }

  const handleStackClick = (stackValue: string) => {
    router.push(`/new/stack/${stackValue}/default/summary`)
  }

  const handleGithubSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = githubRepo.trim()
    if (!trimmed) {
      return
    }

    const normalized = normalizeGitHubRepoInput(trimmed)

    if (normalized) {
      router.push(`/existing/${encodeURIComponent(normalized)}`)
      return
    }

    router.push(`/existing`)
  }

  return (
    <motion.section
      className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 px-4 pb-24 pt-32 text-center lg:px-0"
      variants={containerVariants}
      initial="hidden"
      animate="show"
      data-testid="hero-section"
    >
      <motion.div className="space-y-10" variants={itemVariants}>
        <motion.div
          className="mx-auto w-full max-w-[420px] md:max-w-[520px]"
          variants={itemVariants}
        >
          <div className="origin-center scale-100 md:scale-[1.32]">
            <Logo width={700} height={700} />
          </div>
        </motion.div>

        <motion.span
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground backdrop-blur"
          variants={itemVariants}
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          Guided setup for AI coding guidelines.
        </motion.span>

        <motion.h1
          className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-tight"
          variants={itemVariants}
        >
          Repo-aware AI coding guidelines assistant for Copilot &amp; Cursor
        </motion.h1>

        <motion.p
          className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-lg"
          variants={itemVariants}
        >
          Generate AI-ready Copilot instructions, Cursor rules, and developer onboarding docs in minutes—start from curated stacks or drop a repo into the GitHub analyzer.
        </motion.p>



        <motion.div className="mx-auto w-full max-w-4xl text-left" variants={itemVariants}>
          <div className="grid gap-5 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
            <div className={`${selectionCardClass} flex flex-col gap-4`}>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Start fast with popular stacks
              </p>
              <p className="text-sm text-muted-foreground">
                Pick a curated quickstart and we&apos;ll pre-fill the wizard with stack defaults and suggested AI guardrails.
              </p>
              <div className="flex flex-wrap gap-3">
                {popularStacks.map((stack) => {
                  const descriptor = getIconDescriptor(stack.icon ?? stack.value)
                  const iconHex = descriptor ? iconColorOverrides[descriptor.slug] ?? descriptor.hex : undefined
                  const iconColor = iconHex ? getAccessibleIconColor(iconHex) : undefined
                  const iconBackground = iconColor ? hexToRgba(iconColor, 0.18) ?? undefined : undefined
                  const iconRing = iconColor ? hexToRgba(iconColor, 0.32) ?? undefined : undefined
                  const initials = getFallbackInitials(stack.label)

                  return (
                    <button
                      key={stack.value}
                      type="button"
                      onClick={() => handleStackClick(stack.value)}
                      className="group inline-flex items-center gap-3 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                      data-testid={`hero-stack-${stack.value}`}
                    >
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full ring-1 ring-border/40"
                        style={{
                          color: iconColor,
                          backgroundColor: iconBackground,
                          boxShadow: iconRing ? `inset 0 0 0 1px ${iconRing}` : undefined,
                        }}
                        aria-hidden
                      >
                        {descriptor ? (
                          <span
                            className="inline-flex h-5 w-5 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
                            style={{ color: iconColor ?? "inherit" }}
                            dangerouslySetInnerHTML={{ __html: descriptor.markup }}
                          />
                        ) : (
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {initials}
                          </span>
                        )}
                      </span>
                      <span className="flex items-center gap-2">
                        {stack.label}
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition group-hover:text-primary" />
                      </span>
                    </button>
                  )
                })}

                <button
                  type="button"
                  onClick={handleMoreStacks}
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  data-testid="hero-more-stacks"
                >
                  More stacks
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <span className="sr-only">Choose one entry point</span>
              <span
                aria-hidden
                className="text-xs font-semibold uppercase tracking-[0.6em] text-muted-foreground"
              >
                OR
              </span>
            </div>

            <form
              onSubmit={handleGithubSubmit}
              className={`${selectionCardClass} flex flex-col gap-4`}
              data-testid="hero-scan-form"
            >
              <div className="space-y-2 text-left">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Scan a GitHub repository
                </p>
                <p className="text-sm text-muted-foreground">
                  Paste an owner/repo or URL and we&apos;ll prefill the wizard with detected tech, tooling, and guardrail suggestions.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={githubRepo}
                  onChange={(event) => setGithubRepo(event.target.value)}
                  placeholder="github.com/owner/repo"
                  className="w-full rounded-xl border border-border/70 bg-background px-4 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:min-w-[260px]"
                  data-testid="hero-repo-input"
                />
                <Button type="submit" size="sm" className="gap-2" data-testid="hero-scan-button">
                  Scan repo
                  <Github className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
