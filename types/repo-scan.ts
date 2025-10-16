export type RepoStructureSummary = {
    src: boolean
    components: boolean
    tests: boolean
    apps: boolean
    packages: boolean
}

export type RepoScanConventionsMeta = {
    stack: string
    stackLabel: string | null
    isSupported: boolean
    hasCustomConventions: boolean
    structureRelevant: Array<keyof RepoStructureSummary>
}

export type RepoScanSummary = {
    repo: string
    defaultBranch: string
    language: string | null
    languages: string[]
    frameworks: string[]
    tooling: string[]
    testing: string[]
    structure: RepoStructureSummary
    topics: string[]
    warnings: string[]
    // Optional enriched signals (best-effort)
    packageManager?: string | null
    nodeVersion?: string | null
    monorepo?: boolean
    workspaces?: string[]
    routing?: 'app' | 'pages' | 'hybrid' | null
    styling?: string | null
    stateMgmt?: string | null
    dataFetching?: string | null
    auth?: string | null
    validation?: string | null
    logging?: string | null
    ci?: string[]
    codeQuality?: string[]
    editor?: string[]
    fileNamingStyle?: string | null
    componentNamingStyle?: string | null
    codeStylePreference?: string | null
    commitMessageStyle?: string | null
    conventions?: RepoScanConventionsMeta | null
}

export type RepoScanErrorResponse = {
    error: string
}

export type RepoScanResponse = RepoScanSummary | RepoScanErrorResponse

export type RepoScanRouteParams = {
    repoUrl: string
}
