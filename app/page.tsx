import type { Metadata } from "next"
import Link from "next/link"

import { Github } from "lucide-react"

import { AnimatedBackground } from "@/components/AnimatedBackground"
import { Hero } from "@/components/Hero"
import { Button } from "@/components/ui/button"
import { absoluteUrl } from "@/lib/site-metadata"

const title = "DevContext | Repo-aware AI Coding Guidelines Assistant"
const description =
  "Generate AI-ready Copilot instructions, Cursor rules, and developer onboarding docs with a GitHub-aware coding guidelines workflow."

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "AI coding guidelines",
    "Copilot instructions generator",
    "Cursor rules",
    "GitHub repo analyzer",
    "developer onboarding docs",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/"),
    type: "website",
    siteName: "DevContext",
    images: [
      {
        url: absoluteUrl("/og-image.png"),
        width: 1200,
        height: 630,
        alt: "DevContext AI coding guidelines assistant preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [absoluteUrl("/og-image.png")],
  },
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <AnimatedBackground />
      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="flex items-center justify-between px-6 py-6 lg:px-12 lg:py-8">
          <Link href="/" className="text-sm font-semibold text-foreground transition hover:text-primary">
            DevContext
          </Link>
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/stacks">Browse stacks</Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/new">Launch wizard</Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="https://github.com/spivx/devcontext" rel="noreferrer" target="_blank">
                <Github className="size-4" />
                GitHub
              </Link>
            </Button>
          </div>
        </header>

        <main className="flex flex-1 flex-col">
          <Hero />
        </main>


      </div>
    </div>
  )
}
