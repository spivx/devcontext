"use client"

import { cn } from "@/lib/utils"
import { Check, ExternalLink, Info } from "lucide-react"
import { useCallback, useState, type ComponentPropsWithoutRef, type MouseEvent } from "react"
import { useWindowClickDismiss } from "@/hooks/use-window-click-dismiss"

export type InstructionsAnswerCardProps = {
  label: string
  iconElement: React.ReactNode
  hasTooltipContent: boolean
  infoLines?: string[]
  example?: string
  tags?: string[]
  docs?: string
  selected?: boolean
  disabled?: boolean
  disabledLabel?: string
  onClick?: () => void
} & Omit<ComponentPropsWithoutRef<"button">, "children">

export function InstructionsAnswerCard({
  label,
  iconElement,
  hasTooltipContent,
  infoLines,
  example,
  tags,
  docs,
  selected = false,
  disabled = false,
  disabledLabel,
  onClick,
  ...buttonProps
}: InstructionsAnswerCardProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  const closeTooltip = useCallback(() => {
    setIsTooltipOpen(false)
  }, [])

  useWindowClickDismiss(isTooltipOpen, closeTooltip)

  const toggleTooltip = (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation()
    setIsTooltipOpen((prev) => !prev)
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-disabled={disabled}
      className={cn(
        "group relative flex h-full items-center justify-between rounded-2xl border border-border/60 bg-background/90 px-5 py-4 text-left transition-all hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        disabled && "cursor-not-allowed opacity-60 hover:border-border/60 hover:shadow-none focus-visible:ring-0",
        selected && !disabled && "border-primary bg-primary/5 shadow-lg shadow-primary/20"
      )}
      {...buttonProps}
    >
      <div className="flex items-center gap-3">
        {iconElement}
        <div className="flex items-center gap-2">
          <span className="text-base font-medium text-foreground">{label}</span>
          {hasTooltipContent ? (
            <span
              className={cn(
                "relative flex items-center group/icon",
                isTooltipOpen && "pointer-events-auto"
              )}
              onClick={toggleTooltip}
            >
              <Info className="h-4 w-4 cursor-pointer text-muted-foreground transition-colors group-hover/icon:text-primary" />
              <div
                className={cn(
                  "pointer-events-none absolute left-0 top-full z-20 hidden w-60 rounded-xl border border-border/70 bg-popover p-3 text-xs leading-relaxed text-popover-foreground shadow-xl transition-all duration-150 ease-out md:left-1/2 md:-translate-x-1/2",
                  (isTooltipOpen || undefined) &&
                  "pointer-events-auto !flex !flex-col opacity-100 translate-y-0",
                  !isTooltipOpen && "opacity-0 translate-y-2",
                  "group-hover/icon:flex group-hover/icon:flex-col group-hover/icon:pointer-events-auto group-hover/icon:opacity-100 group-hover/icon:translate-y-0"
                )}
                onClick={(event) => event.stopPropagation()}
              >
                {infoLines?.map((line) => (
                  <span key={line} className="text-foreground">
                    {line}
                  </span>
                ))}
                {example ? (
                  <span className="mt-1 text-muted-foreground">{example}</span>
                ) : null}
                {tags && tags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1 text-[10px] uppercase tracking-wide text-muted-foreground/80">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-muted/80 px-2 py-0.5">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                {docs ? (
                  <a
                    href={docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                  >
                    <span>Open documentation</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
              </div>
            </span>
          ) : null}
          {disabledLabel ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/80">
              {disabledLabel}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {selected && !disabled ? (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-4 w-4" />
          </span>
        ) : null}
      </div>
    </button>
  )
}
