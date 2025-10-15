import { applyConventionRules, loadStackConventions } from "@/lib/conventions"
import { buildStepsForStack } from "@/lib/wizard-summary-data"
import type { RepoScanSummary } from "@/types/repo-scan"
import type { LoadedConvention } from "@/types/conventions"
import type { WizardResponses, WizardStep } from "@/types/wizard"

const STACK_FALLBACK = "react"

const toLowerArray = (values: string[] | undefined | null) =>
  Array.isArray(values) ? values.map((value) => value.toLowerCase()) : []

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

const detectTestingUnit = (scan: RepoScanSummary): string | null => {
  const testing = toLowerArray(scan.testing)
  if (testing.includes("pytest")) return "pytest"
  if (testing.includes("unittest")) return "unittest"
  if (testing.includes("vitest")) return "vitest"
  if (testing.includes("jest")) return "jest"
  if (testing.includes("jasmine")) return "jasmine-karma"
  return null
}

const detectTestingE2E = (scan: RepoScanSummary): string | null => {
  const testing = toLowerArray(scan.testing)
  if (testing.includes("playwright")) return "playwright"
  if (testing.includes("cypress")) return "cypress"
  return null
}

const detectToolingSummary = (scan: RepoScanSummary, stack: string): string | null => {
  if (scan.tooling && scan.tooling.length > 0) {
    return scan.tooling.join(" + ")
  }

  if (stack === "python") return "pip"
  if (stack === "nextjs") return "create-next-app"
  if (stack === "react") return "vite"
  if (stack === "angular") return "angular-cli"
  if (stack === "vue") return "vite"
  if (stack === "svelte") return "sveltekit"
  if (stack === "nuxt") return "nuxi"
  if (stack === "astro") return "astro"
  if (stack === "remix") return "create-remix"

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
}

export const buildResponsesFromScan = async (scan: RepoScanSummary): Promise<BuildResult> => {
  const stack = detectStack(scan)
  const { conventions, hasStackFile } = await loadStackConventions(stack)

  const base = createEmptyResponses(stack)
  const withDefaults: WizardResponses = { ...base, ...conventions.defaults }

  withDefaults.tooling = withDefaults.tooling ?? detectToolingSummary(scan, stack)
  withDefaults.language = withDefaults.language ?? detectLanguage(scan)
  withDefaults.testingUT = withDefaults.testingUT ?? detectTestingUnit(scan)
  withDefaults.testingE2E = withDefaults.testingE2E ?? detectTestingE2E(scan)
  withDefaults.fileNaming = withDefaults.fileNaming ?? detectFileNaming(scan)
  withDefaults.componentNaming = withDefaults.componentNaming ?? detectComponentNaming(scan)
  withDefaults.commitStyle = withDefaults.commitStyle ?? detectCommitStyle(scan)
  withDefaults.prRules = withDefaults.prRules ?? detectPRRules(scan)

  const afterRules = applyConventionRules(withDefaults, conventions.rules, scan)
  afterRules.stackSelection = stack

  const defaultedQuestionIds: Record<string, boolean> = {}
  const questionDefaults = await loadStackQuestionDefaults(stack, afterRules)
  questionDefaults.forEach(({ responseKey, questionId, value }) => {
    const currentValue = afterRules[responseKey]
    if (currentValue === null || currentValue === undefined || currentValue === "") {
      afterRules[responseKey] = value
      defaultedQuestionIds[questionId] = true
    }
  })

  if (!afterRules.tooling) {
    afterRules.tooling = detectToolingSummary(scan, stack)
  }
  if (!afterRules.language) {
    afterRules.language = detectLanguage(scan)
  }
  if (!afterRules.testingUT) {
    afterRules.testingUT = detectTestingUnit(scan)
  }
  if (!afterRules.testingE2E) {
    afterRules.testingE2E = detectTestingE2E(scan)
  }
  if (!afterRules.fileNaming) {
    afterRules.fileNaming = detectFileNaming(scan)
  }
  if (!afterRules.componentNaming) {
    afterRules.componentNaming = detectComponentNaming(scan)
  }

  return {
    stack,
    responses: afterRules,
    conventions,
    hasCustomConventions: hasStackFile,
    defaultedQuestionIds,
  }
}

export type ScanToWizardResult = BuildResult
