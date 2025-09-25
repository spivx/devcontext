import path from 'path'

import { scanDataIds } from '../lib/data-id-validator'

export function validateQuestionIds() {
    const dataDir = path.join(process.cwd(), 'data')
    const { duplicates, totalIds } = scanDataIds(dataDir)

    if (duplicates.length > 0) {
        console.error('❌ Duplicate IDs found across data files:')

        for (const { id, files } of duplicates) {
            console.error(`  - "${id}" in ${files.join(', ')}`)
        }

        process.exit(1)
    }

    console.log('✅ All IDs are unique across data files')
    console.log(`📊 Total unique IDs: ${totalIds}`)
}

if (require.main === module) {
    validateQuestionIds()
}
