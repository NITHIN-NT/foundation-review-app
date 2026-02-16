"use client";

import React from 'react';
import { Terminal, Play } from 'lucide-react';

export default function PlaygroundPage() {
    return (
        <div className="space-y-8 h-[calc(100vh-8rem)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Playground</h1>
                    <p className="text-text-secondary mt-1">Environment for code experimentation and mastery.</p>
                </div>
            </div>

            <div className="flex-1 bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
                <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
                    <div className="flex gap-2 items-center text-indigo-400">
                        <Terminal size={18} />
                        <span className="text-[10px] font-black tracking-widest uppercase">SandBox.Runtime</span>
                    </div>
                    <button className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 px-4 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Play size={12} fill="currentColor" />
                        Run Experiment
                    </button>
                </div>
                <div className="flex-1 p-8 font-mono text-sm text-slate-400 flex items-center justify-center italic">
          // Playground environment is initializing...
                </div>
            </div>
        </div>
    );
}
