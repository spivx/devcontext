import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

import type { WizardResponses } from '@/types/wizard'
import { getTemplateConfig, type TemplateKey } from '@/lib/template-config'

function mapOutputFileToTemplateType(outputFile: string): string {
    const mapping: Record<string, string> = {
        'instructions-md': 'copilot-instructions',
        'agents-md': 'agents',
        'cursor-rules': 'cursor-rules',
        'json-rules': 'json-rules',
    }

    return mapping[outputFile] ?? outputFile
}

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ framework: string; fileName: string }> },
) {
    try {
        const { framework, fileName } = await context.params
        const responses = (await request.json()) as WizardResponses

        const frameworkFromPath =
            framework && !['general', 'none', 'undefined'].includes(framework)
                ? framework
                : undefined

        const templateKeyFromParams: TemplateKey = {
            templateType: mapOutputFileToTemplateType(fileName),
            framework: frameworkFromPath,
        }

        let templateConfig = getTemplateConfig(templateKeyFromParams)

        if (!templateConfig && responses.outputFile) {
            const templateKeyFromBody: TemplateKey = {
                templateType: mapOutputFileToTemplateType(responses.outputFile),
                framework: responses.frameworkSelection || undefined,
            }

            templateConfig = getTemplateConfig(templateKeyFromBody)
        }

        if (!templateConfig) {
            templateConfig = getTemplateConfig(fileName)
        }

        if (!templateConfig) {
            return NextResponse.json(
                { error: `Template not found for fileName: ${fileName}` },
                { status: 404 },
            )
        }

        const templatePath = path.join(process.cwd(), 'file-templates', templateConfig.template)
        const template = await readFile(templatePath, 'utf-8')

        let generatedContent = template
        const isJsonTemplate = templateConfig.template.toLowerCase().endsWith('.json')

        const escapeForJson = (value: string) => {
            const escaped = JSON.stringify(value)
            return escaped.slice(1, -1)
        }

        const replaceVariable = (key: keyof WizardResponses, fallback = 'Not specified') => {
            const placeholder = `{{${key}}}`

            if (!generatedContent.includes(placeholder)) {
                return
            }

            const value = responses[key]

            if (value === null || value === undefined || value === '') {
                const replacement = isJsonTemplate ? escapeForJson(fallback) : fallback
                generatedContent = generatedContent.replace(placeholder, replacement)
            } else {
                const replacementValue = String(value)
                const replacement = isJsonTemplate ? escapeForJson(replacementValue) : replacementValue
                generatedContent = generatedContent.replace(placeholder, replacement)
            }
        }

        replaceVariable('frameworkSelection')
        replaceVariable('tooling')
        replaceVariable('language')
        replaceVariable('projectPriority')
        replaceVariable('codeStyle')
        replaceVariable('variableNaming')
        replaceVariable('fileNaming')
        replaceVariable('componentNaming')
        replaceVariable('exports')
        replaceVariable('comments')
        replaceVariable('collaboration')
        replaceVariable('fileStructure')
        replaceVariable('styling')
        replaceVariable('stateManagement')
        replaceVariable('apiLayer')
        replaceVariable('folders')
        replaceVariable('testingUT')
        replaceVariable('testingE2E')
        replaceVariable('dataFetching')
        replaceVariable('reactPerf')
        replaceVariable('auth')
        replaceVariable('validation')
        replaceVariable('logging')
        replaceVariable('commitStyle')
        replaceVariable('prRules')
        replaceVariable('outputFile')

        return NextResponse.json({
            content: generatedContent,
            fileName: templateConfig.outputFileName,
        })
    } catch (error) {
        console.error('Error generating file:', error)
        return NextResponse.json({ error: 'Failed to generate file' }, { status: 500 })
    }
}
