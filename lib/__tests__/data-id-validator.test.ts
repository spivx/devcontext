import { scanDataIds } from '../data-id-validator'

describe('data ID validation', () => {
    test('ensures IDs across data files remain unique', () => {
        const { duplicates } = scanDataIds()

        if (duplicates.length > 0) {
            const summary = duplicates
                .map(({ id, files }) => `- ${id}: ${files.join(', ')}`)
                .join('\n')

            throw new Error(`Duplicate IDs detected:\n${summary}`)
        }
    })
})

