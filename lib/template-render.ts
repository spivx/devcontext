import { readFile } from 'fs/promises'
import path from 'path'

import type { WizardResponses } from '@/types/wizard'
import { getTemplateConfig, type TemplateKey } from '@/lib/template-config'
import { getStackGuidance } from '@/lib/stack-guidance'

const determineApplyToGlob = (responses: WizardResponses, stackSlug?: string): string => {
  const normalizedStack = (responses.stackSelection || stackSlug || '').trim().toLowerCase()

  if (normalizedStack === 'python') {
    return '**/*.{py,pyi,md}'
  }

  if (['nextjs', 'react', 'angular', 'vue', 'svelte', 'nuxt', 'astro', 'remix'].includes(normalizedStack)) {
    return '**/*.{ts,tsx,js,jsx,md}'
  }

  return '**/*.{ts,tsx,js,jsx,md}'
}

function mapOutputFileToTemplateType(outputFile: string): string {
  const mapping: Record<string, string> = {
    'instructions-md': 'copilot-instructions',
    'agents-md': 'agents',
    'cursor-rules': 'cursor-rules',
    'json-rules': 'json-rules',
  }

  return mapping[outputFile] ?? outputFile
}

export type RenderTemplateParams = {
  responses: WizardResponses
  frameworkFromPath?: string | undefined
  fileNameFromPath?: string | undefined
}

export type RenderTemplateResult = {
  fileName: string
  content: string
  isJson: boolean
}

export async function renderTemplate({
  responses,
  frameworkFromPath,
  fileNameFromPath,
}: RenderTemplateParams): Promise<RenderTemplateResult> {
  const framework = frameworkFromPath && !['general', 'none', 'undefined'].includes(frameworkFromPath)
    ? frameworkFromPath
    : undefined

  // Resolve template config from either route params or body fields
  const templateKeyFromParams: TemplateKey | null = fileNameFromPath
    ? {
      templateType: mapOutputFileToTemplateType(fileNameFromPath),
      stack: framework,
    }
    : null

  let templateConfig = templateKeyFromParams ? getTemplateConfig(templateKeyFromParams) : null

  if (!templateConfig && responses.outputFile) {
    const templateKeyFromBody: TemplateKey = {
      templateType: mapOutputFileToTemplateType(responses.outputFile),
      stack: responses.stackSelection || undefined,
    }
    templateConfig = getTemplateConfig(templateKeyFromBody)
  }

  if (!templateConfig && fileNameFromPath) {
    templateConfig = getTemplateConfig(fileNameFromPath)
  }

  if (!templateConfig) {
    throw new Error(`Template not found for fileName: ${fileNameFromPath || responses.outputFile || 'unknown'}`)
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
    const placeholder = `{{${String(key)}}}`

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

  replaceVariable('stackSelection')
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

  const replaceStaticPlaceholder = (placeholderKey: string, value: string) => {
    const placeholder = `{{${placeholderKey}}}`
    if (!generatedContent.includes(placeholder)) {
      return
    }
    const replacement = isJsonTemplate ? escapeForJson(value) : value
    generatedContent = generatedContent.replace(placeholder, replacement)
  }

  const stackGuidanceSlug = responses.stackSelection || framework
  const stackGuidance = getStackGuidance(stackGuidanceSlug)
  replaceStaticPlaceholder('stackGuidance', stackGuidance)
  replaceStaticPlaceholder('applyToGlob', determineApplyToGlob(responses, stackGuidanceSlug))

  return {
    content: generatedContent,
    fileName: templateConfig.outputFileName,
    isJson: isJsonTemplate,
  }
}
