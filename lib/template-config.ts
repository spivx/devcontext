export interface TemplateConfig {
    template: string
    outputFileName: string
}

export interface TemplateKey {
    templateType: string
    framework?: string
}

// Template configurations based on template type + optional framework combinations
export const templateCombinations: Record<string, TemplateConfig> = {
    // Copilot Instructions (general)
    'copilot-instructions': {
        template: 'copilot-instructions-template.md',
        outputFileName: 'copilot-instructions.md',
    },
    // Copilot Instructions + React (specific combination)
    'copilot-instructions-react': {
        template: 'copilot-instructions-template.md',
        outputFileName: 'copilot-instructions.md',
    },
    // Copilot Instructions + Next.js (specific combination)
    'copilot-instructions-nextjs': {
        template: 'copilot-instructions-template.md',
        outputFileName: 'copilot-instructions.md',
    },
    // Copilot Instructions + Angular (specific combination)
    'copilot-instructions-angular': {
        template: 'copilot-instructions-template.md',
        outputFileName: 'copilot-instructions.md',
    },
    // Agents guide (general)
    agents: {
        template: 'agents-template.md',
        outputFileName: 'agents.md',
    },
    // Agents guide + React (specific combination)
    'agents-react': {
        template: 'agents-template.md',
        outputFileName: 'agents.md',
    },
    // Agents guide + Python (specific combination)
    'agents-python': {
        template: 'agents-template.md',
        outputFileName: 'agents.md',
    },
    // Agents guide + Angular (specific combination)
    'agents-angular': {
        template: 'agents-template.md',
        outputFileName: 'agents.md',
    },
    // Cursor rules
    'cursor-rules': {
        template: 'cursor-rules-template.json',
        outputFileName: '.cursor/rules',
    },
    // Generic JSON rules (placeholder)
    'json-rules': {
        template: 'copilot-instructions-template.md',
        outputFileName: '.devcontext.json',
    },
    // Legacy alias for backward compatibility
    'instructions-md': {
        template: 'copilot-instructions-template.md',
        outputFileName: 'copilot-instructions.md',
    },
}

export function getTemplateConfig(key: string | TemplateKey): TemplateConfig | null {
    if (typeof key === 'string') {
        // Legacy support for fileName-based approach
        return templateCombinations[key] ?? null
    }

    const { templateType, framework } = key

    if (framework) {
        const specificKey = `${templateType}-${framework}`
        if (templateCombinations[specificKey]) {
            return templateCombinations[specificKey]
        }
    }

    if (templateCombinations[templateType]) {
        return templateCombinations[templateType]
    }

    return null
}
