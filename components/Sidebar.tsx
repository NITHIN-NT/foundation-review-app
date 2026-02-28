"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    BookOpen,
    ChevronLeft,
    Terminal,
    ClipboardList,
    LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '@/components/AuthProvider';
import { LogIn } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SidebarProps {
    isMobileOpen?: boolean;
    onCloseMobile?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const { user } = useAuth();
    const router = useRouter();

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        { icon: BookOpen, label: 'Reviews', href: '/reviews' },
        { icon: ClipboardList, label: 'Questions', href: '/questions' },
    ];


    const handleLogout = () => {
        localStorage.removeItem('auth_pin_verified');
        router.push('/login');
        toast.success('Logged out successfully');
        onCloseMobile?.();
    };

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseMobile}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] lg:hidden"
                    />
                )}
            </AnimatePresence>

            <aside
                className={cn(
                    "fixed inset-y-0 left-0 lg:sticky lg:top-0 h-screen bg-bg-white border-r border-border-base transition-all duration-500 z-[110] lg:z-50 flex flex-col flex-shrink-0 shrink-0",
                    isCollapsed ? "lg:w-20" : "lg:w-72",
                    isMobileOpen ? "translate-x-0 w-[280px]" : "-translate-x-full lg:translate-x-0"
                )}
            >
                <div className="p-8 flex items-center justify-between">
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn("flex items-center gap-3", isCollapsed && "lg:hidden")}
                    >
                        <div className="w-8 h-8 bg-primary rounded-lg shadow-lg shadow-primary/30 flex items-center justify-center text-white">
                            <Terminal size={18} />
                        </div>
                        <span className="text-lg font-black tracking-tighter text-text-primary uppercase">
                            Foundation
                        </span>
                    </motion.div>

                    <button
                        onClick={() => isMobileOpen ? onCloseMobile?.() : setIsCollapsed(!isCollapsed)}
                        className="btn-icon bg-bg-subtle hover:bg-white hover:shadow-md"
                    >
                        <ChevronLeft className={cn(
                            "transition-transform duration-500",
                            isCollapsed && !isMobileOpen && "rotate-180",
                            isMobileOpen && "rotate-0"
                        )} size={18} />
                    </button>
                </div>

                <div className="flex-1 px-4 space-y-8 mt-4 overflow-y-auto custom-scrollbar">
                    <div>
                        {(!isCollapsed || isMobileOpen) && <p className="section-title px-4">Navigation</p>}
                        <nav className="space-y-1.5">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => onCloseMobile?.()}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-300 group relative",
                                        pathname === item.href
                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                            : "text-text-secondary hover:bg-bg-subtle hover:text-text-primary group-hover:bg-bg-subtle"
                                    )}
                                >
                                    <item.icon size={20} className={cn("transition-transform group-hover:scale-110", pathname === item.href && "animate-pulse")} />
                                    {(!isCollapsed || isMobileOpen) && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className={cn(pathname !== item.href && "text-text-primary/70 md:text-text-secondary group-hover:text-text-primary")}
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                    {pathname === item.href && (!isCollapsed || isMobileOpen) && (
                                        <motion.div
                                            layoutId="sidebar-active"
                                            className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/40"
                                        />
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </div>

                </div>

                <div className="p-4 mt-auto border-t border-border-base pt-6 pb-8 space-y-4">
                    {(!isCollapsed || isMobileOpen) && (
                        <div className="px-4 py-2 bg-indigo-500/5 rounded-xl border border-indigo-500/10 flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping absolute inset-0" />
                                <div className="w-2 h-2 bg-indigo-500 rounded-full relative z-10" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-500/60">System Ready</span>
                        </div>
                    )}
                    {user ? (
                        <div className={cn(
                            "flex flex-col gap-4 p-3 bg-bg-subtle rounded-2xl border border-border-base",
                            isCollapsed && !isMobileOpen && "items-center"
                        )}>
                            {(!isCollapsed || isMobileOpen) && (
                                <div className="flex items-center gap-3 px-1">
                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black uppercase shadow-inner">
                                        {user.email?.[0]}
                                    </div>
                                    <div className="flex flex-col overflow-hidden">
                                        <span className="text-xs font-black text-text-primary truncate">{user.email?.split('@')[0]}</span>
                                        <span className="text-[10px] text-text-tertiary truncate">Administrator</span>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={handleLogout}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all",
                                    isCollapsed && !isMobileOpen && "justify-center"
                                )}
                            >
                                <LogOut size={18} />
                                {(!isCollapsed || isMobileOpen) && <span>Log Out</span>}
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => onCloseMobile?.()}
                            className="btn btn-primary w-full"
                        >
                            <LogIn size={18} />
                            {(!isCollapsed || isMobileOpen) && <span>Sign In</span>}
                        </Link>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
