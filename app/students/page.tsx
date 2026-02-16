"use client";

import React from 'react';
import { Users, Search, UserPlus } from 'lucide-react';

export default function StudentsPage() {
    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Students</h1>
                    <p className="text-text-secondary mt-1">Directory of students and their assessment history.</p>
                </div>
                <button className="btn btn-primary">
                    <UserPlus size={18} />
                    Register Student
                </button>
            </div>

            <div className="bento-card py-20 flex flex-col items-center justify-center text-text-tertiary opacity-50">
                <Users size={48} className="mb-4" />
                <p>Student management console is under optimization.</p>
            </div>
        </div>
    );
}
