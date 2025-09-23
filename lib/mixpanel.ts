import mixpanel from "mixpanel-browser"

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN

let isMixpanelInitialized = false

export const initMixpanel = () => {
  if (typeof window === "undefined" || isMixpanelInitialized) {
    return
  }

  if (!MIXPANEL_TOKEN) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Mixpanel token is missing. Set NEXT_PUBLIC_MIXPANEL_TOKEN to enable analytics.")
    }
    return
  }

  mixpanel.init(MIXPANEL_TOKEN, {
    debug: process.env.NODE_ENV !== "production",
    ignore_dnt: true,
  })

  isMixpanelInitialized = true
}

export const track = (event: string, props?: Record<string, unknown>) => {
  if (typeof window === "undefined" || !isMixpanelInitialized) {
    return
  }

  mixpanel.track(event, props)
}

export const identify = (userId: string) => {
  if (typeof window === "undefined" || !isMixpanelInitialized) {
    return
  }

  mixpanel.identify(userId)
}

export const trackPageView = (path: string, search?: string) => {
  track("Page View", {
    path,
    search: search || undefined,
  })
}
