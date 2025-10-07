import type { RepoScanSummary } from "@/types/repo-scan"
import type { WizardResponses } from "@/types/wizard"

const includesAny = (arr: string[] | undefined | null, patterns: RegExp[]) =>
  Array.isArray(arr) && arr.some((v) => patterns.some((p) => p.test(v.toLowerCase())))

const pickStack = (scan: RepoScanSummary): string => {
  const frameworks = (scan.frameworks ?? []).map((f) => f.toLowerCase())
  const languages = (scan.languages ?? []).map((l) => l.toLowerCase())

  if (frameworks.some((f) => /next\.?js/.test(f))) return "nextjs"
  if (frameworks.includes("react")) return "react"
  if (frameworks.includes("angular")) return "angular"
  if (frameworks.includes("vue")) return "vue"
  if (frameworks.includes("svelte")) return "svelte"
  if (languages.includes("python")) return "python"
  return "react"
}

const pickLanguage = (scan: RepoScanSummary): string | null => {
  const languages = (scan.languages ?? []).map((l) => l.toLowerCase())
  if (languages.includes("typescript")) return "typescript"
  if (languages.includes("javascript")) return "javascript"
  if (languages.includes("python")) return "python"
  return scan.language ? String(scan.language) : null
}

const pickTestingUT = (scan: RepoScanSummary): string | null => {
  const testing = (scan.testing ?? []).map((t) => t.toLowerCase())
  if (testing.includes("vitest")) return "vitest"
  if (testing.includes("jest")) return "jest"
  return null
}

const pickTestingE2E = (scan: RepoScanSummary): string | null => {
  const testing = (scan.testing ?? []).map((t) => t.toLowerCase())
  if (testing.includes("playwright")) return "playwright"
  if (testing.includes("cypress")) return "cypress"
  return null
}

const pickStyling = (scan: RepoScanSummary, stack: string): string => {
  const tooling = (scan.tooling ?? []).map((t) => t.toLowerCase())
  if (tooling.includes("tailwind css") || tooling.includes("tailwind")) return "tailwind"
  return stack === "nextjs" ? "tailwind" : "cssmodules"
}

const pickFileNaming = (scan: RepoScanSummary): string => {
  const detected = (scan as any).fileNamingStyle as string | undefined | null
  if (!detected) return "kebab-case"
  switch (detected) {
    case "kebab-case":
    case "camelCase":
    case "PascalCase":
    case "snake_case":
      return detected
    default:
      return "kebab-case"
  }
}

const pickComponentNaming = (scan: RepoScanSummary): string => {
  const detected = (scan as any).componentNamingStyle as string | undefined | null
  if (!detected) return "PascalCase"
  if (detected === "PascalCase" || detected === "camelCase") {
    return detected
  }
  return detected === "camelcase" ? "camelCase" : "PascalCase"
}

const pickCodeStyle = (scan: RepoScanSummary): string => {
  const detected = (scan as any).codeStylePreference as string | undefined | null
  if (!detected) return "airbnb"
  if (detected === "standardjs") return "standardjs"
  if (detected === "airbnb") return "airbnb"
  return "airbnb"
}

const pickFileStructure = (scan: RepoScanSummary, stack: string): string => {
  if (stack === "nextjs") {
    // Prefer App Router by default; hybrid/pages if hints present (see enriched fields if any)
    const routing = (scan as any).routing as string | undefined
    if (routing === "pages") return "pages-directory"
    if (routing === "hybrid") return "hybrid-router"
    return "app-directory"
  }
  const st = scan.structure ?? { components: false, tests: false }
  return st.components && st.tests ? "nested" : "flat"
}

const pickStateMgmt = (scan: RepoScanSummary, stack: string): string => {
  const detected = ((scan as any).stateMgmt as string | undefined) ?? null
  if (detected) return detected
  return stack === "nextjs" ? "zustand" : "context-hooks"
}

const pickDataFetching = (scan: RepoScanSummary, stack: string): string => {
  const detected = ((scan as any).dataFetching as string | undefined) ?? null
  if (detected) return detected
  return stack === "nextjs" ? "server-components" : "swr"
}

const pickAuth = (scan: RepoScanSummary, stack: string): string => {
  const detected = ((scan as any).auth as string | undefined) ?? null
  if (detected) return detected
  return stack === "nextjs" ? "next-auth" : "env"
}

const pickValidation = (scan: RepoScanSummary): string => {
  const detected = ((scan as any).validation as string | undefined) ?? null
  if (detected) return detected
  return "zod"
}

const pickLogging = (scan: RepoScanSummary, stack: string): string => {
  const detected = ((scan as any).logging as string | undefined) ?? null
  if (detected) return detected
  return stack === "nextjs" ? "sentry" : "structured"
}

const pickCommitStyle = (scan: RepoScanSummary): string => {
  const detected = ((scan as any).commitMessageStyle as string | undefined) ?? null
  if (detected === "gitmoji") return "gitmoji"
  if (detected === "conventional") return "conventional"
  const codeQuality = ((scan as any).codeQuality as string[] | undefined) ?? []
  return includesAny(codeQuality, [/commitlint/, /semantic-release/, /changesets/]) ? "conventional" : "conventional"
}

const pickPrRules = (scan: RepoScanSummary): string => {
  const ci = ((scan as any).ci as string[] | undefined) ?? []
  // If CI present, lean into code review requirement
  return ci.length > 0 ? "reviewRequired" : "reviewRequired"
}

const buildToolingSummary = (scan: RepoScanSummary, stack: string): string => {
  const parts = scan.tooling ?? []
  if (parts.length > 0) return parts.join(" + ")
  return stack === "nextjs" ? "create-next-app" : stack === "react" ? "vite" : "custom-config"
}

export type ScanToWizardResult = {
  stack: string
  responses: WizardResponses
}

export function buildResponsesFromScan(scan: RepoScanSummary): ScanToWizardResult {
  const stack = pickStack(scan)
  const language = pickLanguage(scan)

  const responses: WizardResponses = {
    stackSelection: stack,
    tooling: buildToolingSummary(scan, stack),
    language,
    fileStructure: pickFileStructure(scan, stack),
    styling: pickStyling(scan, stack),
    testingUT: pickTestingUT(scan),
    testingE2E: pickTestingE2E(scan),
    projectPriority: "maintainability",
    codeStyle: pickCodeStyle(scan),
    variableNaming: "camelCase",
    fileNaming: pickFileNaming(scan),
    componentNaming: pickComponentNaming(scan),
    exports: "named",
    comments: "docblocks",
    collaboration: "async",
    stateManagement: pickStateMgmt(scan, stack),
    apiLayer: stack === "nextjs" ? "server-actions" : "http-client",
    folders: "by-feature",
    dataFetching: pickDataFetching(scan, stack),
    reactPerf: "memoHooks",
    auth: pickAuth(scan, stack),
    validation: pickValidation(scan),
    logging: pickLogging(scan, stack),
    commitStyle: pickCommitStyle(scan),
    prRules: pickPrRules(scan),
    outputFile: null,
  }

  return { stack, responses }
}
