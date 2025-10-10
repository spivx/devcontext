import Link from "next/link"
import type { Metadata } from "next"

import stacksData from "@/data/stacks.json"
import type { DataQuestionSource } from "@/types/wizard"
import { absoluteUrl } from "@/lib/site-metadata"

const stackQuestionSet = stacksData as DataQuestionSource[]
const stackQuestion = stackQuestionSet[0]
const stackAnswers = stackQuestion?.answers ?? []

const pageTitle = "Choose Your Stack | DevContext"
const pageDescription = "Explore framework-specific instructions flows for React, Vue, Svelte, Python, and more."
const canonicalUrl = absoluteUrl("/stacks")

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    type: "website",
  },
}

export default function StacksIndexPage() {
  return (
    <main
      className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16 text-foreground"
      data-testid="stacks-index-page"
    >
      <header className="space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm font-semibold text-foreground transition hover:text-primary">
            DevContext
          </Link>
        </div>
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Framework instructions presets</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            Jump straight into the DevContext wizard with copy tailored to your stack. Each page outlines what we cover and links directly
            into the guided flow.
          </p>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {stackAnswers.map((answer) => {
          const href = answer.value ? `/stacks/${answer.value}` : "/new"
          return (
            <article
              key={answer.value}
              className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              data-testid={`stack-card-${answer.value}`}
            >
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">{answer.label}</h2>
                {answer.docs ? (
                  <p className="text-sm text-muted-foreground">
                    <a href={answer.docs} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                      Official documentation
                    </a>
                  </p>
                ) : null}
              </div>
              <div className="mt-auto">
                <Link
                  href={href}
                  className="inline-flex items-center justify-center rounded-lg border border-border/80 bg-background/80 px-4 py-2 text-sm font-semibold transition hover:border-primary/40 hover:text-primary"
                >
                  Preview {answer.label} preset
                </Link>
              </div>
            </article>
          )
        })}
      </section>
    </main>
  )
}
