import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import stacksData from "@/data/stacks.json"
import type { DataQuestionSource } from "@/types/wizard"
import { AnimatedBackground } from "@/components/AnimatedBackground"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"
import { getHomeMainClasses } from "@/lib/utils"
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
  params: PageParams
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
  const ogImage = "/og-image.png"
  const imageAlt = stackLabel ? `${stackLabel} DevContext wizard preview` : "DevContext wizard interface preview"

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title,
      description,
      url: canonicalPath,
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

export default function StackRoutePage({ params }: PageProps) {
  const { stackSegments } = params
  let stackIdFromRoute: string | null = null
  let summaryMode: "default" | "user" | null = null

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <div className="absolute inset-x-0 top-4 flex items-center justify-between px-6 sm:px-8 lg:px-12">
          <Link href="/" className="text-lg font-semibold tracking-tight text-foreground md:text-xl">
            DevContext
          </Link>
          <Link href="https://github.com/spivx/devcontext" target="_blank">
            <Button variant="outline" size="sm">
              <Github className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </Link>
        </div>

        <main className={getHomeMainClasses(true)}>
          {summaryMode ? (
            <StackSummaryPage stackId={stackIdFromRoute} mode={summaryMode} />
          ) : (
            <StackWizardClient stackIdFromRoute={stackIdFromRoute} />
          )}
        </main>
      </div>
    </div>
  )
}
