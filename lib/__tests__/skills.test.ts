import { describe, expect, it, vi, beforeEach } from 'vitest'
import fs from 'fs'
import path from 'path'
import { getAllSkills } from '../skills'

vi.mock('fs')

describe('getAllSkills', () => {
    const mockSkillsDir = path.join(process.cwd(), 'skills')

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('returns an empty array if the skills directory does not exist', () => {
        vi.mocked(fs.existsSync).mockReturnValue(false)

        const skills = getAllSkills()

        expect(skills).toEqual([])
        expect(fs.existsSync).toHaveBeenCalledWith(mockSkillsDir)
    })

    it('returns parsed skills from markdown files', () => {
        const mockFileNames = ['skill-b.md', 'skill-a.md', 'not-a-skill.txt']
        vi.mocked(fs.existsSync).mockReturnValue(true)
        vi.mocked(fs.readdirSync).mockReturnValue(mockFileNames as any)

        const fileAContent = `---
name: Skill A
description: Description A
dependencies: dep-a
---
Content A`
        const fileBContent = `---
name: Skill B
description: Description B
---
Content B`

        vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
            if (path.toString().endsWith('skill-a.md')) return fileAContent
            if (path.toString().endsWith('skill-b.md')) return fileBContent
            return ''
        })

        const skills = getAllSkills()

        expect(skills).toHaveLength(2)

        // Should be sorted by name
        expect(skills[0]).toEqual({
            id: 'skill-a',
            name: 'Skill A',
            description: 'Description A',
            dependencies: 'dep-a',
            content: 'Content A'
        })
        expect(skills[1]).toEqual({
            id: 'skill-b',
            name: 'Skill B',
            description: 'Description B',
            dependencies: '',
            content: 'Content B'
        })
    })

    it('uses id as name if name is missing in frontmatter', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true)
        vi.mocked(fs.readdirSync).mockReturnValue(['test-skill.md'] as any)
        vi.mocked(fs.readFileSync).mockReturnValue('---\ndescription: desc\n---\ncontent')

        const skills = getAllSkills()

        expect(skills[0].name).toBe('test-skill')
        expect(skills[0].id).toBe('test-skill')
    })

    it('sorts skills alphabetically by name', () => {
        vi.mocked(fs.existsSync).mockReturnValue(true)
        vi.mocked(fs.readdirSync).mockReturnValue(['z.md', 'a.md'] as any)

        vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
            if (path.toString().endsWith('z.md')) return '---\nname: Zebra\n---\ncontent'
            if (path.toString().endsWith('a.md')) return '---\nname: Apple\n---\ncontent'
            return ''
        })

        const skills = getAllSkills()

        expect(skills[0].name).toBe('Apple')
        expect(skills[1].name).toBe('Zebra')
    })
})
