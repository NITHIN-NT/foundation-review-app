"use client";

import React, { useState } from 'react';
import { auth } from '@/lib/firebase';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { LogIn, Chrome, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success('Welcome back!');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                toast.success('Account created successfully!');
            }
            router.push('/');
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
            toast.success('Welcome!');
            router.push('/');
        } catch (error: any) {
            toast.error(error.message);
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg relative z-10"
            >
                <div className="glass-dark rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/5">
                    <div className="p-6 md:p-12 pb-4 md:pb-6 text-center">
                        <motion.div
                            initial={{ scale: 0.5 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 md:w-20 md:h-20 bg-primary/20 text-primary rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 md:mb-8 shadow-inner border border-primary/20"
                        >
                            <LogIn size={32} className="md:size-[40px] drop-shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                        </motion.div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-3">
                            {isLogin ? 'Protocol: Access' : 'Protocol: Initialize'}
                        </h1>
                        <p className="text-white/40 text-[9px] md:text-sm font-bold uppercase tracking-[0.2em]">
                            Foundational Matrix Interface
                        </p>
                    </div>

                    <div className="p-6 md:p-12 pt-0 md:pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Identity Vector</label>
                                <input
                                    type="email"
                                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-primary/50 transition-all placeholder:text-white/10"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-1">Secure Keyphrase</label>
                                <input
                                    type="password"
                                    className="w-full h-14 px-6 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:bg-white/10 focus:border-primary/50 transition-all placeholder:text-white/10"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="btn btn-primary w-full h-16 text-lg font-black uppercase tracking-widest shadow-[0_0_30px_rgba(139,92,246,0.2)] mt-4"
                            >
                                {isLoading ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    isLogin ? 'Establish Link' : 'Generate Identity'
                                )}
                            </button>
                        </form>

                        <div className="relative my-10">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5"></div>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                                <span className="bg-transparent px-4 text-white/20">External Handshake</span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleGoogleSignIn}
                                className="h-14 w-full rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest"
                            >
                                <Chrome size={20} /> Establish Google Handshake
                            </button>
                        </div>

                        <div className="mt-10 text-center">
                            <button
                                onClick={() => setIsLogin(!isLogin)}
                                className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-primary transition-colors"
                            >
                                {isLogin ? "Need a new identity? Request generation" : "Existing handshake found? Re-establish"}
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center mt-12 text-white/10 text-[9px] font-bold uppercase tracking-[0.5em]">
                    Terminal: v1.0.4-LOCKED // Secure Environment
                </p>
            </motion.div>
        </div>
    );
}
