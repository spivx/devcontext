import { useEffect } from "react"

import { ANALYTICS_EVENTS } from "@/lib/analytics-events"
import { track } from "@/lib/mixpanel"
import type { GlobalInteractionEventKey, GlobalInteractionProps } from "@/types/analytics"

const INTERACTIVE_SELECTOR =
  "[data-analytics-event], button, a[href], input, select, textarea, [role='button'], [role='menuitem'], [role='option']"

const IGNORED_SELECTOR = "[data-analytics-ignore='true']"

const MAX_TEXT_LENGTH = 120

const getInteractiveElement = (target: EventTarget | null): HTMLElement | null => {
  if (!(target instanceof HTMLElement)) {
    return null
  }

  if (target.closest(IGNORED_SELECTOR)) {
    return null
  }

  const element = target.closest(INTERACTIVE_SELECTOR)

  if (!element || !(element instanceof HTMLElement)) {
    return null
  }

  if (element.dataset.analyticsIgnore === "true") {
    return null
  }

  return element
}

const cleanText = (value: string | null | undefined) => {
  if (!value) {
    return undefined
  }

  const trimmed = value.replace(/\s+/g, " ").trim()

  if (!trimmed) {
    return undefined
  }

  return trimmed.slice(0, MAX_TEXT_LENGTH)
}

const getElementLabel = (element: HTMLElement) => {
  if (element.dataset.analyticsLabel) {
    return element.dataset.analyticsLabel
  }

  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    return cleanText(element.placeholder) ?? element.name ?? element.id ?? undefined
  }

  if (element instanceof HTMLSelectElement) {
    return element.name || element.id || undefined
  }

  if (element instanceof HTMLAnchorElement) {
    return cleanText(element.textContent)
  }

  return cleanText(element.textContent)
}

const getHref = (element: HTMLElement) => {
  if (!(element instanceof HTMLAnchorElement)) {
    return undefined
  }

  const href = element.getAttribute("href")

  if (!href) {
    return undefined
  }

  return href.startsWith("http") ? href : href.slice(0, MAX_TEXT_LENGTH)
}

const getInputMeta = (element: HTMLElement) => {
  if (element instanceof HTMLInputElement) {
    if (element.type === "checkbox" || element.type === "radio") {
      return {
        inputType: element.type,
        name: element.name || undefined,
        checked: element.checked,
      }
    }

    return {
      inputType: element.type,
      name: element.name || undefined,
      valueLength: element.value.length,
    }
  }

  if (element instanceof HTMLTextAreaElement) {
    return {
      inputType: "textarea",
      name: element.name || undefined,
      valueLength: element.value.length,
    }
  }

  if (element instanceof HTMLSelectElement) {
    return {
      inputType: "select",
      name: element.name || undefined,
      value: element.value ? element.value.slice(0, MAX_TEXT_LENGTH) : undefined,
    }
  }

  return undefined
}

const buildInteractionProps = (
  element: HTMLElement,
  eventType: GlobalInteractionEventKey,
  event: Event
): GlobalInteractionProps => {
  const label = getElementLabel(element)
  const inputMeta = getInputMeta(element)

  return {
    eventType,
    tag: element.tagName.toLowerCase(),
    id: element.id || undefined,
    role: element.getAttribute("role") ?? undefined,
    analyticsEvent: element.dataset.analyticsEvent || undefined,
    analyticsContext: element.dataset.analyticsContext || undefined,
    analyticsLabel: label,
    href: getHref(element),
    page: typeof window !== "undefined" ? window.location.pathname : undefined,
    inputMeta,
    key: event instanceof KeyboardEvent ? event.key : undefined,
  }
}

const trackInteraction = (eventType: GlobalInteractionEventKey, event: Event) => {
  const target = event.target as EventTarget | null
  const element = getInteractiveElement(target)

  if (!element) {
    return
  }

  track(ANALYTICS_EVENTS[eventType], buildInteractionProps(element, eventType, event))
}

export const useGlobalAnalytics = () => {
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const capture = true

    const handleClick = (event: MouseEvent) => {
      trackInteraction("UI_CLICK", event)
    }

    const handleChange = (event: Event) => {
      trackInteraction("UI_INPUT", event)
    }

    const handleSubmit = (event: Event) => {
      trackInteraction("UI_SUBMIT", event)
    }

    document.addEventListener("click", handleClick, { capture })
    document.addEventListener("change", handleChange, { capture })
    document.addEventListener("submit", handleSubmit, { capture })

    return () => {
      document.removeEventListener("click", handleClick, { capture })
      document.removeEventListener("change", handleChange, { capture })
      document.removeEventListener("submit", handleSubmit, { capture })
    }
  }, [])
}
