import type { ScheduledReview, CreateReviewRequest, UpdateReviewRequest } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function handleResponse(response: Response) {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An unexpected error occurred' }));
        throw new Error(error.message || error.error || 'Request failed');
    }
    return response.json();
}

export async function fetchReviews(): Promise<ScheduledReview[]> {
    try {
        const res = await fetch(`${API_URL}/reviews`, {
            cache: 'no-store',
        });
        return handleResponse(res);
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}

export async function createReview(data: CreateReviewRequest): Promise<ScheduledReview> {
    try {
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    } catch (error) {
        console.error('API Create Error:', error);
        throw error;
    }
}

export async function updateReview(id: string | number, data: UpdateReviewRequest): Promise<ScheduledReview> {
    try {
        const res = await fetch(`${API_URL}/reviews/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    } catch (error) {
        console.error('API Update Error:', error);
        throw error;
    }
}
