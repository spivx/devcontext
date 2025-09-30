import Link from "next/link"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import stacksData from "@/data/stacks.json"
import type { DataQuestionSource } from "@/types/wizard"

const stackQuestionSet = stacksData as DataQuestionSource[]
const stackQuestion = stackQuestionSet[0]
const stackAnswers = stackQuestion?.answers ?? []

const STACK_PAGE_DETAILS: Record<string, { title: string; description: string; highlights: string[]; docsNote?: string }> = {
  react: {
    title: "React instructions file",
    description:
      "Ship consistent React instructions that cover hooks usage, component structures, and testing expectations before you open the wizard.",
    highlights: [
      "Bundle instructions for hooks, components, and state tooling",
      "Document styling decisions across Tailwind or CSS Modules",
      "Share testing policies with Jest and React Testing Library",
    ],
  },
  nextjs: {
    title: "Next.js instructions file",
    description: "Clarify App Router patterns, rendering modes, and data fetching strategies for your Next.js project.",
    highlights: [
      "Capture SSR, SSG, or ISR defaults for routes",
      "Explain data fetching via server actions or route handlers",
      "Align styling and component conventions across the monorepo",
    ],
  },
  angular: {
    title: "Angular instructions file",
    description: "Outline Angular module structure, RxJS usage, and testing defaults for teams shipping with Angular.",
    highlights: [
      "Define standalone components vs. NgModule structure",
      "Document reactive forms, signals, and service patterns",
      "Capture Jest or Karma coverage expectations",
    ],
  },
  vue: {
    title: "Vue instructions file",
    description: "Guide your team on Composition API, Pinia state, and the Vue testing stack before exporting guidance.",
    highlights: [
      "Document whether components use the Composition or Options API",
      "Agree on Pinia, Vuex, or lightweight store helpers",
      "Share styling choices from SFC scoped CSS to Tailwind",
    ],
  },
  nuxt: {
    title: "Nuxt instructions file",
    description: "Capture Nuxt-specific rendering, data fetching, and deployment strategies to feed into AI assistants.",
    highlights: [
      "Set expectations for SSR, SSG, or hybrid rendering",
      "List how you use runtime config, server routes, and Nitro",
      "Clarify deployment adapters whether Vercel, Netlify, or custom",
    ],
  },
  svelte: {
    title: "Svelte instructions file",
    description: "Align on SvelteKit tooling, store patterns, and styling so generated instructions match your stack.",
    highlights: [
      "Capture whether you build with SvelteKit or bare Vite",
      "Explain store usage and when to reach for external libs",
      "Define styling guidance across scoped CSS or Tailwind",
    ],
  },
  astro: {
    title: "Astro instructions file",
    description: "Describe islands architecture, content collections, and deployment workflows for Astro projects.",
    highlights: [
      "Identify which integration (React, Vue, Svelte) powers islands",
      "Explain your rendering defaults and revalidation windows",
      "Document CMS or content-collection structure for writers",
    ],
  },
  remix: {
    title: "Remix instructions file",
    description: "Share data loader patterns, runtime choices, and styling so AI agents stay true to your Remix app.",
    highlights: [
      "Capture whether loaders, resource routes, or client fetch power data",
      "Document hosting choices like Vercel, Fly.io, or Express",
      "Signal styling conventions across Tailwind or CSS Modules",
    ],
  },
  python: {
    title: "Python instructions file",
    description: "Detail your Python framework, typing policy, and packaging so Copilot and agents stay in sync.",
    highlights: [
      "State whether FastAPI, Django, or Flask powers the API",
      "Explain typing expectations and lint tooling like Ruff",
      "Document package and testing workflows across Poetry or pytest",
    ],
    docsNote: "Need a framework not listed? Pick Python, then document it in the first question.",
  },
}

export function generateStaticParams() {
  return stackAnswers
    .filter((answer) => typeof answer.value === "string" && answer.value.length > 0)
    .map((answer) => ({ stack: answer.value }))
}

export function generateMetadata({ params }: { params: { stack: string } }): Metadata {
  const slug = params.stack.toLowerCase()
  const stackEntry = stackAnswers.find((answer) => answer.value === slug)

  if (!stackEntry) {
    return {
      title: "DevContext instructions",
      description: "Generate clear AI assistant instructions tailored to your framework.",
    }
  }

  const details = STACK_PAGE_DETAILS[slug]
  const title = details ? `${details.title} | DevContext` : `${stackEntry.label} instructions file | DevContext`
  const description = details?.description ?? `Create an instructions file for ${stackEntry.label} with DevContext.`

  return {
    title,
    description,
    alternates: {
      canonical: `https://devcontext.xyz/stacks/${slug}`,
    },
  }
}

export default function StackLandingPage({ params }: { params: { stack: string } }) {
  const slug = params.stack.toLowerCase()
  const stackEntry = stackAnswers.find((answer) => answer.value === slug)

  if (!stackEntry) {
    notFound()
  }

  const details = STACK_PAGE_DETAILS[slug]
  const highlights = details?.highlights ?? []
  const pageTitle = details?.title ?? `${stackEntry.label} instructions file`
  const description = details?.description ?? `Start a ${stackEntry.label} instructions wizard with DevContext.`
  const targetUrl = `/new?stack=${slug}`

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-6 py-16 text-foreground">
      <header className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stack presets</p>
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">{pageTitle}</h1>
        <p className="text-base text-muted-foreground md:text-lg">{description}</p>
        {stackEntry.docs ? (
          <p className="text-sm text-muted-foreground">
            Source docs: {" "}
            <a href={stackEntry.docs} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
              {stackEntry.label} documentation
            </a>
          </p>
        ) : null}
        {details?.docsNote ? (
          <p className="text-sm text-muted-foreground">{details.docsNote}</p>
        ) : null}
      </header>

      {highlights.length > 0 ? (
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold tracking-tight">What this preset covers</h2>
          <ul className="list-disc space-y-2 pl-6 text-sm text-muted-foreground">
            {highlights.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Ready to build your instructions?</h2>
        <p className="text-sm text-muted-foreground">
          Launch the DevContext wizard with {stackEntry.label} pre-selected. You can review every question, accept defaults, and export a
          stack-aware instructions file when each section is complete.
        </p>
        <div>
          <Link
            href={targetUrl}
            className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:translate-y-[1px] hover:bg-primary/90"
          >
            Start the {stackEntry.label} wizard
          </Link>
        </div>
      </div>
    </main>
  )
}
