import { notFound } from "next/navigation"
import type { Metadata } from "next"

import stacksData from "@/data/stacks.json"
import type { DataQuestionSource, WizardStep } from "@/types/wizard"
import { StackWizardShell } from "@/components/stack-wizard-shell"
import { loadStackWizardStep } from "@/lib/wizard-config"
import { absoluteUrl } from "@/lib/site-metadata"
import { StackWizardClient } from "../stack-wizard-client"
import { StackSummaryPage } from "../stack-summary-page"

const stackQuestion = (stacksData as DataQuestionSource[])[0]
const stackAnswers = stackQuestion?.answers ?? []

type PageParams = {
  stackSegments?: string[]
}

type MetadataProps = {
  params: Promise<PageParams>
}

type PageProps = {
  params: Promise<PageParams>
}

export async function generateMetadata({ params }: MetadataProps): Promise<Metadata> {
  const resolvedParams = await params
  const { stackSegments } = resolvedParams
  const segments = Array.isArray(stackSegments) ? stackSegments : []
  const stackId = segments.length > 0 ? segments[0] : null
  let mode: "default" | "user" | null = null

  if (segments.length > 1) {
    if (segments.length === 2 && segments[1] === "summary") {
      mode = "default"
    } else if (
      segments.length === 3 &&
      segments[2] === "summary" &&
      (segments[1] === "default" || segments[1] === "user")
    ) {
      mode = segments[1] as "default" | "user"
    }
  }

  const stackLabel = stackAnswers.find((answer) => answer.value === stackId)?.label

  const title = stackLabel
    ? `${stackLabel} · DevContext Wizard`
    : "DevContext Wizard"
  let description = "Choose your stack and build AI-ready coding instructions."

  if (stackLabel) {
    if (mode === "user") {
      description = `Review your saved answers for ${stackLabel} and generate tailored context files.`
    } else {
      description = `Review recommended defaults for ${stackLabel} and share the summary instantly.`
    }
  }

  const canonicalPath = `/new/stack${segments.length > 0 ? `/${segments.join("/")}` : ""}`
  const canonicalUrl = absoluteUrl(canonicalPath)
  const ogImage = "/og-image.png"
  const imageAlt = stackLabel ? `${stackLabel} DevContext wizard preview` : "DevContext wizard interface preview"

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: "website",
      siteName: "DevContext",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function StackRoutePage({ params }: PageProps) {
  const resolvedParams = await params
  const { stackSegments } = resolvedParams
  let stackIdFromRoute: string | null = null
  let summaryMode: "default" | "user" | null = null

  let initialStackStep: WizardStep | null = null
  let initialStackLabel: string | null = null

  if (Array.isArray(stackSegments) && stackSegments.length > 0) {
    const potentialStackId = stackSegments[0]
    const stackMatch = stackAnswers.find((answer) => answer.value === potentialStackId)

    if (!stackMatch) {
      notFound()
    }

    stackIdFromRoute = potentialStackId

    if (stackSegments.length > 1) {
      if (stackSegments.length === 2 && stackSegments[1] === "summary") {
        summaryMode = "default"
      } else if (
        stackSegments.length === 3 &&
        stackSegments[2] === "summary" &&
        (stackSegments[1] === "default" || stackSegments[1] === "user")
      ) {
        summaryMode = stackSegments[1] as "default" | "user"
      } else {
        notFound()
      }
    }
  }

  if (stackIdFromRoute && !summaryMode) {
    try {
      const { step, label } = await loadStackWizardStep(stackIdFromRoute)
      initialStackStep = step
      initialStackLabel = label
    } catch (error) {
      console.error(`Unable to preload questions for stack "${stackIdFromRoute}"`, error)
      notFound()
    }
  }

  return (
    <StackWizardShell>
      {summaryMode ? (
        <StackSummaryPage stackId={stackIdFromRoute} mode={summaryMode} />
      ) : (
        <StackWizardClient
          stackIdFromRoute={stackIdFromRoute}
          initialStackLabel={initialStackLabel}
          initialStackStep={initialStackStep}
        />
      )}
    </StackWizardShell>
  )
}
