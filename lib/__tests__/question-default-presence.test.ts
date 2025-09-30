import { describe, expect, it } from 'vitest'
import { isRecord, loadQuestionDataEntries } from '../test-utils/instruction-data'

describe('Instruction question defaults', () => {
    it('ensures every question provides at least one default answer', () => {
        const missingDefaults: string[] = []

        loadQuestionDataEntries().forEach(({ node, pointer, relativePath }) => {
            const { answers } = node as { answers?: unknown }

            if (!Array.isArray(answers) || answers.length === 0) {
                return
            }

            const questionId = typeof node.id === 'string' ? node.id : pointer
            const hasDefault = answers.some((answer) => {
                if (!isRecord(answer)) {
                    return false
                }

                const { isDefault } = answer as { isDefault?: unknown }
                return isDefault === true
            })

            if (!hasDefault) {
                missingDefaults.push(`No default answer for question '${questionId}' in ${relativePath}.`)
            }
        })

        expect(missingDefaults, missingDefaults.join('\n')).toHaveLength(0)
    })
})
