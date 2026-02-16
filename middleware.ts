import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Production-level request logging
    const timestamp = new Date().toISOString();
    const method = request.method;
    const path = request.nextUrl.pathname;

    console.log(`[${timestamp}] ${method} ${path}`);

    // Example: Basic API protection (can be expanded)
    if (path.startsWith('/api/')) {
        // You could check for headers like 'x-api-key' or session cookies here
        // const apiKey = request.headers.get('x-api-key');
        // if (!apiKey && process.env.NODE_ENV === 'production') {
        //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*', '/reviews/:path*'],
};
