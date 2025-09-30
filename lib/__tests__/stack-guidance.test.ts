import { describe, expect, it } from 'vitest'

import { getStackGuidance, supportedGuidanceStacks } from '@/lib/stack-guidance'

describe('stack-guidance', () => {
    it('returns default guidance when stack is missing', () => {
        const guidance = getStackGuidance()
        expect(guidance).toContain('- Document your preferred architecture')
    })

    it('returns guidance for each supported stack', () => {
        supportedGuidanceStacks.forEach((slug) => {
            const guidance = getStackGuidance(slug)
            expect(guidance).toMatch(/^-/)
            expect(guidance.length).toBeGreaterThan(20)
        })
    })

    it('falls back to default for unknown stacks', () => {
        const guidance = getStackGuidance('unknown-stack')
        expect(guidance).toContain('Document your preferred architecture')
    })
})
