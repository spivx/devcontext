import type { LoadedConvention } from "@/types/conventions"
import type { WizardResponses } from "@/types/wizard"

export const normalizeConventionValue = (value: string): string => value.trim().toLowerCase()

export const collectConventionValues = (
  conventions: LoadedConvention,
  key: keyof WizardResponses,
): string[] => {
  const values: string[] = []
  const seen = new Set<string>()

  const pushValue = (candidate: unknown) => {
    if (typeof candidate !== "string") {
      return
    }
    const normalized = normalizeConventionValue(candidate)
    if (!normalized || seen.has(normalized)) {
      return
    }
    seen.add(normalized)
    values.push(candidate)
  }

  pushValue(conventions.defaults[key])

  conventions.rules.forEach((rule) => {
    pushValue(rule.set?.[key])
  })

  return values
}
