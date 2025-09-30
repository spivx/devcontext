import { Button } from "@/components/ui/button"
import type { CompletionSummaryEntry } from "@/lib/wizard-summary"

type WizardCompletionSummaryProps = {
  summary: CompletionSummaryEntry[]
  onBack: () => void
  onGenerate: () => void
  isGenerating: boolean
  autoFillNotice?: string | null
  onEditEntry?: (entryId: string) => void
}

export function WizardCompletionSummary({
  summary,
  onBack,
  onGenerate,
  isGenerating,
  autoFillNotice,
  onEditEntry,
}: WizardCompletionSummaryProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-border/80 bg-card/95 p-8 shadow-lg">
      <div className="space-y-3">
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Review your selections</h2>
            <p className="text-sm text-muted-foreground">
              Adjust anything before we create your instruction files.
            </p>
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
        {autoFillNotice ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium text-primary">
            {autoFillNotice}
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        {summary.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-border/70 bg-background/90 p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{entry.question}</p>
              {entry.isAutoFilled ? (
                <span className="rounded-full bg-secondary/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Default applied
                </span>
              ) : null}
            </div>
            {entry.hasSelection ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {entry.answers.map((answer, index) => (
                  <li key={answer}>
                    <div className="flex items-center gap-2">
                      <span>{answer}</span>
                      {index === 0 && !entry.isReadOnlyOnSummary ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="px-2 text-xs font-semibold text-primary underline"
                          onClick={() => onEditEntry?.(entry.id)}
                        >
                          Edit
                        </Button>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="mt-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <span>No selection</span>
                {!entry.isReadOnlyOnSummary ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-2 text-xs font-semibold text-primary underline"
                    onClick={() => onEditEntry?.(entry.id)}
                  >
                    Edit
                  </Button>
                ) : null}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
