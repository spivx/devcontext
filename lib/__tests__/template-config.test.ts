import { describe, it, expect } from 'vitest'
import { getTemplateConfig, templateCombinations, type TemplateKey } from '@/lib/template-config'

describe('template-config', () => {
    describe('getTemplateConfig', () => {
        describe('with string key (legacy support)', () => {
            it('should return correct config for existing string key', () => {
                const result = getTemplateConfig('vscode-copilot-instructions')
                expect(result).toEqual({
                    template: 'copilot-instructions-template.md',
                    outputFileName: 'copilot-instructions.md'
                })
            })

            it('should return correct config for agents template', () => {
                const result = getTemplateConfig('vscode-agents')
                expect(result).toEqual({
                    template: 'agents-template.md',
                    outputFileName: 'agents.md'
                })
            })

            it('should return correct config for cursor rules', () => {
                const result = getTemplateConfig('cursor-cursor-rules')
                expect(result).toEqual({
                    template: 'copilot-instructions-template.md',
                    outputFileName: '.cursorrules'
                })
            })

            it('should return correct config for legacy instructions-md', () => {
                const result = getTemplateConfig('instructions-md')
                expect(result).toEqual({
                    template: 'copilot-instructions-template.md',
                    outputFileName: 'copilot-instructions.md'
                })
            })

            it('should return null for non-existent string key', () => {
                const result = getTemplateConfig('non-existent-key')
                expect(result).toBeNull()
            })

            it('should handle empty string', () => {
                const result = getTemplateConfig('')
                expect(result).toBeNull()
            })
        })

        describe('with TemplateKey object', () => {
            it('should return config for specific framework combination', () => {
                const key: TemplateKey = {
                    ide: 'vscode',
                    templateType: 'agents',
                    framework: 'python'
                }
                const result = getTemplateConfig(key)
                expect(result).toEqual({
                    template: 'agents-template.md',
                    outputFileName: 'agents.md'
                })
            })

            it('should return config for specific react combination', () => {
                const key: TemplateKey = {
                    ide: 'vscode',
                    templateType: 'agents',
                    framework: 'react'
                }
                const result = getTemplateConfig(key)
                expect(result).toEqual({
                    template: 'agents-template.md',
                    outputFileName: 'agents.md'
                })
            })

            it('should fallback to general combination when specific framework not found', () => {
                const key: TemplateKey = {
                    ide: 'vscode',
                    templateType: 'copilot-instructions',
                    framework: 'nonexistent-framework'
                }
                const result = getTemplateConfig(key)
                expect(result).toEqual({
                    template: 'copilot-instructions-template.md',
                    outputFileName: 'copilot-instructions.md'
                })
            })

            it('should return general combination when no framework specified', () => {
                const key: TemplateKey = {
                    ide: 'vscode',
                    templateType: 'copilot-instructions'
                }
                const result = getTemplateConfig(key)
                expect(result).toEqual({
                    template: 'copilot-instructions-template.md',
                    outputFileName: 'copilot-instructions.md'
                })
            })

            it('should fallback to template type only when ide-template combination not found', () => {
                const key: TemplateKey = {
                    ide: 'nonexistent-ide',
                    templateType: 'instructions-md'
                }
                const result = getTemplateConfig(key)
                expect(result).toEqual({
                    template: 'copilot-instructions-template.md',
                    outputFileName: 'copilot-instructions.md'
                })
            })

            it('should return null when no matching configuration found', () => {
                const key: TemplateKey = {
                    ide: 'nonexistent-ide',
                    templateType: 'nonexistent-template'
                }
                const result = getTemplateConfig(key)
                expect(result).toBeNull()
            })

            it('should handle cursor IDE with rules template', () => {
                const key: TemplateKey = {
                    ide: 'cursor',
                    templateType: 'cursor-rules'
                }
                const result = getTemplateConfig(key)
                expect(result).toEqual({
                    template: 'copilot-instructions-template.md',
                    outputFileName: '.cursorrules'
                })
            })
        })

        describe('templateCombinations object', () => {
            it('should contain all expected template combinations', () => {
                const expectedKeys = [
                    'vscode-copilot-instructions',
                    'vscode-agents',
                    'vscode-agents-python',
                    'vscode-agents-react',
                    'cursor-cursor-rules',
                    'instructions-md'
                ]

                expectedKeys.forEach(key => {
                    expect(templateCombinations).toHaveProperty(key)
                    expect(templateCombinations[key]).toHaveProperty('template')
                    expect(templateCombinations[key]).toHaveProperty('outputFileName')
                })
            })

            it('should have valid template and outputFileName for all combinations', () => {
                Object.entries(templateCombinations).forEach(([key, config]) => {
                    expect(config.template).toBeTruthy()
                    expect(config.outputFileName).toBeTruthy()
                    expect(typeof config.template).toBe('string')
                    expect(typeof config.outputFileName).toBe('string')
                })
            })
        })
    })
})