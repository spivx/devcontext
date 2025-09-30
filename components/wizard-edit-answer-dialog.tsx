import { Button } from "@/components/ui/button"
import { WizardAnswerGrid } from "./wizard-answer-grid"
import type { Responses, WizardAnswer, WizardQuestion } from "@/types/wizard"

type WizardEditAnswerDialogProps = {
  question: WizardQuestion
  value: Responses[keyof Responses] | undefined
  onAnswerSelect: (answer: WizardAnswer) => void | Promise<void>
  onClose: () => void
}

export function WizardEditAnswerDialog({ question, value, onAnswerSelect, onClose }: WizardEditAnswerDialogProps) {
  const isSelected = (candidate: string) => {
    if (question.allowMultiple) {
      return Array.isArray(value) && value.includes(candidate)
    }

    return value === candidate
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-background/80 p-6 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-2xl space-y-6 rounded-2xl border border-border/70 bg-card/95 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Edit selection</span>
            <h3 className="text-xl font-semibold text-foreground">{question.question}</h3>
            {question.allowMultiple ? (
              <p className="text-xs text-muted-foreground">You can pick more than one option.</p>
            ) : null}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>

        <WizardAnswerGrid answers={question.answers} onAnswerClick={onAnswerSelect} isSelected={isSelected} />
      </div>
    </div>
  )
}
