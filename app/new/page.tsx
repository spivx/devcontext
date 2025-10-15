import type { Metadata } from "next"

import { StackWizardShell } from "@/components/stack-wizard-shell"
import { StackWizardClient } from "@/app/new/stack/stack-wizard-client"
import { absoluteUrl } from "@/lib/site-metadata"

const title = "Launch the DevContext Wizard"
const description =
  "Start a guided flow to assemble AI-ready coding instruction files. Pick your stack, customize conventions, and export Copilot, Cursor, or agents guidelines in minutes."
const canonicalUrl = absoluteUrl("/new")

export const metadata: Metadata = {
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
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DevContext wizard interface preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.png"],
  },
}

export default function NewPage() {
  return (
    <StackWizardShell>
      <StackWizardClient stackIdFromRoute={null} />
    </StackWizardShell>
  )
}
