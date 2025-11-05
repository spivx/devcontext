import mixpanel from "mixpanel-browser"

import { ANALYTICS_EVENTS, type AnalyticsEvent } from "@/lib/analytics-events"

declare global {
  interface Window {
    __mixpanel_initialized?: boolean
  }
}

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

const initializeMixpanel = () => {
  if (typeof window === "undefined" || window.__mixpanel_initialized) {
    return
  }

  if (!MIXPANEL_TOKEN) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Mixpanel token is missing. Set NEXT_PUBLIC_MIXPANEL_TOKEN to enable analytics.")
    }
    return
  }

  mixpanel.init(MIXPANEL_TOKEN, {
    debug: false,
    track_pageview: false,
    persistence: "localStorage",
  })

  window.__mixpanel_initialized = true
  mixpanel.track("Page Load", { path: window.location.pathname })
}

if (typeof window !== "undefined") {
  initializeMixpanel()
}

export const initMixpanel = initializeMixpanel

export const track = (event: AnalyticsEvent, props?: Record<string, unknown>) => {
  if (typeof window === "undefined") {
    return
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[mixpanel track]", event, props)
    return
  }

  if (!window.__mixpanel_initialized) {
    initializeMixpanel()
  }

  if (!window.__mixpanel_initialized) {
    return
  }

  mixpanel.track(event, props)
}

export const identify = (userId: string) => {
  if (typeof window === "undefined") {
    return
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[mixpanel identify]", userId)
    return
  }

  if (!window.__mixpanel_initialized) {
    initializeMixpanel()
  }

  if (!window.__mixpanel_initialized) {
    return
  }

  mixpanel.identify(userId)
}

export const trackPageView = (path: string, search?: string) => {
  track(ANALYTICS_EVENTS.PAGE_VIEW, {
    path,
    search: search || undefined,
  })
}
