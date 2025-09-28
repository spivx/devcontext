import { describe, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const DATA_ROOT = join(process.cwd(), 'data')

type QuestionCandidate = {
    node: Record<string, unknown>
    path: string
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null
}

const collectJsonFiles = (dir: string): string[] => {
    return readdirSync(dir).flatMap((entry) => {
        const fullPath = join(dir, entry)
        const stats = statSync(fullPath)

        if (stats.isDirectory()) {
            return collectJsonFiles(fullPath)
        }

        return entry.endsWith('.json') ? [fullPath] : []
    })
}

const collectQuestionCandidates = (node: unknown, currentPath: string): QuestionCandidate[] => {
    if (Array.isArray(node)) {
        return node.flatMap((value, index) => collectQuestionCandidates(value, `${currentPath}[${index}]`))
    }

    if (!isRecord(node)) {
        return []
    }

    const candidates: QuestionCandidate[] = []
    const { answers } = node as { answers?: unknown }

    if (Array.isArray(answers)) {
        candidates.push({ node, path: currentPath })
    }

    for (const [key, value] of Object.entries(node)) {
        if (key === 'answers') {
            continue
        }

        candidates.push(...collectQuestionCandidates(value, `${currentPath}.${key}`))
    }

    return candidates
}

describe('Instruction data defaults', () => {
    const jsonFiles = collectJsonFiles(DATA_ROOT)

    jsonFiles.forEach((filePath) => {
        it(`ensures ${relative(process.cwd(), filePath)} questions have exactly one default`, () => {
            const raw = readFileSync(filePath, 'utf8')
            const parsed = JSON.parse(raw) as unknown
            const questions = collectQuestionCandidates(parsed, '$')
            const relativePath = relative(process.cwd(), filePath)

            questions.forEach((candidate) => {
                const question = candidate.node
                const { answers } = question as { answers?: unknown }

                if (!Array.isArray(answers) || answers.length === 0) {
                    return
                }

                const questionId = typeof question.id === 'string' ? question.id : candidate.path
                const defaultCount = answers.reduce((count, answer) => {
                    const { isDefault } = (isRecord(answer) ? answer : {}) as { isDefault?: unknown }
                    return isDefault === true ? count + 1 : count
                }, 0)

                if (defaultCount !== 1) {
                    throw new Error(
                        `Expected exactly one default answer in question '${questionId}' within ${relativePath}, but found ${defaultCount}.`
                    )
                }
            })
        })
    })
})
