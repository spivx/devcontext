import type { Metadata } from "next"
import { redirect } from "next/navigation"

const title = "Launch the DevContext Wizard"
const description =
  "Start a guided flow to assemble AI-ready coding instruction files. Pick your stack, customize conventions, and export Copilot, Cursor, or agents guidelines in minutes."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/new",
  },
  openGraph: {
    title,
    description,
    url: "/new",
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
  redirect(`/new/stack`)
}
