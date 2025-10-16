import stacksData from "@/data/stacks.json"
import type { StackDetectionConfig, StackDependencyFileDetection, StackDependencySignal } from "@/types/stack-detection"
import type { DataQuestionSource } from "@/types/wizard"

type CompiledPattern = {
    raw: string
    regex: RegExp
}

export type CompiledDependencySignal = StackDependencySignal & {
    matchLower: string
    type: Required<StackDependencySignal>["type"]
    stack: string
    addFrameworks: string[]
    addLanguages: string[]
}

type CompiledDependencyFileRule = {
    stack: string
    patterns: CompiledPattern[]
    signals: CompiledDependencySignal[]
}

export type DependencyAnalysisTask = {
    path: string
    signals: CompiledDependencySignal[]
}

const stackQuestionSet = stacksData as DataQuestionSource[]

const escapeRegex = (value: string) => value.replace(/[-/\\^$+?.()|[\]{}]/g, "\\$&")

const ensurePattern = (pattern: string): string => {
    if (pattern.includes("/")) {
        return pattern
    }
    return `**/${pattern}`
}

const globToRegex = (pattern: string): RegExp => {
    const normalized = ensurePattern(pattern)
        .replace(/\*\*/g, "__DOUBLE_STAR__")
        .replace(/\*/g, "__SINGLE_STAR__")
        .split("/")
        .map((segment) => {
            if (segment === "__DOUBLE_STAR__") {
                return ".*"
            }
            if (segment === "__SINGLE_STAR__") {
                return "[^/]*"
            }
            return escapeRegex(segment)
        })
        .join("/")
        .replace(/__DOUBLE_STAR__/g, ".*")
        .replace(/__SINGLE_STAR__/g, "[^/]*")

    return new RegExp(`^${normalized}$`, "i")
}

const compilePatterns = (fileDetection: StackDependencyFileDetection): CompiledPattern[] => {
    const patterns: string[] = []

    if (typeof (fileDetection as { path?: string }).path === "string") {
        patterns.push((fileDetection as { path: string }).path)
    }

    if (Array.isArray(fileDetection.paths)) {
        patterns.push(...fileDetection.paths)
    }

    if (Array.isArray(fileDetection.patterns)) {
        patterns.push(...fileDetection.patterns)
    }

    const uniquePatterns = Array.from(new Set(patterns.map((pattern) => pattern.trim()).filter(Boolean)))

    return uniquePatterns.map((pattern) => ({
        raw: pattern,
        regex: globToRegex(pattern),
    }))
}

const compileSignals = (stack: string, signals: StackDependencySignal[]): CompiledDependencySignal[] =>
    signals.map((signal) => ({
        stack,
        match: signal.match,
        matchLower: signal.match.toLowerCase(),
        type: signal.type ?? "substring",
        addFrameworks: Array.isArray(signal.addFrameworks) ? signal.addFrameworks : [],
        addLanguages: Array.isArray(signal.addLanguages) ? signal.addLanguages : [],
        preferStack: signal.preferStack,
        setPrimaryLanguage: signal.setPrimaryLanguage,
    }))

const compiledRules: CompiledDependencyFileRule[] = stackQuestionSet.flatMap((question) =>
    question.answers.flatMap((answer) => {
        const detectionConfig = (answer.detection ?? {}) as StackDetectionConfig
        const dependencyFiles = detectionConfig.dependencyFiles ?? []

        return dependencyFiles
            .map((fileDetection) => {
                const patterns = compilePatterns(fileDetection)
                const signals = compileSignals(answer.value, fileDetection.signals ?? [])

                if (patterns.length === 0 || signals.length === 0) {
                    return null
                }

                return {
                    stack: answer.value,
                    patterns,
                    signals,
                } satisfies CompiledDependencyFileRule
            })
            .filter((entry): entry is CompiledDependencyFileRule => entry !== null)
    }),
)

export const hasDependencyDetectionRules = compiledRules.length > 0

export const buildDependencyAnalysisTasks = (paths: string[]): DependencyAnalysisTask[] => {
    if (!hasDependencyDetectionRules || paths.length === 0) {
        return []
    }

    const taskMap = new Map<string, CompiledDependencySignal[]>()

    paths.forEach((path) => {
        const normalizedPath = path.trim()
        if (!normalizedPath) {
            return
        }

        compiledRules.forEach((rule) => {
            const matchesRule = rule.patterns.some((pattern) => pattern.regex.test(normalizedPath))
            if (!matchesRule) {
                return
            }

            const existing = taskMap.get(path)
            if (existing) {
                existing.push(...rule.signals)
            } else {
                taskMap.set(path, [...rule.signals])
            }
        })
    })

    return Array.from(taskMap.entries()).map(([path, signals]) => ({
        path,
        signals,
    }))
}
