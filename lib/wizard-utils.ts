import type { DataAnswerSource, DataQuestionSource, WizardAnswer, WizardStep } from "@/types/wizard"

/**
 * Maps a data answer source to a wizard answer format
 */
export const mapAnswerSourceToWizard = (answer: DataAnswerSource): WizardAnswer => {
    const infoLines: string[] = []

    if (answer.pros && answer.pros.length > 0) {
        infoLines.push(`Pros: ${answer.pros.join(", ")}`)
    }

    if (answer.cons && answer.cons.length > 0) {
        infoLines.push(`Cons: ${answer.cons.join(", ")}`)
    }

    return {
        value: answer.value,
        label: answer.label,
        icon: answer.icon,
        example: answer.example,
        infoLines: infoLines.length > 0 ? infoLines : undefined,
        docs: answer.docs,
        tags: answer.tags,
        isDefault: answer.isDefault,
        disabled: answer.disabled,
        disabledLabel: answer.disabledLabel,
        skippable: answer.skippable,
    }
}

/**
 * Builds a wizard step from a question set
 */
export const buildStepFromQuestionSet = (
    id: string,
    title: string,
    questions: DataQuestionSource[]
): WizardStep => ({
    id,
    title,
    questions: questions.map((question) => ({
        id: question.id,
        question: question.question,
        allowMultiple: question.allowMultiple,
        answers: question.answers.map(mapAnswerSourceToWizard),
        skippable: question.skippable,
    })),
})

const formatLabelMap: Record<string, string> = {
    markdown: "Markdown",
    json: "JSON",
    "cursor-rules-json": "JSON",
}

const formatMimeTypeMap: Record<string, string> = {
    markdown: "text/markdown",
    json: "application/json",
    "cursor-rules-json": "application/json",
}

/**
 * Converts a stored format identifier into a human-friendly label
 */
export const getFormatLabel = (format?: string) => {
    if (!format) {
        return null
    }

    return formatLabelMap[format] ?? format
}

/**
 * Returns the browser mime-type associated with a stored format identifier
 */
export const getMimeTypeForFormat = (format?: string) => {
    if (!format) {
        return "text/plain"
    }

    return formatMimeTypeMap[format] ?? "text/plain"
}
