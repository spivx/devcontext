export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "Page View",
  CREATE_INSTRUCTIONS_FILE: "Create My Instructions File",
} as const

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]
