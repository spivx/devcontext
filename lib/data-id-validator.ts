import fs from 'fs'
import path from 'path'

export type DuplicateIdRecord = {
    id: string
    files: string[]
}

export type IdScanResult = {
    totalIds: number
    duplicates: DuplicateIdRecord[]
}

export function scanDataIds(dataDir = path.join(process.cwd(), 'data')): IdScanResult {
    const jsonFiles = collectJsonFiles(dataDir)
    const idOrigins = new Map<string, string>()
    const duplicateSources = new Map<string, Set<string>>()

    for (const filePath of jsonFiles) {
        const relativePath = path.relative(dataDir, filePath)
        const content = fs.readFileSync(filePath, 'utf8')
        let parsedContent: unknown

        try {
            parsedContent = JSON.parse(content)
        } catch (error) {
            throw new Error(`Failed to parse ${relativePath}: ${(error as Error).message}`)
        }

        collectIds(parsedContent, relativePath, idOrigins, duplicateSources)
    }

    const duplicates: DuplicateIdRecord[] = Array.from(duplicateSources.entries()).map(([id, files]) => ({
        id,
        files: Array.from(files),
    }))

    duplicates.sort((a, b) => a.id.localeCompare(b.id))

    return {
        totalIds: idOrigins.size,
        duplicates,
    }
}

function collectJsonFiles(targetDir: string): string[] {
    const directoryEntries = fs.readdirSync(targetDir, { withFileTypes: true })
    const collected: string[] = []

    for (const entry of directoryEntries) {
        const entryPath = path.join(targetDir, entry.name)

        if (entry.isDirectory()) {
            collected.push(...collectJsonFiles(entryPath))
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            collected.push(entryPath)
        }
    }

    return collected
}

function collectIds(
    node: unknown,
    filePath: string,
    idOrigins: Map<string, string>,
    duplicateSources: Map<string, Set<string>>
) {
    if (Array.isArray(node)) {
        for (const value of node) {
            collectIds(value, filePath, idOrigins, duplicateSources)
        }
        return
    }

    if (node === null || typeof node !== 'object') {
        return
    }

    const record = node as Record<string, unknown>

    if (typeof record.id === 'string' && record.id.trim().length > 0) {
        registerId(record.id, filePath, idOrigins, duplicateSources)
    }

    for (const value of Object.values(record)) {
        collectIds(value, filePath, idOrigins, duplicateSources)
    }
}

function registerId(
    id: string,
    filePath: string,
    idOrigins: Map<string, string>,
    duplicateSources: Map<string, Set<string>>
) {
    const trimmedId = id.trim()

    if (trimmedId.length === 0) {
        return
    }

    if (!idOrigins.has(trimmedId)) {
        idOrigins.set(trimmedId, filePath)
        return
    }

    const origin = idOrigins.get(trimmedId) as string
    const sources = duplicateSources.get(trimmedId) ?? new Set<string>([origin])
    sources.add(filePath)
    duplicateSources.set(trimmedId, sources)
}
