import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import type { WizardResponses } from '@/types/wizard'
import { getTemplateConfig } from '@/lib/template-config'

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ fileName: string }> }
) {
    try {
        const { fileName } = await params
        const body = await request.json()
        const responses: WizardResponses = body

        const templateConfig = getTemplateConfig(fileName)
        if (!templateConfig) {
            return NextResponse.json(
                { error: `Template not found for fileName: ${fileName}` },
                { status: 404 }
            )
        }

        // Read the template file
        const templatePath = path.join(process.cwd(), 'file-templates', templateConfig.template)
        const template = await readFile(templatePath, 'utf-8')

        // Replace template variables with actual values
        let generatedContent = template

        // Helper function to replace template variables gracefully
        const replaceVariable = (key: keyof WizardResponses, fallback: string = 'Not specified') => {
            const value = responses[key]
            const placeholder = `{{${key}}}`

            if (value === null || value === undefined || value === '') {
                generatedContent = generatedContent.replace(placeholder, fallback)
            } else {
                generatedContent = generatedContent.replace(placeholder, String(value))
            }
        }

        // Replace all template variables
        replaceVariable('preferredIde')
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

        // Return the generated content
        return NextResponse.json({
            content: generatedContent,
            fileName: templateConfig.outputFileName
        })

    } catch (error) {
        console.error('Error generating file:', error)
        return NextResponse.json(
            { error: 'Failed to generate file' },
            { status: 500 }
        )
    }
}