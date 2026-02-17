"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { MobileHeader } from "@/components/MobileHeader";
import { cn } from "@/lib/utils";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const isLoginPage = pathname === "/login";

    return (
        <div className="flex flex-col lg:flex-row min-h-screen">
            {!isLoginPage && (
                <>
                    <MobileHeader onOpenSidebar={() => setIsMobileSidebarOpen(true)} />
                    <Sidebar
                        isMobileOpen={isMobileSidebarOpen}
                        onCloseMobile={() => setIsMobileSidebarOpen(false)}
                    />
                </>
            )}
            <main className="flex-1 min-h-screen">
                <div className={cn(
                    "mx-auto max-w-7xl",
                    !isLoginPage ? "p-4 md:p-8" : "p-0 max-w-none"
                )}>
                    {children}
                </div>
            </main>
        </div>
    );
}
