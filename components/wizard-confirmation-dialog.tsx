import { Button } from "@/components/ui/button"
import type { WizardConfirmationIntent } from "@/types/wizard"

type WizardConfirmationDialogProps = {
  intent: WizardConfirmationIntent
  onCancel: () => void
  onConfirm: () => void
}

const copyByIntent: Record<WizardConfirmationIntent, {
  title: string
  description: string
  confirmLabel: string
}> = {
  reset: {
    title: "Start over?",
    description: "This will clear all of your current selections. Are you sure you want to continue?",
    confirmLabel: "Reset Wizard",
  },
}

export function WizardConfirmationDialog({ intent, onCancel, onConfirm }: WizardConfirmationDialogProps) {
  const { title, description, confirmLabel } = copyByIntent[intent]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
      data-testid="wizard-confirmation-dialog"
    >
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-2xl">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Keep My Answers
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            data-testid="wizard-confirmation-confirm"
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
