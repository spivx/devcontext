import { describe, it, expect } from 'vitest'
import { normalizeHex, getAccessibleIconColor, normalizeIconSlug } from '@/lib/icon-utils'

describe('icon-utils', () => {
    describe('normalizeHex', () => {
        it('should normalize 3-character hex to 6-character', () => {
            expect(normalizeHex('abc')).toBe('aabbcc')
            expect(normalizeHex('#abc')).toBe('aabbcc')
            expect(normalizeHex('123')).toBe('112233')
        })

        it('should handle 6-character hex correctly', () => {
            expect(normalizeHex('abcdef')).toBe('abcdef')
            expect(normalizeHex('#abcdef')).toBe('abcdef')
            expect(normalizeHex('123456')).toBe('123456')
        })

        it('should pad short hex values with zeros', () => {
            expect(normalizeHex('ab')).toBe('ab0000')
            expect(normalizeHex('a')).toBe('a00000')
            expect(normalizeHex('')).toBe('000000')
        })

        it('should truncate long hex values to 6 characters', () => {
            expect(normalizeHex('abcdef123')).toBe('abcdef')
            expect(normalizeHex('1234567890')).toBe('123456')
        })

        it('should handle hex with whitespace', () => {
            expect(normalizeHex('  abc  ')).toBe('aabbcc')
            expect(normalizeHex(' #abcdef ')).toBe('abcdef')
        })
    })

    describe('getAccessibleIconColor', () => {
        it('should return fallback color for invalid hex', () => {
            expect(getAccessibleIconColor('invalid')).toBe('#A0AEC0')
            expect(getAccessibleIconColor('gggggg')).toBe('#A0AEC0')
        })

        it('should lighten dark colors', () => {
            const darkColor = '000000' // Pure black
            const result = getAccessibleIconColor(darkColor)
            expect(result).not.toBe('#000000')
            expect(result).toMatch(/^#[0-9a-fA-F]{6}$/)

            // Should be lighter than original
            const originalLuminance = 0
            const resultHex = result.slice(1)
            const r = parseInt(resultHex.slice(0, 2), 16)
            const g = parseInt(resultHex.slice(2, 4), 16)
            const b = parseInt(resultHex.slice(4, 6), 16)
            const resultLuminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
            expect(resultLuminance).toBeGreaterThan(originalLuminance)
        })

        it('should return original color for light colors', () => {
            const lightColor = 'ffffff' // Pure white
            const result = getAccessibleIconColor(lightColor)
            expect(result).toBe('#ffffff')
        })

        it('should handle medium luminance colors', () => {
            const mediumColor = '808080' // Medium gray
            const result = getAccessibleIconColor(mediumColor)
            expect(result).toBe('#808080')
        })

        it('should handle 3-character hex input', () => {
            const result = getAccessibleIconColor('abc')
            expect(result).toMatch(/^#[0-9a-fA-F]{6}$/)
        })

        it('should handle hex with # prefix', () => {
            const result = getAccessibleIconColor('#000000')
            expect(result).toMatch(/^#[0-9a-fA-F]{6}$/)
        })
    })

    describe('normalizeIconSlug', () => {
        it('should return null for undefined input', () => {
            expect(normalizeIconSlug(undefined)).toBeNull()
        })

        it('should return null for empty string', () => {
            expect(normalizeIconSlug('')).toBeNull()
            expect(normalizeIconSlug('   ')).toBeNull()
        })

        it('should normalize basic strings', () => {
            expect(normalizeIconSlug('React')).toBe('react')
            expect(normalizeIconSlug('TypeScript')).toBe('typescript')
        })

        it('should remove URL prefixes', () => {
            expect(normalizeIconSlug('https://example.com/icon')).toBe('example.com/icon')
            expect(normalizeIconSlug('http://test.com/icon')).toBe('test.com/icon')
        })

        it('should remove CDN prefixes', () => {
            expect(normalizeIconSlug('cdn.simpleicons.org/react')).toBe('react')
            expect(normalizeIconSlug('cdn.simpleicons.org/typescript/blue')).toBe('typescript/blue')
        })

        it('should remove icon path prefixes', () => {
            expect(normalizeIconSlug('/icons/react')).toBe('react')
            expect(normalizeIconSlug('/icons/typescript.svg')).toBe('typescript')
        })

        it('should remove .svg extension', () => {
            expect(normalizeIconSlug('react.svg')).toBe('react')
            expect(normalizeIconSlug('typescript.svg')).toBe('typescript')
        })

        it('should apply slug overrides', () => {
            expect(normalizeIconSlug('vscode')).toBe('microsoft')
            expect(normalizeIconSlug('visualstudiocode')).toBe('microsoft')
            expect(normalizeIconSlug('VSCode')).toBe('microsoft')
        })


        it('should trim whitespace', () => {
            expect(normalizeIconSlug('  react  ')).toBe('react')
            expect(normalizeIconSlug('\t typescript \n')).toBe('typescript')
        })
    })
})