export const ANALYTICS_EVENTS = {
  PAGE_VIEW: "Page View",
  CREATE_INSTRUCTIONS_FILE: "Create My Instructions File",
  // Wizard interactions
  WIZARD_ANSWER_SELECTED: "Wizard Answer Selected",
  WIZARD_USE_DEFAULT: "Wizard Use Default",
  WIZARD_FREE_TEXT_SAVED: "Wizard Free Text Saved",
  WIZARD_FREE_TEXT_CLEARED: "Wizard Free Text Cleared",
  WIZARD_RESET: "Wizard Reset",
  // Summary dialog interactions
  SUMMARY_EDIT_OPEN: "Summary Edit Open",
  SUMMARY_EDIT_ANSWER_SELECTED: "Summary Edit Answer Selected",
  SUMMARY_EDIT_FREE_TEXT_SAVED: "Summary Edit Free Text Saved",
  SUMMARY_EDIT_FREE_TEXT_CLEARED: "Summary Edit Free Text Cleared",
  // Existing repo / scan interactions
  REPO_ANALYZE_SUBMIT: "Existing Repo Analyze Submit",
  REPO_SCAN_START: "Repo Scan Start",
  REPO_SCAN_RETRY: "Repo Scan Retry",
  REPO_SCAN_GENERATE_FILE: "Repo Scan Generate File",
  // Global UI events
  UI_CLICK: "UI Click",
  UI_INPUT: "UI Input",
  UI_SUBMIT: "UI Submit",
} as const

export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS]
