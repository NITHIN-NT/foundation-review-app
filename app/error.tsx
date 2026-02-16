'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center shadow-inner">
                <AlertTriangle size={40} />
            </div>
            <div>
                <h2 className="text-2xl font-black text-text-primary tracking-tight">Something went wrong</h2>
                <p className="text-text-tertiary mt-2 max-w-md mx-auto">
                    The system encountered an unexpected error during the process. Our technicians have been notified.
                </p>
            </div>
            <button
                onClick={() => reset()}
                className="btn btn-primary h-14 px-8 shadow-lg shadow-primary/20"
            >
                <RotateCcw size={20} />
                Retry Operation
            </button>
        </div>
    );
}
