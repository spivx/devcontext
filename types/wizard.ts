export type IdeConfig = {
    id: string
    label: string
    icon?: string
    enabled?: boolean
    outputFiles?: string[]
    docs?: string
}

export type FrameworkConfig = {
    id: string
    label: string
    icon?: string
    enabled?: boolean
    docs?: string
}

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
}

export type DataQuestionSource = {
    id: string
    question: string
    allowMultiple?: boolean
    answers: DataAnswerSource[]
}

export type FileOutputConfig = {
    id: string
    label: string
    filename: string
    format: string
    enabled?: boolean
    icon?: string
    docs?: string
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
}

export type WizardQuestion = {
    id: string
    question: string
    allowMultiple?: boolean
    answers: WizardAnswer[]
}

export type WizardStep = {
    id: string
    title: string
    questions: WizardQuestion[]
}

export type InstructionsWizardProps = {
    onClose?: () => void
}

export type Responses = Record<string, string | string[] | null | undefined>
export interface WizardResponses {
    preferredIde: string | null;
    frameworkSelection: string | null;
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
