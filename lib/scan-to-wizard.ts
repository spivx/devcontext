import { applyConventionRules, loadStackConventions } from "@/lib/conventions"
import { loadStackQuestionMetadata, normalizeConventionValue } from "@/lib/question-metadata"
import { createEmptyResponses } from "@/lib/wizard-responses"
import type { RepoScanSummary } from "@/types/repo-scan"
import type { LoadedConvention } from "@/types/conventions"
import type { WizardResponses } from "@/types/wizard"

const STACK_FALLBACK = "unsupported"

const toLowerArray = (values: string[] | undefined | null) =>
  Array.isArray(values) ? values.map((value) => value.toLowerCase()) : []

const detectFromScanList = (
  scanList: string[] | undefined | null,
  candidates: string[] | undefined | null,
): string | null => {
  if (!Array.isArray(scanList) || scanList.length === 0) {
    return null
  }
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null
  }

  const normalizedScan = scanList.map((value) => normalizeConventionValue(value))

  for (const candidate of candidates) {
    if (normalizedScan.includes(normalizeConventionValue(candidate))) {
      return candidate
    }
  }

  return null
}

const applyDetectedValue = <Key extends keyof WizardResponses>(
  target: WizardResponses,
  key: Key,
  value: WizardResponses[Key] | null | undefined,
): void => {
  if (value === null || value === undefined) {
    return
  }
  if (typeof value === "string" && value.trim() === "") {
    return
  }
  target[key] = value
}

const detectStack = (scan: RepoScanSummary): string => {
  const frameworks = toLowerArray(scan.frameworks)
  const languages = toLowerArray(scan.languages)
  const primaryLanguage = scan.language ? scan.language.trim().toLowerCase() : null

  if (frameworks.some((name) => /next\.?js/.test(name))) return "nextjs"
  if (frameworks.includes("nuxt")) return "nuxt"
  if (frameworks.includes("remix")) return "remix"
  if (frameworks.includes("astro")) return "astro"
  if (frameworks.includes("angular")) return "angular"
  if (frameworks.includes("vue")) return "vue"
  if (frameworks.includes("svelte")) return "svelte"
  if (frameworks.includes("react")) return "react"
  if (languages.includes("python")) return "python"

  // No known framework detected; mark as unsupported instead of falling back
  return STACK_FALLBACK
}

export const inferStackFromScan = (scan: RepoScanSummary): string => detectStack(scan)

const detectLanguage = (scan: RepoScanSummary): string | null => {
  const languages = toLowerArray(scan.languages)
  if (languages.includes("typescript")) return "typescript"
  if (languages.includes("javascript")) return "javascript"
  if (languages.includes("python")) return "Python"
  return scan.language ? String(scan.language) : null
}

const detectTestingUnit = (scan: RepoScanSummary, candidates: string[] | undefined | null): string | null =>
  detectFromScanList(scan.testing, candidates)

const detectTestingE2E = (scan: RepoScanSummary, candidates: string[] | undefined | null): string | null =>
  detectFromScanList(scan.testing, candidates)

const detectToolingSummary = (scan: RepoScanSummary): string | null => {
  if (scan.tooling && scan.tooling.length > 0) {
    return scan.tooling.join(" + ")
  }

  return null
}

const detectFileNaming = (scan: RepoScanSummary): string | null => {
  const detected = (scan as Record<string, unknown>).fileNamingStyle
  return typeof detected === "string" ? detected : null
}

const detectComponentNaming = (scan: RepoScanSummary): string | null => {
  const detected = (scan as Record<string, unknown>).componentNamingStyle
  if (typeof detected === "string") {
    return detected === "camelcase" ? "camelCase" : detected
  }
  return null
}

const detectCommitStyle = (scan: RepoScanSummary): string | null => {
  const detected = (scan as Record<string, unknown>).commitMessageStyle
  if (detected === "gitmoji") return "gitmoji"
  if (detected === "conventional") return "conventional"
  return null
}

const detectPRRules = (scan: RepoScanSummary): string | null => {
  const ci = (scan as Record<string, unknown>).ci
  if (Array.isArray(ci) && ci.length > 0) {
    return "reviewRequired"
  }
  return null
}

type BuildResult = {
  stack: string
  responses: WizardResponses
  conventions: LoadedConvention
  hasCustomConventions: boolean
  defaultedQuestionIds: Record<string, boolean>
  defaultedResponseMeta: Partial<Record<keyof WizardResponses, { questionId: string; label: string; value: string }>>
}

export const buildResponsesFromScan = async (scan: RepoScanSummary): Promise<BuildResult> => {
  const stack = detectStack(scan)
  const { conventions, hasStackFile } = await loadStackConventions(stack)
  const { defaults: questionDefaults, answersByResponseKey } = await loadStackQuestionMetadata(stack)

  const base = createEmptyResponses(stack)
  const withDetected: WizardResponses = { ...base }

  applyDetectedValue(withDetected, "tooling", detectToolingSummary(scan))
  applyDetectedValue(withDetected, "language", detectLanguage(scan))
  applyDetectedValue(withDetected, "testingUT", detectTestingUnit(scan, answersByResponseKey.testingUT))
  applyDetectedValue(withDetected, "testingE2E", detectTestingE2E(scan, answersByResponseKey.testingE2E))
  applyDetectedValue(withDetected, "fileNaming", detectFileNaming(scan))
  applyDetectedValue(withDetected, "componentNaming", detectComponentNaming(scan))
  applyDetectedValue(withDetected, "commitStyle", detectCommitStyle(scan))
  applyDetectedValue(withDetected, "prRules", detectPRRules(scan))

  const afterRules = applyConventionRules(withDetected, conventions.rules, scan)
  afterRules.stackSelection = stack

  const defaultedQuestionIds: Record<string, boolean> = {}
  const defaultedResponseMeta: Partial<Record<
    keyof WizardResponses,
    { questionId: string; label: string; value: string }
  >> = {}
  questionDefaults.forEach(({ responseKey, questionId, value, label }) => {
    const currentValue = afterRules[responseKey]
    if (currentValue === null || currentValue === undefined || currentValue === "") {
      afterRules[responseKey] = value
      defaultedQuestionIds[questionId] = true
      defaultedResponseMeta[responseKey] = {
        questionId,
        label,
        value,
      }
    }
  })

  if (!afterRules.language) {
    applyDetectedValue(afterRules, "language", detectLanguage(scan))
  }
  if (!afterRules.testingUT) {
    applyDetectedValue(afterRules, "testingUT", detectTestingUnit(scan, answersByResponseKey.testingUT))
  }
  if (!afterRules.testingE2E) {
    applyDetectedValue(afterRules, "testingE2E", detectTestingE2E(scan, answersByResponseKey.testingE2E))
  }
  if (!afterRules.fileNaming) {
    applyDetectedValue(afterRules, "fileNaming", detectFileNaming(scan))
  }
  if (!afterRules.componentNaming) {
    applyDetectedValue(afterRules, "componentNaming", detectComponentNaming(scan))
  }

  return {
    stack,
    responses: afterRules,
    conventions,
    hasCustomConventions: hasStackFile,
    defaultedQuestionIds,
    defaultedResponseMeta,
  }
}

export type ScanToWizardResult = BuildResult
