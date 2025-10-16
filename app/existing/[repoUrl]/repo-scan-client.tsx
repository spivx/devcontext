"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"

import { AlertTriangle, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { normalizeGitHubRepoInput } from "@/lib/github"
import type { RepoScanSummary } from "@/types/repo-scan"
import { getFileOptions } from "@/lib/wizard-config"
import { generateFromRepoScan } from "@/lib/scan-generate"
import FinalOutputView from "@/components/final-output-view"
import RepoScanLoader from "@/components/repo-scan-loader"
import type { GeneratedFileResult } from "@/types/output"

const buildQuery = (url: string) => `/api/scan-repo?url=${encodeURIComponent(url)}`
const CONVENTIONS_DOC_URL =
    process.env.NEXT_PUBLIC_CONVENTIONS_URL ?? "https://github.com/devcontext-ai/devcontext/tree/main/conventions"
const STACKS_DATA_DOC_URL = "https://github.com/spivx/devcontext/blob/main/data/stacks.json"

const formatList = (values: string[]) => (values.length > 0 ? values.join(", ") : "Not detected")

const toSlug = (repoUrl: string) => repoUrl.replace(/^https:\/\/github.com\//, "")

type RepoScanClientProps = {
    initialRepoUrl: string | null
}

export default function RepoScanClient({ initialRepoUrl }: RepoScanClientProps) {
    const [scanResult, setScanResult] = useState<RepoScanSummary | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [hasConfirmed, setHasConfirmed] = useState(false)
    const [scanToken, setScanToken] = useState(0)

    const repoUrlForScan = useMemo(() => {
        if (!initialRepoUrl) {
            return null
        }

        return normalizeGitHubRepoInput(initialRepoUrl) ?? initialRepoUrl
    }, [initialRepoUrl])

    useEffect(() => {
        setHasConfirmed(false)
        setScanResult(null)
        setIsLoading(false)
        setScanToken(0)

        if (!repoUrlForScan) {
            setError("The repository URL could not be decoded. Please check the link and try again.")
            return
        }

        setError(null)
    }, [repoUrlForScan])

    useEffect(() => {
        if (!repoUrlForScan || scanToken === 0) {
            return
        }

        const controller = new AbortController()

        setIsLoading(true)
        setScanResult(null)
        setError(null)

        fetch(buildQuery(repoUrlForScan), { signal: controller.signal })
            .then(async (response) => {
                if (!response.ok) {
                    const payload = (await response.json().catch(() => null)) as { error?: string } | null
                    const message = payload?.error ?? "This repository is private or could not be scanned."
                    throw new Error(message)
                }

                return (await response.json()) as RepoScanSummary
            })
            .then((data) => {
                setScanResult(data)
            })
            .catch((fetchError) => {
                if ((fetchError as Error).name === "AbortError") {
                    return
                }

                setError((fetchError as Error).message)
            })
            .finally(() => {
                setIsLoading(false)
            })

        return () => {
            controller.abort()
        }
    }, [repoUrlForScan, scanToken])

    const structureEntries = useMemo(() => {
        if (!scanResult) {
            return []
        }

        const relevantKeys = scanResult.conventions?.structureRelevant ?? ["src", "components", "tests", "apps", "packages"]

        return relevantKeys.map((key) => ({
            key,
            value: scanResult.structure[key as keyof RepoScanSummary["structure"]] ?? false,
        }))
    }, [scanResult])

    const handleStartScan = () => {
        if (!repoUrlForScan) {
            return
        }

        setHasConfirmed(true)
        setScanToken((token) => token + 1)
    }

    const handleRetryScan = () => {
        if (!repoUrlForScan) {
            return
        }

        setScanToken((token) => token + 1)
    }

    const warnings = scanResult?.warnings ?? []
    const stackMeta = scanResult?.conventions ?? null
    const detectedStackId = stackMeta?.stack ?? null
    const detectedStackLabel = stackMeta?.stackLabel ?? detectedStackId ?? "Not detected"
    const stackIsSupported = stackMeta?.isSupported ?? false
    const showUnsupportedStackNotice = Boolean(detectedStackId) && !stackIsSupported
    const repoSlug = repoUrlForScan ? toSlug(repoUrlForScan) : null
    const promptVisible = Boolean(repoUrlForScan && !hasConfirmed && !isLoading && !scanResult && !error)
    const canRetry = hasConfirmed && !isLoading
    const decodeFailed = repoUrlForScan === null

    // Generation state
    const fileOptions = getFileOptions()
    const [isGeneratingMap, setIsGeneratingMap] = useState<Record<string, boolean>>({})
    const [generatedFile, setGeneratedFile] = useState<GeneratedFileResult | null>(null)

    const handleGenerate = useCallback(async (fileId: string) => {
        if (!scanResult || scanResult.conventions?.isSupported === false) return
        setIsGeneratingMap((prev) => ({ ...prev, [fileId]: true }))
        setGeneratedFile(null)
        try {
            const result = await generateFromRepoScan(scanResult, fileId as any)
            if (result) setGeneratedFile(result)
        } catch (e) {
            console.error('Failed to generate from scan', e)
        } finally {
            setIsGeneratingMap((prev) => ({ ...prev, [fileId]: false }))
        }
    }, [scanResult])

    return (
        <div
            className="relative flex min-h-screen flex-col bg-background text-foreground"
            data-testid="repo-scan-page"
        >
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" aria-hidden="true" />
            <header className="relative z-10 flex items-center justify-between px-6 py-6 lg:px-12 lg:py-8">
                <Link href="/" className="text-sm font-semibold text-foreground transition hover:text-primary">
                    DevContext
                </Link>
            </header>
            <div className="relative z-10 flex flex-1 justify-center px-4 pb-16">
                <Card className="mx-auto mt-4 flex w-full max-w-3xl flex-col gap-0 border-border/50 bg-card/80 backdrop-blur">
                    <CardHeader>
                        <CardTitle className="flex flex-col gap-1 text-2xl">
                            Repository Scan
                            {repoUrlForScan ? (
                                <span className="text-base font-normal text-muted-foreground">{repoUrlForScan}</span>
                            ) : null}
                        </CardTitle>
                        <CardDescription>
                            Run a quick analysis of the repository and generate AI-friendly instruction files tailored to what we detect.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {decodeFailed ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
                                <div>
                                    <p className="text-base font-semibold text-foreground">Unable to decode repository URL</p>
                                    <p className="mt-1 text-sm text-muted-foreground">Double-check the link and try again.</p>
                                </div>
                            </div>
                        ) : promptVisible ? (
                            <div className="space-y-4" data-testid="repo-scan-prompt">
                                <h3 className="text-xl font-semibold text-foreground">Scan {repoSlug ?? repoUrlForScan}?</h3>
                                <p className="text-sm text-muted-foreground">We will detect languages, frameworks, tooling, and testing info.</p>
                                <Button
                                    onClick={handleStartScan}
                                    className="w-full sm:w-auto"
                                    data-testid="repo-scan-confirm-button"
                                >
                                    Yes, scan this repo
                                </Button>
                            </div>
                        ) : isLoading ? (
                            <div className="flex justify-center py-16">
                                <RepoScanLoader />
                            </div>
                        ) : error ? (
                            <div
                                className="flex flex-col items-center gap-3 py-10 text-center"
                                data-testid="repo-scan-error"
                            >
                                <AlertTriangle className="size-8 text-destructive" aria-hidden="true" />
                                <div>
                                    <p className="text-base font-semibold text-foreground">Unable to scan repository</p>
                                    <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                                </div>
                                {canRetry ? (
                                    <Button
                                        onClick={handleRetryScan}
                                        data-testid="repo-scan-retry-button"
                                    >
                                        Try again
                                    </Button>
                                ) : null}
                            </div>
                        ) : scanResult ? (
                            <div className="space-y-8" data-testid="repo-scan-results">
                                <section className="space-y-2">
                                    <h3 className="text-lg font-semibold text-foreground">Detected snapshot</h3>
                                    <p className="text-sm text-muted-foreground">
                                        We mapped the repository to highlight the primary language, tooling, and structure so you can generate the right instructions in one click.
                                    </p>
                                </section>
                                <section className="grid gap-6 md:grid-cols-2">
                                    <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                                        <div className="flex items-center gap-2 text-sm font-semibold">
                                            <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                                            Detected stack
                                        </div>
                                        <p className="mt-3 text-base text-foreground">{detectedStackLabel}</p>
                                        {detectedStackId && detectedStackLabel !== detectedStackId ? (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                Stack ID: <code className="rounded bg-muted px-1 py-0.5">{detectedStackId}</code>
                                            </p>
                                        ) : null}
                                        {showUnsupportedStackNotice ? (
                                            <p className="mt-2 text-xs font-medium text-destructive">Not yet supported</p>
                                        ) : null}
                                    </div>
                                    {!showUnsupportedStackNotice && scanResult.conventions && !scanResult.conventions.hasCustomConventions ? (
                                        <div className="md:col-span-2 rounded-2xl border border-dashed border-border/60 bg-background/70 p-5">
                                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                                <span>
                                                    We don’t have conventions for <span className="font-semibold text-foreground">{scanResult.conventions.stack}</span> yet.
                                                </span>
                                                <span>
                                                    Add a new <code className="rounded bg-muted px-1 py-0.5 text-xs">conventions/{scanResult.conventions.stack}.json</code> file to customize detection and defaults.
                                                </span>
                                                <div>
                                                    <Link
                                                        href={CONVENTIONS_DOC_URL}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-primary hover:border-primary/60"
                                                    >
                                                        View conventions directory
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                    {!showUnsupportedStackNotice ? (
                                        <>
                                            <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                                                <div className="flex items-center gap-2 text-sm font-semibold">
                                                    <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                                                    Primary language
                                                </div>
                                                <p className="mt-3 text-base text-foreground">
                                                    {scanResult.language ?? "Not detected"}
                                                </p>
                                                {scanResult.languages.length > 1 ? (
                                                    <p className="mt-2 text-xs text-muted-foreground">
                                                        Also spotted: {scanResult.languages.slice(1).join(", ")}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                                                <div className="flex items-center gap-2 text-sm font-semibold">
                                                    <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                                                    Default branch
                                                </div>
                                                <p className="mt-3 text-base text-foreground">{scanResult.defaultBranch}</p>
                                            </div>
                                        </>
                                    ) : null}
                                </section>
                                {showUnsupportedStackNotice ? (
                                    <div className="rounded-2xl border border-dashed border-destructive/40 bg-destructive/10 p-5">
                                        <div className="flex items-start gap-3 text-sm text-muted-foreground">
                                            <AlertTriangle className="mt-0.5 size-5 text-destructive" aria-hidden="true" />
                                            <div className="space-y-2">
                                                <p>
                                                    We detected <span className="font-semibold text-foreground">{detectedStackLabel}</span>, but this stack isn’t supported yet.
                                                </p>
                                                <p>
                                                    Contribute a new entry in{" "}
                                                    <Link
                                                        href={STACKS_DATA_DOC_URL}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center font-semibold text-primary hover:underline"
                                                    >
                                                        data/stacks.json
                                                    </Link>{" "}
                                                    to enable full summaries for this stack.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <section className="grid gap-6 md:grid-cols-2">
                                            <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Frameworks</h3>
                                                <p className="mt-3 text-sm text-foreground">{formatList(scanResult.frameworks)}</p>
                                            </div>
                                            <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Tooling</h3>
                                                <p className="mt-3 text-sm text-foreground">{formatList(scanResult.tooling)}</p>
                                            </div>
                                            <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Testing</h3>
                                                <p className="mt-3 text-sm text-foreground">{formatList(scanResult.testing)}</p>
                                            </div>
                                            <div className="rounded-2xl border border-border/60 bg-background/70 p-5">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Structure hints</h3>
                                                <ul className="mt-3 space-y-2 text-sm text-foreground">
                                                    {structureEntries.map(({ key, value }) => (
                                                        <li key={key} className="flex items-center justify-between gap-4">
                                                            <span className="font-medium capitalize">{key}</span>
                                                            <span className={value ? "text-emerald-400" : "text-muted-foreground"}>
                                                                {value ? "Present" : "Missing"}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </section>
                                        <section className="space-y-4 rounded-2xl border border-border/60 bg-background/70 p-5">
                                            <div className="space-y-1">
                                                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Generate instructions</h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Choose the file you need—each one opens an Instructions ready preview powered by this scan.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {fileOptions.map((file) => {
                                                    const busy = Boolean(isGeneratingMap[file.id])
                                                    return (
                                                        <Button
                                                            key={file.id}
                                                            onClick={() => void handleGenerate(file.id)}
                                                            disabled={busy}
                                                            className="flex h-[36px] items-center rounded-full px-4 py-0 text-sm"
                                                        >
                                                            {busy ? `Generating ${file.filename}…` : `Generate ${file.filename}`}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        </section>
                                        {warnings.length > 0 ? (
                                            <div className="rounded-2xl border border-amber-400/60 bg-amber-950/40 p-4 text-amber-200">
                                                <div className="flex items-start gap-2">
                                                    <AlertTriangle className="mt-0.5 size-4" aria-hidden="true" />
                                                    <div className="space-y-1 text-sm">
                                                        {warnings.map((warning) => (
                                                            <p key={warning}>{warning}</p>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : null}
                                        <div
                                            className="rounded-2xl border border-border/60 bg-background/70 p-5"
                                            data-testid="repo-scan-raw-json"
                                        >
                                            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Raw response</h3>
                                            <pre className="mt-3 max-h-72 overflow-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                                                {JSON.stringify(scanResult, null, 2)}
                                            </pre>
                                        </div>
                                        {generatedFile ? (
                                            <FinalOutputView
                                                fileName={generatedFile.fileName}
                                                fileContent={generatedFile.fileContent}
                                                mimeType={generatedFile.mimeType}
                                                onClose={() => setGeneratedFile(null)}
                                            />
                                        ) : null}
                                    </>
                                )}
                            </div>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
