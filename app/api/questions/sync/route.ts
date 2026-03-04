
import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { getAuthUser } from '@/lib/auth-server';

export async function POST() {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const filePath = path.join(process.cwd(), 'full_question_bank.md');
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: 'full_question_bank.md not found' }, { status: 404 });
        }

        const content = fs.readFileSync(filePath, 'utf8');
        const questions = parseQuestions(content);

        // Wipe all existing questions to ensure clean state
        await sql`TRUNCATE TABLE questions RESTART IDENTITY CASCADE`;

        // Insert new questions
        for (const q of questions) {
            await sql`
                INSERT INTO questions (text, answer, module_id, created_at, updated_at)
                VALUES (${q.text}, ${q.answer}, ${q.module_id}, NOW(), NOW())
            `;
        }

        return NextResponse.json({
            message: `Successfully synchronized ${questions.length} questions across all modules.`,
            count: questions.length
        });

    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

function parseQuestions(text: string) {
    const questions: { text: string; answer: string; module_id: number }[] = [];

    // Split by sections starting with ## Module
    const modules = text.split(/\n## Module /);

    for (let i = 1; i < modules.length; i++) {
        const modulePart = modules[i];
        const moduleLines = modulePart.split('\n');
        const moduleNumMatch = moduleLines[0].match(/^(\d+)/);
        if (!moduleNumMatch) continue;

        const moduleNum = parseInt(moduleNumMatch[1]);
        const items = modulePart.split(/\n### /);

        for (let j = 1; j < items.length; j++) {
            const item = items[j];
            const match = item.match(/^(\d+)\.\s*(.*?)\s*\n\*\*Answer:\*\*\s*([\s\S]*?)(\n\n---|\n$|$)/);
            if (match) {
                questions.push({
                    text: match[2].trim(),
                    answer: match[3].trim(),
                    module_id: moduleNum
                });
            }
        }
    }

    return questions;
}
