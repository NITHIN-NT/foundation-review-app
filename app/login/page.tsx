"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, Lock } from 'lucide-react';
import { REQUIRED_PIN } from '@/lib/constants';
import { useAuth } from '@/components/AuthProvider';

export default function LoginPage() {
    const { loginViaPin } = useAuth();
    const [pin, setPin] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(false);
    const router = useRouter();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Check if already authenticated
    useEffect(() => {
        const isVerified = localStorage.getItem('auth_pin_verified') === 'true';
        if (isVerified) {
            router.push('/');
        }
    }, [router]);

    const handleVerify = useCallback(async () => {
        const enteredPin = pin.join('');
        if (enteredPin === REQUIRED_PIN) {
            setIsLoading(true);
            setError(false);
            try {
                // PIN gate success - trigger local session
                loginViaPin();
                toast.success('Access Granted');
                router.push('/');
            } catch (error) {
                console.error('Session Error:', error);
                toast.error('Local Synchronization Failed');
            } finally {
                setIsLoading(false);
            }
        } else {
            setError(true);
            setPin(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            toast.error('Invalid Protocol Key');
            setTimeout(() => setError(false), 500);
        }
    }, [pin, router, loginViaPin]);

    useEffect(() => {
        if (pin.every(digit => digit !== '')) {
            handleVerify();
        }
    }, [pin, handleVerify]);

    const handleChange = (index: number, value: string) => {
        if (isNaN(Number(value))) return;

        const newPin = [...pin];
        newPin[index] = value.substring(value.length - 1);
        setPin(newPin);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 p-6">
            {/* Animated Background Orbs */}
            <div className="absolute top-0 -left-20 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-0 -right-20 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="glass-dark rounded-[3rem] overflow-hidden shadow-2xl border border-white/5 p-8 md:p-14 text-center">
                    <motion.div
                        animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                        className="w-20 h-20 bg-primary/20 text-primary rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner border border-primary/20"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={32} />
                        ) : error ? (
                            <Lock size={32} className="text-red-500" />
                        ) : (
                            <ShieldCheck size={32} className="drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                        )}
                    </motion.div>

                    <h1 className="text-3xl font-black tracking-tight text-white mb-2">Welcome Back</h1>
                    <p className="text-white/40 text-xs font-bold uppercase tracking-[0.2em] mb-12">Enter your security PIN to continue</p>

                    <div className="flex justify-center gap-3 mb-10">
                        {pin.map((digit, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-12 h-16 md:w-16 md:h-20 bg-white/5 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-2xl text-center text-2xl font-black text-white outline-none focus:bg-white/10 focus:border-primary/50 transition-all shadow-lg`}
                                disabled={isLoading}
                            />
                        ))}
                    </div>

                    <p className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em] h-4">
                        {isLoading ? 'Verifying PIN...' : error ? 'Access Denied: Incorrect PIN' : 'Enter your 6-digit PIN'}
                    </p>
                </div>

                <p className="text-center mt-12 text-white/10 text-[9px] font-bold uppercase tracking-[0.5em]">
                    Foundation | Secure Access
                </p>
            </motion.div>
        </div>
    );
}
