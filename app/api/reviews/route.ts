import { NextResponse } from 'next/server';
import sql from '@/lib/db';
import { reviewSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { getAuthUser } from '@/lib/auth-server';
import { triggerGlobalSync } from '@/lib/realtime';

export async function GET(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('API: GET /api/reviews - Fetching from database...');
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
    console.log(`API: GET /api/reviews - Successfully fetched ${reviews.length} reviews`);
    return NextResponse.json(reviews);
  } catch (error: any) {
    console.error('API: Database Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    return NextResponse.json({
      error: 'Internal Server Error',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

    await triggerGlobalSync();
    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.issues }, { status: 400 });
    }
    console.error('Database Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
