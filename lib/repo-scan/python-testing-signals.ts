import { loadStackQuestionMetadata, normalizeConventionValue } from "@/lib/question-metadata"
import { dependencyHas } from "@/lib/repo-scan/dependency-utils"
import type { PackageJson } from "@/types/repo-scan"

type TestingConventionValues = {
    unit: string[]
    e2e: string[]
}

const testingConventionCache = new Map<string, TestingConventionValues>()

const getTestingConventionValues = async (stackId: string): Promise<TestingConventionValues> => {
    const normalized = stackId.trim().toLowerCase()
    if (testingConventionCache.has(normalized)) {
        return testingConventionCache.get(normalized)!
    }

    const metadata = await loadStackQuestionMetadata(normalized)
    const values: TestingConventionValues = {
        unit: metadata.answersByResponseKey.testingUT ?? [],
        e2e: metadata.answersByResponseKey.testingE2E ?? [],
    }
    testingConventionCache.set(normalized, values)
    return values
}

const findConventionValue = (values: string[], target: string): string | null => {
    const normalizedTarget = normalizeConventionValue(target)
    return values.find((value) => normalizeConventionValue(value) === normalizedTarget) ?? null
}

const BEHAVE_DEPENDENCIES = ["behave", "behave-django", "behave-webdriver"]

export const detectPythonTestingSignals = async (
    paths: string[],
    pkg: PackageJson | null,
    testing: Set<string>,
): Promise<void> => {
    const { unit } = await getTestingConventionValues("python")
    if (unit.length === 0) {
        return
    }

    const behaveValue = findConventionValue(unit, "behave")
    const unittestValue = findConventionValue(unit, "unittest")

    if (!behaveValue && !unittestValue) {
        return
    }

    const lowerCasePaths = paths.map((path) => path.toLowerCase())

    if (behaveValue) {
        const hasFeaturesDir = lowerCasePaths.some((path) => path.startsWith("features/") || path.includes("/features/"))
        const hasStepsDir = lowerCasePaths.some((path) => path.includes("/steps/"))
        const hasEnvironment = lowerCasePaths.some((path) => path.endsWith("/environment.py") || path.endsWith("environment.py"))
        const hasDependency = pkg ? dependencyHas(pkg, BEHAVE_DEPENDENCIES) : false

        if (hasDependency || (hasFeaturesDir && (hasStepsDir || hasEnvironment))) {
            testing.add(behaveValue)
        }
    }

    if (unittestValue) {
        const hasUnitFiles = lowerCasePaths.some((path) => {
            if (!/(^|\/)(tests?|testcases|specs)\//.test(path)) {
                return false
            }
            return /(^|\/)(test_[^/]+|[^/]+_test)\.py$/.test(path)
        })

        if (hasUnitFiles) {
            testing.add(unittestValue)
        }
    }
}
