"use client";

import React from 'react';
import { Menu, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface MobileHeaderProps {
    onOpenSidebar: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onOpenSidebar }) => {
    return (
        <header className="lg:hidden sticky top-0 z-[60] bg-bg-white/80 backdrop-blur-xl border-b border-border-base px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary rounded-lg shadow-lg shadow-primary/30 flex items-center justify-center text-white">
                    <Terminal size={18} />
                </div>
                <span className="text-lg font-black tracking-tighter text-text-primary uppercase">
                    Foundation
                </span>
            </div>

            <button
                onClick={onOpenSidebar}
                className="btn-icon bg-bg-subtle"
            >
                <Menu size={20} />
            </button>
        </header>
    );
};
