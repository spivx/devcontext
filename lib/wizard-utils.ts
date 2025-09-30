import type { DataAnswerSource, DataQuestionSource, FileOutputConfig, WizardAnswer, WizardStep } from "@/types/wizard"

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

    const isDisabled = answer.disabled ?? (answer.enabled === false)
    const disabledLabel = answer.disabledLabel ?? (answer.enabled === false ? "Soon" : undefined)

    return {
        value: answer.value,
        label: answer.label,
        icon: answer.icon,
        example: answer.example,
        infoLines: infoLines.length > 0 ? infoLines : undefined,
        docs: answer.docs,
        tags: answer.tags,
        isDefault: answer.isDefault,
        disabled: isDisabled,
        disabledLabel,
        filename: answer.filename,
        format: answer.format,
        enabled: answer.enabled,
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
            responseKey: question.responseKey,
            isReadOnlyOnSummary: question.isReadOnlyOnSummary,
            answers: question.answers.map(mapAnswerSourceToWizard),
        })),
})

export const buildFileOptionsFromQuestion = (
    question?: DataQuestionSource | null
): FileOutputConfig[] => {
    if (!question) {
        return []
    }

    return question.answers
        .filter((answer) => answer.enabled !== false)
        .map((answer) => ({
            id: answer.value,
            label: answer.label,
            filename: answer.filename ?? answer.label,
            format: answer.format ?? "markdown",
            enabled: answer.enabled,
            icon: answer.icon,
            docs: answer.docs,
            isDefault: answer.isDefault,
        }))
}

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
