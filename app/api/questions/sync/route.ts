import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import questionsData from '@/data/questions.json';
import { getAuthUser } from '@/lib/auth-server';

export async function POST(request: Request) {
    const user = await getAuthUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Create table if not exists with user_id
        await sql`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                module_id INTEGER NOT NULL,
                answer TEXT,
                user_id TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Check if system questions already exist (where user_id is NULL)
        const count = await sql`SELECT count(*) FROM questions WHERE user_id IS NULL`;
        if (parseInt(count[0].count) > 0) {
            return NextResponse.json({ message: 'System pool already synchronized.' });
        }

        // Insert data from JSON as system questions (user_id = NULL)
        for (const q of questionsData) {
            await sql`
                INSERT INTO questions (text, module_id, answer, user_id, created_at, updated_at)
                VALUES (${q.text}, ${q.module_id}, ${q.answer}, NULL, NOW(), NOW())
            `;
        }

        return NextResponse.json({ message: 'System pool synchronized successfully.' });
    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Sync failed', details: error }, { status: 500 });
    }
}
