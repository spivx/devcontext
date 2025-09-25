export interface TemplateConfig {
    template: string
    outputFileName: string
}

export const templateMap: Record<string, TemplateConfig> = {
    'instructions-md': {
        template: 'copilot-instructions-template.md',
        outputFileName: 'copilot-instructions.md'
    },
    // Add more templates here as needed
}

export function getTemplateConfig(fileName: string): TemplateConfig | null {
    return templateMap[fileName] || null
}