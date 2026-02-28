import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
    try {
        // Add user_id column if it doesn't exist
        await sql`
            ALTER TABLE questions 
            ADD COLUMN IF NOT EXISTS user_id TEXT;
        `;

        // Update existing rows to have a default value or keep null (if allowed)
        // For now, let's keep it nullable so old questions don't break

        return NextResponse.json({ message: 'Database updated successfully' });
    } catch (error) {
        console.error('Setup Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown setup error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
