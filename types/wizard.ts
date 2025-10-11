import type { PropsWithChildren } from "react"

export type DataAnswerSource = {
    value: string
    label: string
    icon?: string
    example?: string
    docs?: string
    pros?: string[]
    cons?: string[]
    tags?: string[]
    isDefault?: boolean
    disabled?: boolean
    disabledLabel?: string
    enabled?: boolean
    filename?: string
    format?: string
}

export type QuestionFreeTextConfig = {
    enabled: boolean
    suggestions?: string[]
}

export type DataQuestionSource = {
    id: string
    question: string
    allowMultiple?: boolean
    responseKey?: string
    isReadOnlyOnSummary?: boolean
    enableFilter?: boolean
    answers: DataAnswerSource[]
    freeText?: QuestionFreeTextConfig
}

export type FileOutputConfig = {
    id: string
    label: string
    filename: string
    format: string
    slug: string
    enabled?: boolean
    icon?: string
    docs?: string
    isDefault?: boolean
}

export type WizardAnswer = {
    value: string
    label: string
    icon?: string
    example?: string
    infoLines?: string[]
    tags?: string[]
    isDefault?: boolean
    disabled?: boolean
    disabledLabel?: string
    docs?: string
    filename?: string
    format?: string
    enabled?: boolean
}

export type WizardQuestion = {
    id: string
    question: string
    allowMultiple?: boolean
    responseKey?: string
    isReadOnlyOnSummary?: boolean
    enableFilter?: boolean
    answers: WizardAnswer[]
    freeText?: QuestionFreeTextConfig
}

export type WizardStep = {
    id: string
    title: string
    questions: WizardQuestion[]
}

export type StackWizardShellProps = PropsWithChildren<{
    showWizard?: boolean
}>

export type WizardConfirmationIntent = "reset"

export type InstructionsWizardProps = {
    initialStackId?: string | null
    initialStackLabel?: string | null
    initialStackStep?: WizardStep | null
    onStackSelected?: (stackId: string, stackLabel?: string) => void
    onStackCleared?: () => void
    autoStartAfterStackSelection?: boolean
    onComplete?: (stackId: string | null) => void
}

export type Responses = Record<string, string | string[] | null | undefined>
export type FreeTextResponses = Record<string, string | null | undefined>
export interface WizardResponses {
    stackSelection: string | null;
    tooling: string | null;
    language: string | null;
    fileStructure: string | null;
    styling: string | null;
    testingUT: string | null;
    testingE2E: string | null;
    projectPriority: string | null;
    codeStyle: string | null;
    variableNaming: string | null;
    fileNaming: string | null;
    componentNaming: string | null;
    exports: string | null;
    comments: string | null;
    collaboration: string | null;
    stateManagement: string | null;
    apiLayer: string | null;
    folders: string | null;
    dataFetching: string | null;
    reactPerf: string | null;
    auth: string | null;
    validation: string | null;
    logging: string | null;
    commitStyle: string | null;
    prRules: string | null;
    outputFile: string | null;
}
