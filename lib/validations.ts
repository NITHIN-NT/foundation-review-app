import { z } from 'zod';

export const reviewSchema = z.object({
    student_name: z.string().min(2, "Name must be at least 2 characters"),
    batch: z.string().min(1, "Batch is required"),
    module: z.string().min(1, "Module is required"),
    status: z.enum(['pending', 'active', 'completed', 'failed']),
    scheduled_at: z.string().datetime().optional().default(() => new Date().toISOString()),
});

export const patchReviewSchema = z.object({
    status: z.enum(['completed', 'failed']),
    scores: z.object({
        theoretical: z.number(),
        maxTheoretical: z.number(),
        practical: z.number(),
        total: z.number(),
    }),
    notes: z.string().optional(),
    session_data: z.any().optional(),
});
