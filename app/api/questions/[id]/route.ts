import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { z } from 'zod';

const patchQuestionSchema = z.object({
    text: z.string().min(1).optional(),
    module_id: z.number().int().min(1).optional(),
    answer: z.string().nullable().optional(),
});

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const [question] = await sql`
            SELECT id, text, module_id, answer, created_at as "createdAt"
            FROM questions
            WHERE id = ${Number(id)}
        `;

        if (!question) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json(question);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        const validatedData = patchQuestionSchema.parse(body);

        const [updatedQuestion] = await sql`
            UPDATE questions
            SET 
                text = COALESCE(${validatedData.text || null}, text),
                module_id = COALESCE(${validatedData.module_id || null}, module_id),
                answer = COALESCE(${validatedData.answer || null}, answer),
                updated_at = NOW()
            WHERE id = ${Number(id)}
            RETURNING id, text, module_id, answer, created_at as "createdAt"
        `;

        if (!updatedQuestion) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json(updatedQuestion);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
        }
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const result = await sql`
            DELETE FROM questions
            WHERE id = ${Number(id)}
            RETURNING id
        `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
