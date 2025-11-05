export type GlobalInteractionEventKey = "UI_CLICK" | "UI_INPUT" | "UI_SUBMIT"

export interface GlobalInteractionProps {
  eventType: GlobalInteractionEventKey
  tag: string
  id?: string
  role?: string | null
  analyticsEvent?: string
  analyticsContext?: string
  analyticsLabel?: string
  href?: string
  page?: string
  inputMeta?:
    | {
        inputType: string
        name?: string
        valueLength?: number
        checked?: boolean
        value?: string
      }
    | undefined
  key?: string
}
