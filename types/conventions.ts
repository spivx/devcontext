import type { RepoScanSummary, RepoStructureSummary } from "@/types/repo-scan"
import type { WizardResponses } from "@/types/wizard"

export type ConventionCondition = {
  toolingIncludes?: string[]
  testingIncludes?: string[]
  frameworksInclude?: string[]
  languagesInclude?: string[]
  structureHas?: Array<keyof RepoStructureSummary>
  structureMissing?: Array<keyof RepoStructureSummary>
  routingIs?: Array<NonNullable<RepoScanSummary["routing"]>>
}

export type ConventionRule = {
  if: ConventionCondition
  set: Partial<WizardResponses>
}

export type StackConventions = {
  id: string
  label?: string
  applyToGlob?: string
  structureRelevant?: Array<keyof RepoStructureSummary>
  defaults?: Partial<WizardResponses>
  rules?: ConventionRule[]
  summaryMessage?: string | null
}

export type LoadedConvention = Required<Pick<StackConventions, "id">> &
  Omit<StackConventions, "id"> & {
    applyToGlob: string
    structureRelevant: Array<keyof RepoStructureSummary>
    defaults: Partial<WizardResponses>
    rules: ConventionRule[]
  }
