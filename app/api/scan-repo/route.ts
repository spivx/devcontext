import { NextRequest, NextResponse } from "next/server"

import type {
    RepoScanErrorResponse,
    RepoScanResponse,
    RepoScanSummary,
    RepoStructureSummary,
} from "@/types/repo-scan"

const GITHUB_API_BASE_URL = "https://api.github.com"
const GITHUB_HOSTNAMES = new Set(["github.com", "www.github.com"])

const JSON_HEADERS = {
    Accept: "application/vnd.github+json",
}

interface GitHubTreeItem {
    path: string
    type: "blob" | "tree" | string
}

interface PackageJson {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
    optionalDependencies?: Record<string, string>
    engines?: { node?: string }
    workspaces?: string[] | { packages?: string[] }
}

const dependencyHas = (pkg: PackageJson, names: string[]): boolean => {
    const sources = [
        pkg.dependencies,
        pkg.devDependencies,
        pkg.peerDependencies,
        pkg.optionalDependencies,
    ]

    return sources.some((source) =>
        source ? names.some((name) => Object.prototype.hasOwnProperty.call(source, name)) : false,
    )
}

const isNullishOrEmpty = (value: unknown): value is null | undefined | "" => value === null || value === undefined || value === ""

const extractRateLimitRemaining = (response: Response): number | null => {
    const header = response.headers.get("x-ratelimit-remaining")

    if (header === null) {
        return null
    }

    const value = Number.parseInt(header, 10)

    return Number.isNaN(value) ? null : value
}

const parseGitHubRepo = (input: string | null): { owner: string; repo: string } | null => {
    if (!input) {
        return null
    }

    const trimmed = input.trim()

    if (trimmed === "") {
        return null
    }

    try {
        const url = trimmed.includes("://") ? new URL(trimmed) : new URL(`https://github.com/${trimmed}`)

        if (!GITHUB_HOSTNAMES.has(url.hostname.toLowerCase())) {
            return null
        }

        const [owner, repo] = url.pathname
            .split("/")
            .map((segment) => segment.trim())
            .filter(Boolean)

        if (!owner || !repo) {
            return null
        }

        return {
            owner,
            repo: repo.replace(/\.git$/i, ""),
        }
    } catch (error) {
        console.error("Failed to parse GitHub repository URL", error)
        return null
    }
}

const dedupeAndSort = (values: Iterable<string>): string[] => Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))

const detectStructure = (paths: string[]): RepoStructureSummary => {
    const lowerCasePaths = paths.map((path) => path.toLowerCase())

    const hasPrefix = (prefix: string) => lowerCasePaths.some((path) => path.startsWith(prefix))

    return {
        src: hasPrefix("src/"),
        components: hasPrefix("components/"),
        tests:
            hasPrefix("tests/") ||
            hasPrefix("test/") ||
            hasPrefix("__tests__/") ||
            lowerCasePaths.some((path) => path.includes("/__tests__/")),
        apps: hasPrefix("apps/"),
        packages: hasPrefix("packages/"),
    }
}

