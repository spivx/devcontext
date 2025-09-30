import { describe, expect, it } from 'vitest'
import { isRecord, loadQuestionDataEntries } from '../test-utils/instruction-data'
import type { QuestionDataEntry } from '../test-utils/instruction-data'

describe('Instruction data defaults', () => {
    const questionsByFile = new Map<string, QuestionDataEntry[]>()

    loadQuestionDataEntries().forEach((entry) => {
        const bucket = questionsByFile.get(entry.relativePath)

        if (bucket) {
            bucket.push(entry)
        } else {
            questionsByFile.set(entry.relativePath, [entry])
        }
    })

    Array.from(questionsByFile.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .forEach(([relativePath, entries]) => {
            it(`ensures ${relativePath} questions have exactly one default`, () => {
                entries.forEach(({ node, pointer }) => {
                    const { answers } = node as { answers?: unknown }

                    if (!Array.isArray(answers) || answers.length === 0) {
                        return
                    }

                    const questionId = typeof node.id === 'string' ? node.id : pointer
                    const defaultCount = answers.reduce((count, answer) => {
                        const { isDefault } = (isRecord(answer) ? answer : {}) as { isDefault?: unknown }
                        return isDefault === true ? count + 1 : count
                    }, 0)

                    expect(
                        defaultCount,
                        `Expected exactly one default answer in question '${questionId}' within ${relativePath}, but found ${defaultCount}.`
                    ).toBe(1)
                })
            })
        })
})
