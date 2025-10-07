import type { Metadata } from "next"

import RepoScanClient from "./repo-scan-client"

import { decodeRepoRouteParam, normalizeGitHubRepoInput } from "@/lib/github"
import { absoluteUrl } from "@/lib/site-metadata"
import type { RepoScanRouteParams } from "@/types/repo-scan"

type RepoScanPageProps = {
    params: RepoScanRouteParams
}

const toSlug = (repoUrl: string) => repoUrl.replace(/^https:\/\/github.com\//, "")

export function generateMetadata({ params }: RepoScanPageProps): Metadata {
    const decoded = decodeRepoRouteParam(params.repoUrl)
    const normalized = decoded ? normalizeGitHubRepoInput(decoded) ?? decoded : null
    const repoSlug = normalized ? toSlug(normalized) : null
    const title = repoSlug ? `Repo scan · ${repoSlug}` : "Repo scan"
    const description = repoSlug
        ? `Analyze ${repoSlug} to pre-fill DevContext instructions with detected stack, tooling, and testing.`
        : "Analyze a GitHub repository to pre-fill DevContext instructions with detected stack, tooling, and testing."
    const canonicalPath = normalized ? `/existing/${encodeURIComponent(normalized)}` : "/existing"
    const canonicalUrl = absoluteUrl(canonicalPath)

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        robots: {
            index: false,
            follow: true,
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
}

export default function RepoScanPage({ params }: RepoScanPageProps) {
    const decoded = decodeRepoRouteParam(params.repoUrl)
    const normalized = decoded ? normalizeGitHubRepoInput(decoded) ?? decoded : null

    return <RepoScanClient initialRepoUrl={normalized ?? decoded ?? null} />
}
