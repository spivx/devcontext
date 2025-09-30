import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

export type QuestionDataEntry = {
    filePath: string
    relativePath: string
    pointer: string
    node: Record<string, unknown>
}

const DATA_ROOT = join(process.cwd(), 'data')

export const isRecord = (value: unknown): value is Record<string, unknown> => {
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

type QuestionCandidate = {
    pointer: string
    node: Record<string, unknown>
}

const collectQuestionCandidates = (node: unknown, pointer: string): QuestionCandidate[] => {
    if (Array.isArray(node)) {
        return node.flatMap((value, index) => collectQuestionCandidates(value, `${pointer}[${index}]`))
    }

    if (!isRecord(node)) {
        return []
    }

    const candidates: QuestionCandidate[] = []
    const { answers } = node as { answers?: unknown }

    if (Array.isArray(answers)) {
        candidates.push({ node, pointer })
    }

    for (const [key, value] of Object.entries(node)) {
        if (key === 'answers') {
            continue
        }

        candidates.push(...collectQuestionCandidates(value, `${pointer}.${key}`))
    }

    return candidates
}

export const loadQuestionDataEntries = (): QuestionDataEntry[] => {
    const jsonFiles = collectJsonFiles(DATA_ROOT)

    return jsonFiles.flatMap((filePath) => {
        const raw = readFileSync(filePath, 'utf8')
        const parsed = JSON.parse(raw) as unknown
        const relativePath = relative(process.cwd(), filePath)

        return collectQuestionCandidates(parsed, '$').map((candidate) => ({
            filePath,
            relativePath,
            pointer: candidate.pointer,
            node: candidate.node,
        }))
    })
}
