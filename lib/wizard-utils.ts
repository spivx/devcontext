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
    })),
})