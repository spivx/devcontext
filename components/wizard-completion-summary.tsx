import { Button } from "@/components/ui/button"
import type { CompletionSummaryEntry } from "@/lib/wizard-summary"
import type { FileOutputConfig } from "@/types/wizard"

type WizardCompletionSummaryProps = {
  summary: CompletionSummaryEntry[]
  onBack: () => void
  onGenerate: () => void
  isGenerating: boolean
  autoFillNotice?: string | null
  onEditEntry?: (entryId: string) => void
  fileOptions: FileOutputConfig[]
  selectedFileId: string | null
  onSelectFile: (fileId: string) => void
}

export function WizardCompletionSummary({
  summary,
  onBack,
  onGenerate,
  isGenerating,
  autoFillNotice,
  onEditEntry,
  fileOptions,
  selectedFileId,
  onSelectFile,
}: WizardCompletionSummaryProps) {
  const selectedOption = fileOptions.find((file) => file.id === selectedFileId) ?? null

  return (
    <div
      className="space-y-6 rounded-3xl border border-border/80 bg-card/95 p-8 shadow-lg"
      data-testid="wizard-completion-summary"
    >
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
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="h-[26px] px-4 py-0 leading-none"
            >
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

      <div className="space-y-4 rounded-2xl border border-border/70 bg-background/90 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Output file
            </p>
            <p className="text-sm text-muted-foreground">
              Pick the instructions file format to generate. You can change this anytime.
            </p>
          </div>
          {selectedOption ? (
            <span className="rounded-full bg-secondary/30 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {selectedOption.filename}
            </span>
          ) : null}
        </div>
        <div className="grid gap-3 md:grid-cols-3" data-testid="wizard-file-options">
          {fileOptions.map((file) => {
            const isSelected = file.id === selectedFileId
            return (
              <button
                key={file.id}
                type="button"
                onClick={() => onSelectFile(file.id)}
                className={`flex flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${isSelected
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                  : "border-border/60 bg-background/95 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                  }`}
                data-testid={`wizard-file-option-${file.id}`}
              >
                <span className="text-sm font-semibold text-foreground">{file.label}</span>
                <span className="text-xs text-muted-foreground">{file.filename}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="space-y-3" data-testid="wizard-summary-entries">
        {summary.map((entry) => (
          <div
            key={entry.id}
            className="rounded-2xl border border-border/70 bg-background/90 p-5"
            data-testid={`wizard-summary-entry-${entry.id}`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <p className="text-sm font-medium text-muted-foreground">{entry.question}</p>
            </div>
            {entry.hasSelection ? (
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
                {entry.answers.map((answer, index) => (
                  <li key={answer}>
                    <div className="flex items-center gap-2">
                      <span>{answer}</span>
                      {index === 0 && entry.isDefaultApplied ? (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Default applied
                        </span>
                      ) : null}
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
