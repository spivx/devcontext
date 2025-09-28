import { getAccessibleIconColor, getFallbackInitials, getIconDescriptor, hexToRgba, iconColorOverrides } from "@/lib/icon-utils"
import type { WizardAnswer } from "@/types/wizard"

import { InstructionsAnswerCard } from "./instructions-answer-card"

type WizardAnswerGridProps = {
  answers: WizardAnswer[]
  onAnswerClick: (answer: WizardAnswer) => void
  isSelected: (value: string) => boolean
}

export function WizardAnswerGrid({ answers, onAnswerClick, isSelected }: WizardAnswerGridProps) {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-2">
      {answers.map((answer) => {
        const iconDescriptor = getIconDescriptor(answer.icon ?? answer.value)
        const iconHex = iconDescriptor
          ? iconColorOverrides[iconDescriptor.slug] ?? iconDescriptor.hex
          : undefined
        const iconColor = iconHex ? getAccessibleIconColor(iconHex) : undefined
        const iconBackgroundColor = iconColor ? hexToRgba(iconColor, 0.18) : null
        const iconRingColor = iconColor ? hexToRgba(iconColor, 0.32) : null
        const fallbackInitials = getFallbackInitials(answer.label)
        const iconElement = iconDescriptor ? (
          <span
            aria-hidden
            className={`flex h-10 w-10 items-center justify-center rounded-xl text-muted-foreground ring-1 ring-border/40${iconColor ? "" : " bg-secondary/40"}`}
            style={{
              color: iconColor,
              backgroundColor: iconBackgroundColor ?? undefined,
              boxShadow: iconRingColor ? `inset 0 0 0 1px ${iconRingColor}` : undefined,
            }}
          >
            <span
              className="inline-flex h-6 w-6 items-center justify-center text-current [&>svg]:h-full [&>svg]:w-full"
              style={{ color: iconColor }}
              dangerouslySetInnerHTML={{ __html: iconDescriptor.markup }}
            />
          </span>
        ) : (
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40 text-xs font-semibold uppercase tracking-wide text-muted-foreground ring-1 ring-border/40">
            {fallbackInitials}
          </span>
        )

        const hasTooltipContent = Boolean(
          (answer.infoLines && answer.infoLines.length > 0) ||
          answer.example ||
          (answer.tags && answer.tags.length > 0) ||
          answer.docs
        )

        return (
          <InstructionsAnswerCard
            key={answer.value}
            onClick={() => {
              void onAnswerClick(answer)
            }}
            label={answer.label}
            iconElement={iconElement}
            hasTooltipContent={hasTooltipContent}
            infoLines={answer.infoLines}
            example={answer.example}
            tags={answer.tags}
            docs={answer.docs}
            selected={isSelected(answer.value)}
            disabled={answer.disabled}
            disabledLabel={answer.disabledLabel}
          />
        )
      })}
    </div>
  )
}
