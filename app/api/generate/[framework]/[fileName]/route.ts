import { NextRequest, NextResponse } from 'next/server'
import type { WizardResponses } from '@/types/wizard'
import { renderTemplate } from '@/lib/template-render'

export async function POST(
    request: NextRequest,
    context: { params: Promise<{ framework: string; fileName: string }> },
) {
    try {
        const { framework, fileName } = await context.params
        const responses = (await request.json()) as WizardResponses

        const rendered = await renderTemplate({
          responses,
          frameworkFromPath: framework,
          fileNameFromPath: fileName,
        })

        return NextResponse.json({
            content: rendered.content,
            fileName: rendered.fileName,
        })
    } catch (error) {
        console.error('Error generating file:', error)
        return NextResponse.json({ error: 'Failed to generate file' }, { status: 500 })
    }
}
