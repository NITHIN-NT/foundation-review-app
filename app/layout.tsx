import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import LayoutWrapper from "@/components/LayoutWrapper";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Foundation | Review App",
  description: "Standardized module assessments managed by AI agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${jetbrains.variable}`}>
      <body className="antialiased bg-bg-main text-text-primary">
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster position="top-right" richColors />
        </AuthProvider>
      </body>
    </html>
  );
}
