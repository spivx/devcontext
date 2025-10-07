import type { Metadata } from "next"

import { absoluteUrl } from "@/lib/site-metadata"
import { ExistingRepoEntryClient } from "./existing-repo-entry-client"

const title = "Analyze an existing repository | DevContext"
const description =
  "Scan a GitHub repository to auto-detect languages, frameworks, tooling, and testing so DevContext can prefill your AI instructions."
const canonicalUrl = absoluteUrl("/existing")

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
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
}

export default function ExistingRepoEntryPage() {
  return <ExistingRepoEntryClient />
}