const detectTooling = (paths: string[], pkg: PackageJson | null): { tooling: string[]; testing: string[]; frameworks: string[] } => {
    const tooling = new Set<string>()
    const testing = new Set<string>()
    const frameworks = new Set<string>()

    const lowerCasePaths = paths.map((path) => path.toLowerCase())

    const matchers: Array<{ pattern: RegExp; value: string; target: Set<string> }> = [
        { pattern: /^requirements\.txt$/, value: "pip", target: tooling },
        { pattern: /^pyproject\.toml$/, value: "Poetry", target: tooling },
        { pattern: /pom\.xml$/, value: "Maven", target: tooling },
        { pattern: /build\.gradle(\.kts)?$/, value: "Gradle", target: tooling },
        { pattern: /(^|\/)dockerfile$/, value: "Docker", target: tooling },
        { pattern: /(^|\/)docker-compose\.ya?ml$/, value: "Docker Compose", target: tooling },
        { pattern: /(^|\/)compose\.ya?ml$/, value: "Docker Compose", target: tooling },
        { pattern: /^tsconfig\.json$/, value: "TypeScript", target: tooling },
        { pattern: /(^|\/)eslint\.config\.(js|cjs|mjs|ts|tsx)?$/, value: "ESLint", target: tooling },
        { pattern: /(^|\/)\.eslintrc(\.[a-z]+)?$/, value: "ESLint", target: tooling },
        { pattern: /(^|\/)prettier\.config\.(js|cjs|mjs|ts)?$/, value: "Prettier", target: tooling },
        { pattern: /(^|\/)\.prettierrc(\.[a-z]+)?$/, value: "Prettier", target: tooling },
        { pattern: /(^|\/)\.babelrc(\.[a-z]+)?$/, value: "Babel", target: tooling },
        { pattern: /babel\.config\.(js|cjs|mjs|ts)?$/, value: "Babel", target: tooling },
        { pattern: /webpack\.config\.(js|cjs|mjs|ts)?$/, value: "Webpack", target: tooling },
        { pattern: /vite\.config\.(js|cjs|mjs|ts)?$/, value: "Vite", target: tooling },
        { pattern: /rollup\.config\.(js|cjs|mjs|ts)?$/, value: "Rollup", target: tooling },
        { pattern: /tailwind\.config\.(js|cjs|mjs|ts)?$/, value: "Tailwind CSS", target: tooling },
        { pattern: /jest\.config\.(js|cjs|mjs|ts|json)?$/, value: "Jest", target: testing },
        { pattern: /vitest\.(config|setup)/, value: "Vitest", target: testing },
        { pattern: /(^|\/)cypress\//, value: "Cypress", target: testing },
        { pattern: /cypress\.config\.(js|cjs|mjs|ts)?$/, value: "Cypress", target: testing },
        { pattern: /playwright\.config\.(js|cjs|mjs|ts)?$/, value: "Playwright", target: testing },
        { pattern: /karma\.conf(\.js)?$/, value: "Karma", target: testing },
        { pattern: /mocha\./, value: "Mocha", target: testing },
    ]

    for (const { pattern, value, target } of matchers) {
        if (lowerCasePaths.some((path) => pattern.test(path))) {
            target.add(value)
        }
    }

    if (pkg) {
        if (dependencyHas(pkg, ["next", "nextjs"])) {
            frameworks.add("Next.js")
        }

        if (dependencyHas(pkg, ["react", "react-dom"])) {
            frameworks.add("React")
        }

        if (dependencyHas(pkg, ["@angular/core"])) {
            frameworks.add("Angular")
        }

        if (dependencyHas(pkg, ["vue", "vue-router", "@vue/runtime-core"])) {
            frameworks.add("Vue")
        }

        if (dependencyHas(pkg, ["svelte"])) {
            frameworks.add("Svelte")
        }

        if (dependencyHas(pkg, ["nuxt", "nuxt3", "@nuxt/kit"])) {
            frameworks.add("Nuxt")
        }

        if (dependencyHas(pkg, ["gatsby"])) {
            frameworks.add("Gatsby")
        }

        if (dependencyHas(pkg, ["remix", "@remix-run/node", "@remix-run/react"])) {
            frameworks.add("Remix")
        }

        if (dependencyHas(pkg, ["@nestjs/common", "@nestjs/core"])) {
            frameworks.add("NestJS")
        }

        if (dependencyHas(pkg, ["express"])) {
            frameworks.add("Express")
        }

        if (dependencyHas(pkg, ["@sveltejs/kit"])) {
            frameworks.add("SvelteKit")
        }

        if (dependencyHas(pkg, ["astro"])) {
            frameworks.add("Astro")
        }

        if (dependencyHas(pkg, ["solid-js"])) {
            frameworks.add("SolidJS")
        }

        if (dependencyHas(pkg, ["react-native"])) {
            frameworks.add("React Native")
        }

        if (dependencyHas(pkg, ["expo"])) {
            frameworks.add("Expo")
        }

        if (dependencyHas(pkg, ["@storybook/react", "@storybook/nextjs", "@storybook/vue"])) {
            tooling.add("Storybook")
        }

        if (dependencyHas(pkg, ["eslint"])) {
            tooling.add("ESLint")
        }

        if (dependencyHas(pkg, ["prettier"])) {
            tooling.add("Prettier")
        }

        if (dependencyHas(pkg, ["typescript"])) {
            tooling.add("TypeScript")
        }

        if (dependencyHas(pkg, ["jest", "@types/jest", "ts-jest"])) {
            testing.add("Jest")
        }

        if (dependencyHas(pkg, ["vitest"])) {
            testing.add("Vitest")
        }

        if (dependencyHas(pkg, ["cypress"])) {
            testing.add("Cypress")
        }

        if (dependencyHas(pkg, ["@playwright/test"])) {
            testing.add("Playwright")
        }

        if (dependencyHas(pkg, ["mocha"])) {
            testing.add("Mocha")
        }

        if (dependencyHas(pkg, ["ava"])) {
            testing.add("AVA")
        }

        if (dependencyHas(pkg, ["@testing-library/react", "@testing-library/dom"])) {
            testing.add("Testing Library")
        }
    }

    return {
        tooling: dedupeAndSort(tooling),
        testing: dedupeAndSort(testing),
        frameworks: dedupeAndSort(frameworks),
    }
}

const readPackageJson = async (
    owner: string,
    repo: string,
    ref: string,
    headers: Record<string, string>,
): Promise<PackageJson | null> => {
    try {
        const packageResponse = await fetch(
            `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/package.json?ref=${encodeURIComponent(ref)}`,
            {
                headers,
                cache: "no-store",
            },
        )

        if (!packageResponse.ok) {
            return null
        }

        const payload = (await packageResponse.json()) as { content?: string; encoding?: string }

        if (!payload.content) {
            return null
        }

        const encoding = payload.encoding || "base64"
        const decoded = Buffer.from(payload.content, encoding as BufferEncoding).toString("utf8")

        return JSON.parse(decoded) as PackageJson
    } catch (error) {
        console.error("Failed to read package.json", error)
        return null
    }
}

const collectPathsFromTree = (items: GitHubTreeItem[]): string[] =>
    items.filter((item) => item.type === "blob").map((item) => item.path)

const readTextFile = async (
    owner: string,
    repo: string,
    ref: string,
    filePath: string,
    headers: Record<string, string>,
): Promise<string | null> => {
    try {
        const res = await fetch(
            `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${encodeURIComponent(ref)}`,
            { headers, cache: "no-store" },
        )
        if (!res.ok) return null
        const payload = (await res.json()) as { content?: string; encoding?: string }
        if (!payload.content) return null
        const encoding = (payload.encoding || "base64") as BufferEncoding
        return Buffer.from(payload.content, encoding).toString("utf8").trim()
    } catch {
        return null
    }
}

type FileStyleKey = "pascal" | "camel" | "kebab" | "snake"

const stripExtension = (name: string) => name.replace(/\.[^.]+$/u, "")

const sanitizeBaseName = (name: string) => {
    const withoutExtension = stripExtension(name)
    const segments = withoutExtension.split(".")
    const candidate = segments[0] ?? ""
    return candidate
}

const classifyNameStyle = (rawName: string): FileStyleKey | null => {
    const name = rawName.trim()
    if (!name) {
        return null
    }

    if (/^[a-z0-9]+(?:-[a-z0-9]+)+$/u.test(name)) {
        return "kebab"
    }

    if (/^[a-z0-9]+(?:_[a-z0-9]+)+$/u.test(name)) {
        return "snake"
    }

    if (/^[A-Z][A-Za-z0-9]+$/u.test(name)) {
        return "pascal"
    }

    if (/^[a-z][A-Za-z0-9]*[A-Z][A-Za-z0-9]*$/u.test(name)) {
        return "camel"
    }

    return null
}

const pickDominantStyle = (counts: Record<FileStyleKey, number>): FileStyleKey | null => {
    let winner: FileStyleKey | null = null
    let winnerCount = 0

    for (const key of Object.keys(counts) as FileStyleKey[]) {
        const value = counts[key]
        if (value > winnerCount) {
            winner = key
            winnerCount = value
        }
    }

    return winnerCount > 0 ? winner : null
}

const analyzeNamingStyles = (paths: string[]) => {
    const fileCounts: Record<FileStyleKey, number> = { pascal: 0, camel: 0, kebab: 0, snake: 0 }
    const componentCounts: Record<FileStyleKey, number> = { pascal: 0, camel: 0, kebab: 0, snake: 0 }

    const componentDirPattern = /(^|\/(src|app|packages)\/)?.*\b(components?|ui|shared)\b\//i

    paths.forEach((path) => {
        const filename = path.split("/").pop()
        if (!filename || filename.startsWith(".")) {
            return
        }

        const baseName = sanitizeBaseName(filename)
        if (!baseName) {
            return
        }

        if (["index", "page", "layout", "route", "default", "middleware"].includes(baseName.toLowerCase())) {
            return
        }

        const cleanName = baseName.replace(/-(test|spec|stories)$/iu, "").replace(/(test|spec|stories)$/iu, "")
        const style = classifyNameStyle(cleanName)
        if (!style) {
            return
        }

        const lowerPath = path.toLowerCase()
        const extension = lowerPath.split(".").pop() ?? ""
        const isCodeFile = /^(ts|tsx|js|jsx|mjs|cjs)$/u.test(extension)
        const isStyleFile = /^(css|scss|sass|less|styl)$/u.test(extension)

        if (isCodeFile || isStyleFile) {
            fileCounts[style] += 1
        }

        if ((/^(tsx|jsx)$/u.test(extension) || componentDirPattern.test(lowerPath))) {
            componentCounts[style] += 1
        }
    })

    const styleMapping: Record<FileStyleKey, string> = {
        kebab: "kebab-case",
        snake: "snake_case",
        pascal: "PascalCase",
        camel: "camelCase",
    }

    const defaultComponentMapping: Record<FileStyleKey, string> = {
        kebab: "camelCase",
        snake: "camelCase",
        pascal: "PascalCase",
        camel: "camelCase",
    }

    const dominantFileStyle = pickDominantStyle(fileCounts)
    const dominantComponentStyle = pickDominantStyle(componentCounts)

    return {
        fileNamingStyle: dominantFileStyle ? styleMapping[dominantFileStyle] : null,
        componentNamingStyle: dominantComponentStyle
            ? styleMapping[dominantComponentStyle]
            : dominantFileStyle
                ? defaultComponentMapping[dominantFileStyle]
                : null,
    }
}

const detectEnrichedSignals = async (
    owner: string,
    repo: string,
    ref: string,
    paths: string[],
    pkg: PackageJson | null,
    headers: Record<string, string>,
) => {
    const lower = paths.map((p) => p.toLowerCase())

    const hasExact = (p: string) => lower.includes(p.toLowerCase())
    const hasPrefix = (prefix: string) => lower.some((p) => p.startsWith(prefix.toLowerCase()))
    const hasMatch = (re: RegExp) => lower.some((p) => re.test(p))

    // Package manager
    const packageManager = hasExact("pnpm-lock.yaml")
        ? "pnpm"
        : hasExact("yarn.lock")
            ? "yarn"
            : hasExact("bun.lockb")
                ? "bun"
                : hasExact("package-lock.json") || hasExact("npm-shrinkwrap.json")
                    ? "npm"
                    : null

    // Node version
    let nodeVersion: string | null = pkg?.engines?.node ?? null
    if (!nodeVersion && hasExact(".nvmrc")) {
        nodeVersion = (await readTextFile(owner, repo, ref, ".nvmrc", headers)) || null
    }
    if (!nodeVersion && hasExact(".node-version")) {
        nodeVersion = (await readTextFile(owner, repo, ref, ".node-version", headers)) || null
    }

    // Monorepo/workspaces
    const monorepo = hasExact("pnpm-workspace.yaml") || hasExact("turbo.json") || hasExact("nx.json") || hasExact("lerna.json") || hasPrefix("apps/") || hasPrefix("packages/")
    let workspaces: string[] | undefined
    if (pkg?.workspaces) {
        workspaces = Array.isArray(pkg.workspaces) ? pkg.workspaces : pkg.workspaces.packages
    }

    // Routing (Next.js)
    const routing: RepoScanSummary["routing"] = hasPrefix("app/") && hasPrefix("pages/")
        ? "hybrid"
        : hasPrefix("app/")
            ? "app"
            : hasPrefix("pages/")
                ? "pages"
                : null

    // Styling
    const styling = hasMatch(/tailwind\.config\.(js|cjs|mjs|ts)$/) ? "tailwind"
        : hasMatch(/styled(-|)components|styled-components/) || (pkg && dependencyHas(pkg, ["styled-components"])) ? "styled-components"
        : hasMatch(/\.module\.(css|scss|sass)$/) ? "cssmodules"
        : null

    // State mgmt
    const stateMgmt = pkg && (dependencyHas(pkg, ["zustand"]) ? "zustand"
        : dependencyHas(pkg, ["@reduxjs/toolkit", "redux"]) ? "redux"
        : dependencyHas(pkg, ["recoil"]) ? "recoil"
        : dependencyHas(pkg, ["jotai"]) ? "jotai"
        : null)

    // Data fetching
    const dataFetching = pkg && (dependencyHas(pkg, ["@tanstack/react-query"]) ? "react-query"
        : dependencyHas(pkg, ["swr"]) ? "swr"
        : null)

    // Auth
    const auth = pkg && (dependencyHas(pkg, ["next-auth"]) ? "next-auth"
        : dependencyHas(pkg, ["@clerk/nextjs"]) ? "clerk"
        : dependencyHas(pkg, ["@auth0/nextjs-auth0"]) ? "auth0"
        : null)

    // Validation
    const validation = pkg && (dependencyHas(pkg, ["zod"]) ? "zod"
        : dependencyHas(pkg, ["yup"]) ? "yup"
        : dependencyHas(pkg, ["ajv"]) ? "ajv"
        : null)

    // Logging
    const logging = pkg && (dependencyHas(pkg, ["@sentry/nextjs", "@sentry/node"]) ? "sentry"
        : dependencyHas(pkg, ["pino"]) ? "pino"
        : dependencyHas(pkg, ["winston"]) ? "winston"
        : hasExact("vercel.json") || hasPrefix(".vercel/") ? "vercel-observability"
        : null)

    // CI/CD
    const ci: string[] = []
    if (hasPrefix(".github/workflows/")) ci.push("GitHub Actions")
    if (hasExact("vercel.json") || hasPrefix(".vercel/")) ci.push("Vercel")
    if (hasExact("netlify.toml")) ci.push("Netlify")
    if (hasPrefix(".circleci/")) ci.push("CircleCI")
    if (hasExact(".gitlab-ci.yml")) ci.push("GitLab CI")
    if (hasExact("azure-pipelines.yml")) ci.push("Azure Pipelines")

    // Code Quality / releases
    const codeQuality: string[] = []
    if (hasPrefix(".husky/")) codeQuality.push("husky")
    if (pkg && dependencyHas(pkg, ["husky"])) codeQuality.push("husky")
    if (hasMatch(/^commitlint\.config\./) || (pkg && dependencyHas(pkg, ["@commitlint/cli", "@commitlint/config-conventional"])) ) codeQuality.push("commitlint")
    if (hasMatch(/^\.lintstagedrc/) || (pkg && dependencyHas(pkg, ["lint-staged"])) ) codeQuality.push("lint-staged")
    if (pkg && dependencyHas(pkg, ["semantic-release"])) codeQuality.push("semantic-release")
    if (pkg && (dependencyHas(pkg, ["@changesets/cli"]) || hasPrefix(".changeset/"))) codeQuality.push("changesets")

    // Editor
    const editor: string[] = []
    if (hasExact(".editorconfig")) editor.push("editorconfig")
    if (hasMatch(/(^|\/)eslint\.config\.(js|cjs|mjs|ts|tsx)?$/) || hasMatch(/(^|\/)\.eslintrc(\.[a-z]+)?$/)) editor.push("eslint")
    if (hasMatch(/(^|\/)prettier\.config\.(js|cjs|mjs|ts)?$/) || hasMatch(/(^|\/)\.prettierrc(\.[a-z]+)?$/)) editor.push("prettier")

    const { fileNamingStyle, componentNamingStyle } = analyzeNamingStyles(paths)

    // Code style detection (ESLint presets)
    let codeStylePreference: string | null = null
    if (pkg) {
        if (dependencyHas(pkg, ["eslint-config-airbnb", "eslint-config-airbnb-base"])) {
            codeStylePreference = "airbnb"
        } else if (dependencyHas(pkg, ["eslint-config-standard"])) {
            codeStylePreference = "standardjs"
        }
    }

    if (!codeStylePreference) {
        const eslintPath = paths.find((p) => /eslint\.(config\.(js|cjs|mjs|ts|json)|json)$/iu.test(p) || /\.eslintrc(\.[a-z]+)?$/iu.test(p))
        if (eslintPath) {
            const contents = await readTextFile(owner, repo, ref, eslintPath, headers)
            if (contents) {
                if (/airbnb/iu.test(contents)) {
                    codeStylePreference = "airbnb"
                } else if (/standard/iu.test(contents)) {
                    codeStylePreference = "standardjs"
                }
            }
        }
    }

    // Commit message conventions
    let commitMessageStyle: string | null = null
    const hasGitmoji = hasExact(".gitmojirc") || hasExact("gitmoji.config.js") || hasExact("gitmoji.config.cjs") || (pkg && dependencyHas(pkg, ["gitmoji", "gitmoji-cli"]))
    if (hasGitmoji) {
        commitMessageStyle = "gitmoji"
    } else if (codeQuality.some((value) => ["commitlint", "semantic-release", "changesets"].includes(value))) {
        commitMessageStyle = "conventional"
    }

    return {
      packageManager,
      nodeVersion: nodeVersion || null,
      monorepo: Boolean(monorepo),
      workspaces,
      routing,
      styling,
      stateMgmt: stateMgmt || null,
      dataFetching: dataFetching || null,
      auth: auth || null,
      validation: validation || null,
      logging: logging || null,
      ci,
      codeQuality,
      editor,
      fileNamingStyle,
      componentNamingStyle,
      codeStylePreference,
      commitMessageStyle,
    }
}

export async function GET(request: NextRequest): Promise<NextResponse<RepoScanResponse>> {
    const { searchParams } = new URL(request.url)
    const repoUrl = searchParams.get("url")

    const parsed = parseGitHubRepo(repoUrl)

    if (!parsed) {
        return NextResponse.json<RepoScanErrorResponse>({ error: "Invalid GitHub repository URL." }, { status: 400 })
    }

    const token = process.env.GITHUB_TOKEN

    if (isNullishOrEmpty(token)) {
        return NextResponse.json<RepoScanErrorResponse>(
            { error: "GitHub token is not configured on the server." },
            { status: 500 },
        )
    }

    const headers: Record<string, string> = {
        ...JSON_HEADERS,
        Authorization: `Bearer ${token}`,
        "User-Agent": "DevContext-Repo-Scanner",
    }

    const { owner, repo } = parsed

    try {
        const warnings: string[] = []
        let lowestRateLimit: number | null = null

        const repoResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}`, {
            headers,
            cache: "no-store",
        })

        if (repoResponse.status === 404) {
            return NextResponse.json<RepoScanErrorResponse>({ error: "Repository not found." }, { status: 404 })
        }

        if (repoResponse.status === 403) {
            return NextResponse.json<RepoScanErrorResponse>({ error: "Access to this repository is forbidden." }, { status: 403 })
        }

        if (!repoResponse.ok) {
            return NextResponse.json<RepoScanErrorResponse>(
                { error: `Failed to fetch repository metadata (status ${repoResponse.status}).` },
                { status: repoResponse.status },
            )
        }

        lowestRateLimit = extractRateLimitRemaining(repoResponse)

        const repoJson = (await repoResponse.json()) as {
            default_branch?: string
            language?: string
            topics?: string[]
        }

        const defaultBranch = repoJson.default_branch ?? "main"

        const languagesResponse = await fetch(`${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/languages`, {
            headers,
            cache: "no-store",
        })

        if (languagesResponse.status === 403) {
            return NextResponse.json<RepoScanErrorResponse>({ error: "Access forbidden while fetching languages." }, { status: 403 })
        }

        if (!languagesResponse.ok) {
            return NextResponse.json<RepoScanErrorResponse>(
                { error: `Failed to fetch repository languages (status ${languagesResponse.status}).` },
                { status: languagesResponse.status },
            )
        }

        const languagesRemaining = extractRateLimitRemaining(languagesResponse)

        if (typeof languagesRemaining === "number") {
            if (lowestRateLimit === null || languagesRemaining < lowestRateLimit) {
                lowestRateLimit = languagesRemaining
            }
        }

        const languagesJson = (await languagesResponse.json()) as Record<string, number>
        const languages = Object.entries(languagesJson)
            .sort(([, bytesA], [, bytesB]) => bytesB - bytesA)
            .map(([name]) => name)

        const treeResponse = await fetch(
            `${GITHUB_API_BASE_URL}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(defaultBranch)}?recursive=1`,
            {
                headers,
                cache: "no-store",
            },
        )

        if (treeResponse.status === 404) {
            return NextResponse.json<RepoScanErrorResponse>(
                { error: "Repository tree could not be retrieved." },
                { status: 404 },
            )
        }

        if (treeResponse.status === 403) {
            return NextResponse.json<RepoScanErrorResponse>(
                { error: "Access forbidden while fetching repository tree." },
                { status: 403 },
            )
        }

        if (!treeResponse.ok) {
            return NextResponse.json<RepoScanErrorResponse>(
                { error: `Failed to fetch repository tree (status ${treeResponse.status}).` },
                { status: treeResponse.status },
            )
        }

        const treeRemaining = extractRateLimitRemaining(treeResponse)

        if (typeof treeRemaining === "number") {
            if (lowestRateLimit === null || treeRemaining < lowestRateLimit) {
                lowestRateLimit = treeRemaining
            }
        }

        const treeJson = (await treeResponse.json()) as { tree: GitHubTreeItem[]; truncated?: boolean }

        if (treeJson.truncated) {
            warnings.push("GitHub truncated the repository tree; results may be incomplete.")
        }

        const paths = collectPathsFromTree(treeJson.tree)
        const structure = detectStructure(paths)

        const hasPackageJson = paths.some((path) => path.toLowerCase() === "package.json")

        const packageJson = hasPackageJson ? await readPackageJson(owner, repo, defaultBranch, headers) : null

        const { tooling, testing, frameworks } = detectTooling(paths, packageJson)

        if (lowestRateLimit !== null && lowestRateLimit < 5) {
            warnings.push(`GitHub API rate limit is low (remaining: ${lowestRateLimit}).`)
        }

        const enriched = await detectEnrichedSignals(owner, repo, defaultBranch, paths, packageJson, headers)

        const summary: RepoScanSummary = {
            repo: `${owner}/${repo}`,
            defaultBranch,
            language: repoJson.language ?? (languages.length > 0 ? languages[0] : null),
            languages: dedupeAndSort(languages),
            frameworks,
            tooling,
            testing,
            structure,
            topics: repoJson.topics ? dedupeAndSort(repoJson.topics) : [],
            warnings,
            ...enriched,
        }

        return NextResponse.json<RepoScanSummary>(summary)
    } catch (error) {
        console.error("Unexpected error while scanning repository", error)

        return NextResponse.json<RepoScanErrorResponse>(
            { error: "Unexpected error while scanning repository." },
            { status: 500 },
        )
    }
}
