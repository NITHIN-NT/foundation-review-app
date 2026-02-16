import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { reviewSchema } from '@/lib/validations';
import { ZodError } from 'zod';

export async function GET() {
  try {
    const reviews = await sql`
      SELECT 
        id, 
        student_name as "studentName", 
        batch, 
        module, 
        status, 
        scheduled_at as "scheduledAt",
        scores,
        notes,
        session_data as "sessionData",
        created_at as "createdAt"
      FROM reviews
      ORDER BY scheduled_at DESC
    `;
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = reviewSchema.parse(body);

    const [newReview] = await sql`
      INSERT INTO reviews (
        student_name, 
        batch, 
        module, 
        status, 
        scheduled_at,
        scores,
        session_data,
        created_at,
        updated_at
      ) VALUES (
        ${validatedData.student_name}, 
        ${validatedData.batch}, 
        ${validatedData.module}, 
        ${validatedData.status}, 
        ${validatedData.scheduled_at},
        ${JSON.stringify({})},
        ${JSON.stringify({})},
        NOW(),
        NOW()
      )
      RETURNING 
        id, 
        student_name as "studentName", 
        batch, 
        module, 
        status, 
        scheduled_at as "scheduledAt"
    `;

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
