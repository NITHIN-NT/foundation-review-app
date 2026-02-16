import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import questionsData from '@/data/questions.json';

export async function POST() {
    try {
        // Create table if not exists
        await sql`
            CREATE TABLE IF NOT EXISTS questions (
                id SERIAL PRIMARY KEY,
                text TEXT NOT NULL,
                module_id INTEGER NOT NULL,
                answer TEXT,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        `;

        // Check if data already exists
        const count = await sql`SELECT count(*) FROM questions`;
        if (parseInt(count[0].count) > 0) {
            return NextResponse.json({ message: 'Table already has data. Skipping sync.' });
        }

        // Insert data from JSON
        for (const q of questionsData) {
            await sql`
                INSERT INTO questions (id, text, module_id, answer, created_at, updated_at)
                VALUES (${q.id}, ${q.text}, ${q.module_id}, ${q.answer}, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING
            `;
        }

        return NextResponse.json({ message: 'Sync completed successfully' });
    } catch (error) {
        console.error('Sync Error:', error);
        return NextResponse.json({ error: 'Sync failed', details: error }, { status: 500 });
    }
}
