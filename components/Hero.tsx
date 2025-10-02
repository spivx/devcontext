"use client"

import { useState, type FormEvent } from "react"

import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Github } from "lucide-react"
import { useRouter } from "next/navigation"

import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"
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

const featureHighlights = [
  "Copilot instructions grounded in your stack",
  "Cursor rules that mirror team conventions",
  "agents.md blueprints generated on demand",
]

const stackQuestion = (stacksData as DataQuestionSource[])[0]
const stackAnswers = stackQuestion?.answers ?? []

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

    router.push(`/existing?repo=${encodeURIComponent(trimmed)}`)
  }

  return (
    <motion.section
      className="mx-auto flex w-full max-w-6xl flex-col items-center gap-16 px-4 pb-24 pt-32 text-center lg:px-0"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div className="space-y-10" variants={itemVariants}>
        <motion.div
          className="mx-auto w-full max-w-[420px] md:max-w-[520px]"
          variants={itemVariants}
        >
          <div className="origin-center scale-[1.22] md:scale-[1.32]">
            <Logo width={700} height={700} />
          </div>
        </motion.div>

        <motion.span
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted-foreground backdrop-blur"
          variants={itemVariants}
        >
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          Less setup. Sharper AI outputs.
        </motion.span>

        <motion.h1
          className="mx-auto max-w-4xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl md:leading-tight"
          variants={itemVariants}
        >
          Build concise AI coding guardrails your team will actually use
        </motion.h1>

        <motion.p
          className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-lg"
          variants={itemVariants}
        >
          Jump in with a ready-made stack template, explore the full wizard, or drop a GitHub repo for an automatic scan.
        </motion.p>

        <motion.ul
          className="mx-auto flex max-w-3xl flex-col items-start gap-2 text-left text-sm text-muted-foreground md:flex-row md:flex-wrap md:justify-center"
          variants={itemVariants}
        >
          {featureHighlights.map((feature) => (
            <motion.li
              key={feature}
              className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/70 px-4 py-2 text-sm text-foreground shadow-sm backdrop-blur md:text-base"
              variants={itemVariants}
            >
              <CheckCircle2 className="size-4 text-primary" />
              {feature}
            </motion.li>
          ))}
        </motion.ul>

        <motion.div
          className="mx-auto w-full max-w-4xl space-y-8 text-left"
          variants={itemVariants}
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold uppercase tracking-wide text-muted-foreground">
                Start fast with popular stacks
              </h2>
              <Button variant="outline" size="sm" onClick={handleMoreStacks}>
                More stacks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
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
                    className="group flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-background/90 px-5 py-6 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                  >
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-border/40"
                      style={{
                        color: iconColor,
                        backgroundColor: iconBackground,
                        boxShadow: iconRing ? `inset 0 0 0 1px ${iconRing}` : undefined,
                      }}
                      aria-hidden
                    >
                      {descriptor ? (
                        <span
                          className="inline-flex h-6 w-6 items-center justify-center [&>svg]:h-full [&>svg]:w-full"
                          style={{ color: iconColor ?? "inherit" }}
                          dangerouslySetInnerHTML={{ __html: descriptor.markup }}
                        />
                      ) : (
                        <span className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                          {initials}
                        </span>
                      )}
                    </span>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-base font-semibold text-foreground">{stack.label}</p>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:text-primary" />
                      </div>
                      {stack.tags && stack.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 text-[10px] uppercase tracking-wide text-muted-foreground/70">
                          {stack.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full bg-muted/70 px-2 py-0.5">
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="text-sm text-muted-foreground">
                        Auto-fill recommended defaults and jump straight to the summary.
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-border/60" />
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border/60" />
          </div>

          <form
            onSubmit={handleGithubSubmit}
            className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-background/95 p-6 shadow-sm sm:flex-row sm:items-center"
          >
            <div className="flex-1 space-y-2 text-left">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Scan a GitHub repository
              </p>
              <p className="text-sm text-muted-foreground">
                Paste an owner/repo or URL and we&apos;ll prefill the wizard with detected tech and tooling.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <input
                type="text"
                value={githubRepo}
                onChange={(event) => setGithubRepo(event.target.value)}
                placeholder="github.com/owner/repo"
                className="w-full rounded-xl border border-border/70 bg-background px-4 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:min-w-[260px]"
              />
              <Button type="submit" size="sm" className="gap-2">
                Scan repo
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </motion.section>
  )
}
