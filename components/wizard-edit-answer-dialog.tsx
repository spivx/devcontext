import { Button } from "@/components/ui/button"
import { WizardAnswerGrid } from "./wizard-answer-grid"
import type { Responses, WizardAnswer, WizardQuestion } from "@/types/wizard"
import { buildFilterPlaceholder, useAnswerFilter } from "@/hooks/use-answer-filter"

type WizardEditAnswerDialogProps = {
  question: WizardQuestion
  value: Responses[keyof Responses] | undefined
  onAnswerSelect: (answer: WizardAnswer) => void | Promise<void>
  onClose: () => void
}

export function WizardEditAnswerDialog({ question, value, onAnswerSelect, onClose }: WizardEditAnswerDialogProps) {
  const { answers, query, setQuery, isFiltering } = useAnswerFilter(question)
  const filterPlaceholder = buildFilterPlaceholder(question)
  const showNoMatches = Boolean(question.enableFilter && answers.length === 0 && query.trim().length > 0)
  const filterInputId = `edit-answer-filter-${question.id}`

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

        {question.enableFilter ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label htmlFor={filterInputId} className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Filter options
            </label>
            <div className="relative w-full sm:w-auto sm:min-w-[240px]">
              <input
                id={filterInputId}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={filterPlaceholder}
                className="w-full rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
              />
            </div>
            {isFiltering && !showNoMatches ? (
              <p className="text-xs text-muted-foreground sm:text-right">
                Showing {answers.length} of {question.answers.length}
              </p>
            ) : null}
          </div>
        ) : null}

        {showNoMatches ? (
          <p className="rounded-xl border border-border/70 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
            No options match "{query}". Try a different search.
          </p>
        ) : (
          <WizardAnswerGrid answers={answers} onAnswerClick={onAnswerSelect} isSelected={isSelected} />
        )}
      </div>
    </div>
  )
}
