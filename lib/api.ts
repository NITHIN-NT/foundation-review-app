import type { ScheduledReview, CreateReviewRequest, UpdateReviewRequest } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

async function getAuthHeaders(): Promise<HeadersInit> {
    return {
        'Content-Type': 'application/json'
    };
}

async function handleResponse(response: Response) {
    const contentType = response.headers.get('content-type');
    if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            throw new Error(error.message || error.error || 'Request failed');
        } else {
            const text = await response.text();
            console.error('Non-JSON Error Response:', text.slice(0, 200));
            throw new Error(`Server Error (${response.status}): The server returned an unexpected response. Please try again later.`);
        }
    }

    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return response.text();
}

export async function fetchReviews(): Promise<ScheduledReview[]> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/reviews`, {
            cache: 'no-store',
            headers
        });
        return handleResponse(res);
    } catch (error) {
        console.error('API Fetch Error:', error);
        throw error;
    }
}

export async function createReview(data: CreateReviewRequest): Promise<ScheduledReview> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/reviews`, {
            method: 'POST',
            headers,
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
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/reviews/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(data),
        });
        return handleResponse(res);
    } catch (error) {
        console.error('API Update Error:', error);
        throw error;
    }
}

export async function deleteReview(id: string | number): Promise<void> {
    try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_URL}/reviews/${id}`, {
            method: 'DELETE',
            headers
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({ message: 'An unexpected error occurred' }));
            throw new Error(error.message || error.error || 'Request failed');
        }
    } catch (error) {
        console.error('API Delete Error:', error);
        throw error;
    }
}
