import type { FreeTextResponses, Responses } from "@/types/wizard"

export type StoredWizardState = {
  stackId: string
  stackLabel?: string
  responses: Responses
  freeTextResponses?: FreeTextResponses
  autoFilledMap: Record<string, boolean>
  defaultedMap?: Record<string, boolean>
  updatedAt: number
}

const STORAGE_PREFIX = "devcontext:wizard"

const buildStorageKey = (stackId: string) => `${STORAGE_PREFIX}:${stackId}`

export const persistWizardState = (state: StoredWizardState) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    const key = buildStorageKey(state.stackId)
    window.localStorage.setItem(key, JSON.stringify(state))
  } catch (error) {
    console.warn("Unable to persist wizard state", error)
  }
}

export const loadWizardState = (stackId: string): StoredWizardState | null => {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const key = buildStorageKey(stackId)
    const raw = window.localStorage.getItem(key)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as StoredWizardState
    return parsed
  } catch (error) {
    console.warn("Unable to load wizard state", error)
    return null
  }
}

export const clearWizardState = (stackId: string) => {
  if (typeof window === "undefined") {
    return
  }

  try {
    const key = buildStorageKey(stackId)
    window.localStorage.removeItem(key)
  } catch (error) {
    console.warn("Unable to clear wizard state", error)
  }
}
