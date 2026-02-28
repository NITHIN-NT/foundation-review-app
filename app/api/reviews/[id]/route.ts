import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { patchReviewSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { getAuthUser } from '@/lib/auth-server';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (isNaN(Number(id))) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    try {
        const [review] = await sql`
      SELECT 
        id, 
        student_name as "studentName", 
        batch, 
        module, 
        status, 
        scheduled_at as "scheduledAt",
        scores,
        notes,
        session_data as "sessionData"
      FROM reviews
      WHERE id = ${Number(id)}
    `;

        if (!review) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        return NextResponse.json(review);
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (isNaN(Number(id))) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    try {
        const body = await request.json();
        const validatedData = patchReviewSchema.parse(body);

        const [updatedReview] = await sql`
      UPDATE reviews
      SET 
        status = COALESCE(${validatedData.status || null}, status),
        student_name = COALESCE(${validatedData.student_name || null}, student_name),
        batch = COALESCE(${validatedData.batch || null}, batch),
        module = COALESCE(${validatedData.module || null}, module),
        scores = COALESCE(${validatedData.scores ? JSON.stringify(validatedData.scores) : null}::jsonb, scores),
        notes = COALESCE(${validatedData.notes || null}, notes),
        session_data = COALESCE(${validatedData.session_data ? JSON.stringify(validatedData.session_data) : null}::jsonb, session_data),
        updated_at = NOW()
      WHERE id = ${Number(id)}
      RETURNING 
        id, 
        student_name as "studentName", 
        batch, 
        module, 
        status, 
        scheduled_at as "scheduledAt",
        scores,
        notes,
        session_data as "sessionData"
    `;

        if (!updatedReview) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }


        return NextResponse.json(updatedReview);
    } catch (error) {
        if (error instanceof ZodError) {
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
    const user = await getAuthUser();
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    if (isNaN(Number(id))) {
        return NextResponse.json({ error: 'Invalid ID format' }, { status: 400 });
    }

    try {
        const result = await sql`
      DELETE FROM reviews
      WHERE id = ${Number(id)}
      RETURNING id
    `;

        if (result.length === 0) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }


        return NextResponse.json({ message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
