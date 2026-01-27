import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

const skillsDirectory = path.join(process.cwd(), 'skills')

export interface Skill {
    id: string
    name: string
    description: string
    dependencies?: string
    content: string
}

export function getAllSkills(): Skill[] {
    // Create directory if it doesn't exist
    if (!fs.existsSync(skillsDirectory)) {
        return []
    }

    const fileNames = fs.readdirSync(skillsDirectory)
    const allSkillsData = fileNames
        .filter((fileName) => fileName.endsWith('.md'))
        .map((fileName) => {
            const id = fileName.replace(/\.md$/, '')
            const fullPath = path.join(skillsDirectory, fileName)
            const fileContents = fs.readFileSync(fullPath, 'utf8')
            const { data, content } = matter(fileContents)

            return {
                id,
                name: data.name || id,
                description: data.description || '',
                dependencies: data.dependencies || '',
                content: content.trim(),
            }
        })

    // Sort skills by name
    return allSkillsData.sort((a, b) => {
        if (a.name < b.name) {
            return -1
        }
        if (a.name > b.name) {
            return 1
        }
        return 0
    })
}
