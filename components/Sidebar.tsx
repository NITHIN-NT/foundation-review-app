"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    Settings,
    ChevronLeft,
    Terminal,
    ClipboardList,
    LogOut,
    HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: BookOpen, label: 'Reviews', href: '/reviews' },
        { icon: ClipboardList, label: 'Question Pool', href: '/questions' },
        { icon: Terminal, label: 'Playground', href: '/playground' },
    ];

    const footerItems = [
        { icon: HelpCircle, label: 'Help & Docs', href: '/help' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    return (
        <aside
            className={cn(
                "h-screen sticky top-0 bg-bg-white border-r border-border-base transition-all duration-300 z-50 flex flex-col flex-shrink-0",
                isCollapsed ? "w-20" : "w-64"
            )}
        >
            <div className="p-6 flex items-center justify-between">
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xl font-extrabold tracking-tight text-text-primary"
                    >
                        FOUNDATION
                    </motion.div>
                )}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="btn-icon bg-bg-subtle hover:bg-primary-subtle hover:text-primary"
                >
                    <ChevronLeft className={cn("transition-transform duration-300", isCollapsed && "rotate-180")} size={18} />
                </button>
            </div>

            <nav className="flex-1 px-3 space-y-1">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
                            pathname === item.href
                                ? "bg-primary-subtle text-primary"
                                : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary"
                        )}
                    >
                        <item.icon size={20} />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}
            </nav>

            <div className="px-3 pb-6 space-y-1 border-t border-border-base pt-6">
                {footerItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:bg-bg-subtle hover:text-text-primary transition-colors mb-1",
                            pathname === item.href && "bg-primary-subtle text-primary"
                        )}
                    >
                        <item.icon size={20} />
                        {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                ))}

                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-4">
                    <LogOut size={20} />
                    {!isCollapsed && <span>Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
