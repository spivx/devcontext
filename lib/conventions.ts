import { readFile } from "fs/promises"
import path from "path"

import type { RepoScanSummary, RepoStructureSummary } from "@/types/repo-scan"
import type { ConventionRule, LoadedConvention, StackConventions } from "@/types/conventions"
import type { WizardResponses } from "@/types/wizard"

const CONVENTIONS_DIR = path.join(process.cwd(), "conventions")

const BUILTIN_FALLBACK: LoadedConvention = {
  id: "default",
  applyToGlob: "**/*.{ts,tsx,js,jsx,md}",
  structureRelevant: ["src", "components", "tests", "apps", "packages"],
  defaults: {},
  rules: [],
  summaryMessage: null,
}

type ConventionsCacheEntry = {
  conventions: LoadedConvention
  hasStackFile: boolean
}

const cache = new Map<string, ConventionsCacheEntry>()

const readConventionsFile = async (stackId: string): Promise<StackConventions | null> => {
  try {
    const filePath = path.join(CONVENTIONS_DIR, `${stackId}.json`)
    const raw = await readFile(filePath, "utf8")
    const parsed = JSON.parse(raw) as StackConventions
    return parsed
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null
    }
    console.error(`Failed to load conventions for stack "${stackId}"`, error)
    return null
  }
}

const mergeConventions = (
  stackId: string,
  base: StackConventions | null,
  specific: StackConventions | null,
): LoadedConvention => {
  const applyToGlob = specific?.applyToGlob ?? base?.applyToGlob ?? BUILTIN_FALLBACK.applyToGlob
  const structureRelevant =
    specific?.structureRelevant ?? base?.structureRelevant ?? BUILTIN_FALLBACK.structureRelevant

  return {
    id: stackId,
    label: specific?.label ?? base?.label,
    applyToGlob,
    structureRelevant,
    defaults: {
      ...(base?.defaults ?? {}),
      ...(specific?.defaults ?? {}),
    },
    rules: [...(base?.rules ?? []), ...(specific?.rules ?? [])],
    summaryMessage:
      specific?.summaryMessage ?? base?.summaryMessage ?? BUILTIN_FALLBACK.summaryMessage ?? null,
  }
}

export type LoadedConventionsResult = ConventionsCacheEntry

export const loadStackConventions = async (stackId: string): Promise<LoadedConventionsResult> => {
  const normalized = stackId.trim().toLowerCase() || "default"
  if (cache.has(normalized)) {
    return cache.get(normalized)!
  }

  const base = await readConventionsFile("default")
  const specific = normalized !== "default" ? await readConventionsFile(normalized) : base
  const hasStackFile = Boolean(specific && normalized !== "default")

  const conventions = mergeConventions(normalized, base, specific)
  const entry: ConventionsCacheEntry = { conventions, hasStackFile }
  cache.set(normalized, entry)
  return entry
}

const matchesConditionList = (haystack: string[] | undefined | null, needles: string[] | undefined): boolean => {
  if (!needles || needles.length === 0) {
    return true
  }
  if (!Array.isArray(haystack) || haystack.length === 0) {
    return false
  }
  const normalized = haystack.map((value) => value.toLowerCase())
  return needles.some((needle) => normalized.includes(needle.toLowerCase()))
}

const structureHas = (
  structure: RepoStructureSummary | undefined,
  keys: Array<keyof RepoStructureSummary> | undefined,
  expected: boolean,
): boolean => {
  if (!keys || keys.length === 0) {
    return true
  }
  if (!structure) {
    return false
  }
  return keys.every((key) => Boolean(structure[key]) === expected)
}

const ruleMatches = (rule: ConventionRule, scan: RepoScanSummary): boolean => {
  const condition = rule.if ?? {}
  return (
    matchesConditionList(scan.tooling, condition.toolingIncludes) &&
    matchesConditionList(scan.testing, condition.testingIncludes) &&
    matchesConditionList(scan.frameworks, condition.frameworksInclude) &&
    matchesConditionList(scan.languages, condition.languagesInclude) &&
    (!condition.routingIs || condition.routingIs.includes((scan.routing ?? "") as typeof condition.routingIs[number])) &&
    structureHas(scan.structure, condition.structureHas, true) &&
    structureHas(scan.structure, condition.structureMissing, false)
  )
}

export const applyConventionRules = (
  base: WizardResponses,
  rules: StackConventions["rules"] | undefined,
  scan: RepoScanSummary,
): WizardResponses => {
  if (!rules || rules.length === 0) {
    return base
  }

  return rules.reduce<WizardResponses>((acc, rule) => {
    if (ruleMatches(rule, scan)) {
      return { ...acc, ...rule.set }
    }
    return acc
  }, { ...base })
}
