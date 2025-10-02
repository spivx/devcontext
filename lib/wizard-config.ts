import architectureData from "@/data/architecture.json"
import commitsData from "@/data/commits.json"
import filesData from "@/data/files.json"
import generalData from "@/data/general.json"
import performanceData from "@/data/performance.json"
import securityData from "@/data/security.json"
import stacksData from "@/data/stacks.json"
import type { DataQuestionSource, FileOutputConfig, WizardQuestion, WizardStep } from "@/types/wizard"
import { buildFileOptionsFromQuestion, buildStepFromQuestionSet, mapAnswerSourceToWizard } from "@/lib/wizard-utils"

export const STACK_STEP_ID = "stacks"
export const STACK_QUESTION_ID = "stackSelection"

const stackQuestionSet = stacksData as DataQuestionSource[]
export const stacksStep = buildStepFromQuestionSet(
  STACK_STEP_ID,
  "Choose Your Stack",
  stackQuestionSet
)
export const stackQuestion = stacksStep.questions.find((question) => question.id === STACK_QUESTION_ID) ?? null

const fileQuestionSet = filesData as DataQuestionSource[]
const fileQuestion = fileQuestionSet[0] ?? null
const fileOptionsInternal = buildFileOptionsFromQuestion(fileQuestion)
const fileSummaryQuestionInternal = fileQuestion
  ? {
      id: fileQuestion.id,
      question: fileQuestion.question,
      isReadOnlyOnSummary: fileQuestion.isReadOnlyOnSummary,
    }
  : null

const generalStep = buildStepFromQuestionSet(
  "general",
  "Project Foundations",
  generalData as DataQuestionSource[]
)

const architectureStep = buildStepFromQuestionSet(
  "architecture",
  "Architecture Practices",
  architectureData as DataQuestionSource[]
)

const performanceStep = buildStepFromQuestionSet(
  "performance",
  "Performance Guidelines",
  performanceData as DataQuestionSource[]
)

const securityStep = buildStepFromQuestionSet(
  "security",
  "Security & Compliance",
  securityData as DataQuestionSource[]
)

const commitsStep = buildStepFromQuestionSet(
  "commits",
  "Collaboration & Version Control",
  commitsData as DataQuestionSource[]
)

const suffixStepsInternal: WizardStep[] = [
  generalStep,
  architectureStep,
  performanceStep,
  securityStep,
  commitsStep,
]

export const getSuffixSteps = () => suffixStepsInternal
export const getFileOptions = (): FileOutputConfig[] => fileOptionsInternal
export const getFileSummaryQuestion = () => fileSummaryQuestionInternal
export const getDefaultFileOption = () => fileOptionsInternal.find((file) => file.isDefault) ?? fileOptionsInternal[0] ?? null

export const loadStackWizardStep = async (stackId: string, stackLabel?: string): Promise<{ step: WizardStep; label: string }> => {
  const stackAnswerLabel =
    stackLabel ?? stackQuestion?.answers.find((answer) => answer.value === stackId)?.label ?? stackId

  const questionsModule = await import(`@/data/questions/${stackId}.json`)
  const questionsData = (questionsModule.default ?? questionsModule) as DataQuestionSource[]

  const mappedQuestions: WizardQuestion[] = questionsData.map((question) => ({
    id: question.id,
    question: question.question,
    allowMultiple: question.allowMultiple,
    responseKey: question.responseKey,
    answers: question.answers.map(mapAnswerSourceToWizard),
  }))

  return {
    step: {
      id: `stack-${stackId}`,
      title: `${stackAnswerLabel} Preferences`,
      questions: mappedQuestions,
    },
    label: stackAnswerLabel,
  }
}
