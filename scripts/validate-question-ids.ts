import fs from 'fs';
import path from 'path';

interface Question {
    id: string;
    question: string;
    answers: Array<{
        value: string;
        label: string;
        example?: string;
        docs?: string;
    }>;
}

function validateQuestionIds() {
    const dataDir = path.join(process.cwd(), 'data');
    const questionsDir = path.join(dataDir, 'questions');

    const allIds = new Set<string>();
    const duplicates: string[] = [];
    const fileIdMap = new Map<string, string>();

    // Check main data files
    const mainFiles = [
        'general.json',
        'architecture.json',
        'performance.json',
        'security.json',
        'commits.json',
        'files.json'
    ];

    for (const file of mainFiles) {
        const filePath = path.join(dataDir, file);
        if (fs.existsSync(filePath)) {
            checkFileForDuplicates(filePath, file, allIds, duplicates, fileIdMap);
        }
    }

    // Check framework-specific question files
    if (fs.existsSync(questionsDir)) {
        const questionFiles = fs.readdirSync(questionsDir)
            .filter(file => file.endsWith('.json'));

        for (const file of questionFiles) {
            const filePath = path.join(questionsDir, file);
            checkFileForDuplicates(filePath, `questions/${file}`, allIds, duplicates, fileIdMap);
        }
    }

    if (duplicates.length > 0) {
        console.error('❌ Duplicate question IDs found:');
        duplicates.forEach(id => {
            console.error(`  - "${id}" in ${fileIdMap.get(id)}`);
        });
        process.exit(1);
    }

    console.log('✅ All question IDs are unique across all files');
    console.log(`📊 Total unique question IDs: ${allIds.size}`);
}

function checkFileForDuplicates(
    filePath: string,
    fileName: string,
    allIds: Set<string>,
    duplicates: string[],
    fileIdMap: Map<string, string>
) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        const questions: Question[] = JSON.parse(content);

        if (!Array.isArray(questions)) {
            console.warn(`⚠️ Skipping ${fileName}: not an array of questions`);
            return;
        }

        questions.forEach((question, index) => {
            if (!question.id) {
                console.warn(`⚠️ Question at index ${index} in ${fileName} has no ID`);
                return;
            }

            if (allIds.has(question.id)) {
                duplicates.push(question.id);
                const existingFile = fileIdMap.get(question.id);
                fileIdMap.set(question.id, `${existingFile} and ${fileName}`);
            } else {
                allIds.add(question.id);
                fileIdMap.set(question.id, fileName);
            }
        });
    } catch (error) {
        console.error(`❌ Error reading ${fileName}:`, error);
        process.exit(1);
    }
}

if (require.main === module) {
    validateQuestionIds();
}

export { validateQuestionIds };