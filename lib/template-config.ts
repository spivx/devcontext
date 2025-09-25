export interface TemplateConfig {
    template: string
    outputFileName: string
}

export interface TemplateKey {
    ide: string
    templateType: string
    framework?: string
}

// Template configurations based on IDE + template type + framework combinations
export const templateCombinations: Record<string, TemplateConfig> = {
    // VS Code + Copilot Instructions (general)
    'vscode-copilot-instructions': {
        template: 'copilot-instructions-template.md',
        outputFileName: 'copilot-instructions.md'
    },
    // VS Code + Agents guide (general)
    'vscode-agents': {
        template: 'agents-template.md',
        outputFileName: 'agents.md'
    },
    // VS Code + Agents guide + Python (specific combination)
    'vscode-agents-python': {
        template: 'agents-template.md',
        outputFileName: 'agents.md'
    },
    // VS Code + Agents guide + React (specific combination)
    'vscode-agents-react': {
        template: 'agents-template.md',
        outputFileName: 'agents.md'
    },
    // Cursor + Rules
    'cursor-cursor-rules': {
        template: 'copilot-instructions-template.md', // Will be replaced with cursor-specific template
        outputFileName: '.cursorrules'
    },
    // Fallback for legacy fileName-based approach
    'instructions-md': {
        template: 'copilot-instructions-template.md',
        outputFileName: 'copilot-instructions.md'
    },
    // Add more combinations here as needed
}

export function getTemplateConfig(key: string | TemplateKey): TemplateConfig | null {
    if (typeof key === 'string') {
        // Legacy support for fileName-based approach
        return templateCombinations[key] || null
    }

    // New combination-based approach
    const { ide, templateType, framework } = key

    // Try specific combination first (with framework)
    if (framework) {
        const specificKey = `${ide}-${templateType}-${framework}`
        if (templateCombinations[specificKey]) {
            return templateCombinations[specificKey]
        }
    }

    // Try general combination (without framework)
    const generalKey = `${ide}-${templateType}`
    if (templateCombinations[generalKey]) {
        return templateCombinations[generalKey]
    }

    // Try fallback to just template type (for backward compatibility)
    if (templateCombinations[templateType]) {
        return templateCombinations[templateType]
    }

    return null
}