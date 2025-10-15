import { collectConventionValues, normalizeConventionValue } from "@/lib/convention-values"
import { applyConventionRules, loadStackConventions } from "@/lib/conventions"
import { buildStepsForStack } from "@/lib/wizard-summary-data"
import type { RepoScanSummary } from "@/types/repo-scan"
import type { LoadedConvention } from "@/types/conventions"
import type { WizardResponses, WizardStep } from "@/types/wizard"

const STACK_FALLBACK = "react"

const toLowerArray = (values: string[] | undefined | null) =>
  Array.isArray(values) ? values.map((value) => value.toLowerCase()) : []

const detectFromScanList = (
  scanList: string[] | undefined | null,
  conventions: LoadedConvention,
  key: keyof WizardResponses,
): string | null => {
  if (!Array.isArray(scanList) || scanList.length === 0) {
    return null
  }
  const candidates = collectConventionValues(conventions, key)
  if (candidates.length === 0) {
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

  if (frameworks.some((name) => /next\.?js/.test(name))) return "nextjs"
  if (frameworks.includes("nuxt")) return "nuxt"
  if (frameworks.includes("remix")) return "remix"
  if (frameworks.includes("astro")) return "astro"
  if (frameworks.includes("angular")) return "angular"
  if (frameworks.includes("vue")) return "vue"
  if (frameworks.includes("svelte")) return "svelte"
  if (frameworks.includes("react")) return "react"
  if (languages.includes("python")) return "python"
  return STACK_FALLBACK
}

export const inferStackFromScan = (scan: RepoScanSummary): string => detectStack(scan)

const createEmptyResponses = (stack: string): WizardResponses => ({
  stackSelection: stack,
  tooling: null,
  language: null,
  fileStructure: null,
  styling: null,
  testingUT: null,
  testingE2E: null,
  projectPriority: null,
  codeStyle: null,
  variableNaming: null,
  fileNaming: null,
  componentNaming: null,
  exports: null,
  comments: null,
  collaboration: null,
  stateManagement: null,
  apiLayer: null,
  folders: null,
  dataFetching: null,
  reactPerf: null,
  auth: null,
  validation: null,
  logging: null,
  commitStyle: null,
  prRules: null,
  outputFile: null,
})

const detectLanguage = (scan: RepoScanSummary): string | null => {
  const languages = toLowerArray(scan.languages)
  if (languages.includes("typescript")) return "typescript"
  if (languages.includes("javascript")) return "javascript"
  if (languages.includes("python")) return "Python"
  return scan.language ? String(scan.language) : null
}

const detectTestingUnit = (scan: RepoScanSummary, conventions: LoadedConvention): string | null =>
  detectFromScanList(scan.testing, conventions, "testingUT")

const detectTestingE2E = (scan: RepoScanSummary, conventions: LoadedConvention): string | null =>
  detectFromScanList(scan.testing, conventions, "testingE2E")

const detectToolingSummary = (scan: RepoScanSummary, conventions: LoadedConvention): string | null => {
  if (scan.tooling && scan.tooling.length > 0) {
    return scan.tooling.join(" + ")
  }

  const defaultTooling = conventions.defaults.tooling
  if (typeof defaultTooling === "string" && defaultTooling.trim().length > 0) {
    return defaultTooling
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

type StackQuestionDefault = {
  questionId: string
  responseKey: keyof WizardResponses
  value: string
  label: string
}

const defaultsCache = new Map<string, StackQuestionDefault[]>()

const extractDefaultsFromSteps = (steps: WizardStep[], template: WizardResponses): StackQuestionDefault[] => {
  const defaults: StackQuestionDefault[] = []
  steps.forEach((step) => {
    step.questions.forEach((question) => {
      const rawKey = question.responseKey ?? question.id
      if (!rawKey || rawKey === "stackSelection") {
        return
      }
      const defaultAnswer = question.answers.find((answer) => answer.isDefault && !answer.disabled)
      if (!defaultAnswer) {
        return
      }
      if (!(rawKey in template)) {
        return
      }
      const key = rawKey as keyof WizardResponses
      defaults.push({
        questionId: question.id,
        responseKey: key,
        value: defaultAnswer.value,
        label: defaultAnswer.label ?? defaultAnswer.value,
      })
    })
  })
  return defaults
}

const loadStackQuestionDefaults = async (
  stack: string,
  template: WizardResponses,
): Promise<StackQuestionDefault[]> => {
  const normalized = stack.trim().toLowerCase()
  if (defaultsCache.has(normalized)) {
    return defaultsCache.get(normalized)!
  }

  const { steps } = await buildStepsForStack(stack)
  const defaults = extractDefaultsFromSteps(steps, template)
  defaultsCache.set(normalized, defaults)
  return defaults
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

  const base = createEmptyResponses(stack)
  const withDefaults: WizardResponses = { ...base, ...conventions.defaults }

  applyDetectedValue(withDefaults, "tooling", detectToolingSummary(scan, conventions))
  applyDetectedValue(withDefaults, "language", detectLanguage(scan))
  applyDetectedValue(withDefaults, "testingUT", detectTestingUnit(scan, conventions))
  applyDetectedValue(withDefaults, "testingE2E", detectTestingE2E(scan, conventions))
  applyDetectedValue(withDefaults, "fileNaming", detectFileNaming(scan))
  applyDetectedValue(withDefaults, "componentNaming", detectComponentNaming(scan))
  applyDetectedValue(withDefaults, "commitStyle", detectCommitStyle(scan))
  applyDetectedValue(withDefaults, "prRules", detectPRRules(scan))

  const afterRules = applyConventionRules(withDefaults, conventions.rules, scan)
  afterRules.stackSelection = stack

  const defaultedQuestionIds: Record<string, boolean> = {}
  const defaultedResponseMeta: Partial<Record<
    keyof WizardResponses,
    { questionId: string; label: string; value: string }
  >> = {}
  const questionDefaults = await loadStackQuestionDefaults(stack, afterRules)
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

  if (!afterRules.tooling) {
    applyDetectedValue(afterRules, "tooling", detectToolingSummary(scan, conventions))
  }
  if (!afterRules.language) {
    applyDetectedValue(afterRules, "language", detectLanguage(scan))
  }
  if (!afterRules.testingUT) {
    applyDetectedValue(afterRules, "testingUT", detectTestingUnit(scan, conventions))
  }
  if (!afterRules.testingE2E) {
    applyDetectedValue(afterRules, "testingE2E", detectTestingE2E(scan, conventions))
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
