import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { z } from 'zod';

const questionSchema = z.object({
    text: z.string().min(1),
    module_id: z.number().int().min(1),
    answer: z.string().nullable().optional(),
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    try {
        let questions;
        if (moduleId) {
            questions = await sql`
                SELECT id, text, module_id, answer, created_at as "createdAt"
                FROM questions
                WHERE module_id = ${Number(moduleId)}
                ORDER BY id ASC
            `;
        } else {
            questions = await sql`
                SELECT id, text, module_id, answer, created_at as "createdAt"
                FROM questions
                ORDER BY module_id ASC, id ASC
            `;
        }
        return NextResponse.json(questions);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = questionSchema.parse(body);

        const [newQuestion] = await sql`
            INSERT INTO questions (text, module_id, answer, created_at, updated_at)
            VALUES (${validatedData.text}, ${validatedData.module_id}, ${validatedData.answer || null}, NOW(), NOW())
            RETURNING id, text, module_id, answer, created_at as "createdAt"
        `;

        return NextResponse.json(newQuestion, { status: 201 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
        }
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
