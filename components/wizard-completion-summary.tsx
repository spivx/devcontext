import { Button } from "@/components/ui/button"
import type { CompletionSummaryEntry } from "@/lib/wizard-summary"

type WizardCompletionSummaryProps = {
  summary: CompletionSummaryEntry[]
  onBack: () => void
  onGenerate: () => void
  isGenerating: boolean
}

export function WizardCompletionSummary({
  summary,
  onBack,
  onGenerate,
  isGenerating,
}: WizardCompletionSummaryProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-border/80 bg-card/95 p-8 shadow-lg">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Review your selections</h2>
        <p className="text-sm text-muted-foreground">
          Adjust anything before we create your instruction files.
        </p>
      </div>

      <div className="space-y-3">
        {summary.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-border/70 bg-background/90 p-5"
          >
            <p className="text-sm font-medium text-muted-foreground">{entry.question}</p>
            {entry.hasSelection ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {entry.answers.map((answer) => (
                  <li key={answer}>{answer}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-base font-semibold text-foreground">No selection</p>
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={onBack}>
          Back to questions
        </Button>
        <Button onClick={onGenerate} disabled={isGenerating}>
          {isGenerating ? "Generating..." : "Generate My Instructions"}
        </Button>
      </div>
    </div>
  )
}
