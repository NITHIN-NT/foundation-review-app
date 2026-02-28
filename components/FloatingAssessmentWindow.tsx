"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle, AlertCircle, XCircle,
    SkipForward, ExternalLink, ArrowRight, ArrowLeft, X,
    Maximize2, Minimize2, GripHorizontal, PenTool,
    Eye, EyeOff
} from 'lucide-react';
import type { ScheduledReview, Question, ReviewStatus, QuestionResult } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { updateReview } from '@/lib/api';
import { cn } from '@/lib/utils';
import { WindowMode, useAssessment } from './AssessmentSessionProvider';

interface FloatingAssessmentWindowProps {
    review: ScheduledReview | null;
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const FloatingAssessmentWindow: React.FC<FloatingAssessmentWindowProps> = ({ review, isOpen, onClose, onComplete }) => {
    const { mode, setMode } = useAssessment();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const constraintsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!isOpen || !review) return;

        const loadQuestions = async () => {
            setIsLoading(true);
            try {
                const moduleId = review.module.split(' ')[1];
                const questionsRes = await fetch(`/api/questions?moduleId=${moduleId}`);
                const questionsData = await questionsRes.json();

                if (questionsRes.ok) {
                    setQuestions(questionsData);
                }
            } catch (error) {
                console.error('Data Load Error:', error);
                toast.error('Failed to load assessment questions');
            } finally {
                setIsLoading(false);
            }
        };

        loadQuestions();
    }, [isOpen, review]);

    const toggleFullscreen = async () => {
        const nextMode = mode === 'fullscreen' ? 'floating' : 'fullscreen';
        setMode(nextMode);

        try {
            if (nextMode === 'fullscreen') {
                if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                }
            } else {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                }
            }
        } catch (err) {
            console.error("Fullscreen toggle failed:", err);
        }
    };

    if (!mounted || !isOpen || !review) return null;

    const windowVariants = {
        floating: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            width: 600,
            height: 800,
            top: 'auto',
            left: 'auto',
            bottom: 32,
            right: 32,
            borderRadius: '3rem',
            zIndex: 200,
        },
        mini: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            width: 400,
            height: 550,
            top: 'auto',
            left: 'auto',
            bottom: 32,
            right: 32,
            borderRadius: '2rem',
            zIndex: 200,
        },
        fullscreen: {
            opacity: 1,
            scale: 1,
            x: 0,
            y: 0,
            width: '100vw',
            height: '100vh',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            borderRadius: 0,
            zIndex: 9999,
        }
    };

    return (
        <>
            {/* Constraint Container */}
            <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[199]" />

            <AnimatePresence mode="wait">
                <motion.div
                    key="assessment-window-root"
                    drag={mode !== 'fullscreen'}
                    dragMomentum={false}
                    dragElastic={0}
                    dragConstraints={constraintsRef}
                    variants={windowVariants}
                    initial={false}
                    animate={mode === 'fullscreen' ? { ...windowVariants.fullscreen, x: 0, y: 0 } : mode}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    exit={{ opacity: 0, scale: 0.8, y: 200, transition: { duration: 0.2 } }}
                    className={cn(
                        "fixed bg-bg-main flex flex-col overflow-hidden transition-shadow duration-300",
                        mode === 'fullscreen'
                            ? "inset-0 border-none shadow-none z-[9999]"
                            : "border border-white/20 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]"
                    )}
                >
                    {/* Drag Handle & Header */}
                    <div className={cn(
                        "h-14 bg-bg-white border-b border-border-base flex items-center justify-between px-6 shrink-0",
                        mode !== 'fullscreen' ? "cursor-move" : "border-none"
                    )}>
                        <div className="flex items-center gap-3">
                            {mode !== 'fullscreen' && <GripHorizontal className="text-text-tertiary" size={18} />}
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                                {mode === 'fullscreen' ? 'Pro Assessment Environment' : 'Assessment Session'}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setMode(mode === 'mini' ? 'floating' : 'mini')}
                                className={cn(
                                    "p-2 rounded-xl text-text-tertiary transition-colors",
                                    mode === 'mini' ? "bg-primary-subtle text-primary" : "hover:bg-bg-subtle"
                                )}
                                title="Mini Mode"
                            >
                                <Minimize2 size={16} />
                            </button>
                            <button
                                onClick={toggleFullscreen}
                                className={cn(
                                    "p-2 rounded-xl text-text-tertiary transition-colors",
                                    mode === 'fullscreen' ? "bg-primary-subtle text-primary" : "hover:bg-bg-subtle"
                                )}
                                title={mode === 'fullscreen' ? "Exit Fullscreen" : "Enter Fullscreen"}
                            >
                                {mode === 'fullscreen' ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-xl text-text-tertiary transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden relative">
                        {isLoading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : (
                            <ReviewSessionView
                                review={review}
                                questions={questions}
                                mode={mode}
                                onComplete={onComplete}
                            />
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
};

interface SessionProps {
    review: ScheduledReview;
    questions: Question[];
    mode: WindowMode;
    onComplete: () => void;
}

const ReviewSessionView: React.FC<SessionProps> = ({ review, questions, mode, onComplete }) => {
    const isMini = mode === 'mini';
    const isFullScreen = mode === 'fullscreen';
    const moduleQuestions = questions as Question[];

    const getSaved = (key: string, def: unknown) => {
        try {
            const saved = localStorage.getItem(`review_session_${review.id}`);
            if (!saved) return def;
            const data = JSON.parse(saved);
            return data[key] !== undefined ? data[key] : def;
        } catch { return def; }
    };

    const [currentIndex, setCurrentIndex] = useState(getSaved('currentIndex', 0));
    const [results, setResults] = useState<QuestionResult[]>(getSaved('results', []));
    const [practicalMark, setPracticalMark] = useState<number>(getSaved('practicalMark', 0));
    const [practicalLink, setPracticalLink] = useState<string>(getSaved('practicalLink', ''));
    const [seconds, setSeconds] = useState<number>(getSaved('seconds', 0));
    const [notes, setNotes] = useState<string>(getSaved('notes', ''));
    const [showResult, setShowResult] = useState(false);
    const [isPaused] = useState<boolean>(getSaved('isPaused', false));
    const [showAnswer, setShowAnswer] = useState(false);

    const currentQuestion = moduleQuestions[currentIndex];
    const currentResult = results.find(r => r.questionId === currentQuestion?.id);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => setSeconds(s => s + 1), 1000);
        return () => clearInterval(timer);
    }, [isPaused]);

    useEffect(() => {
        const state = {
            currentIndex,
            results,
            practicalMark,
            practicalLink,
            seconds,
            notes,
            isPaused,
            timestamp: Date.now()
        };
        localStorage.setItem(`review_session_${review.id}`, JSON.stringify(state));
    }, [currentIndex, results, practicalMark, practicalLink, seconds, notes, isPaused, review.id]);

    const stats = {
        theoretical: results.reduce((acc, curr) => acc + curr.score, 0),
        maxTheoretical: moduleQuestions.length * 10
    };
    const totalScore = (stats.maxTheoretical > 0 ? (stats.theoretical / stats.maxTheoretical) * 70 : 0) + ((practicalMark / 10) * 30);
    const isPassed = totalScore >= 60;

    const formatTime = (s: number) => {
        const min = Math.floor(s / 60);
        const sec = s % 60;
        return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    };

    const handleMark = (status: ReviewStatus) => {
        let score = 0;
        if (status === 'answered') score = 10;
        else if (status === 'need-improvement') score = 5;

        setResults(prev => [...prev.filter(r => r.questionId !== currentQuestion.id), {
            questionId: currentQuestion.id,
            status,
            score
        }]);

        if (currentIndex < moduleQuestions.length - 1) {
            setTimeout(() => {
                setCurrentIndex(currentIndex + 1);
                setShowAnswer(false); // Hide answer for next question
            }, 300);
        }
    };

    const handleFinishSession = () => {
        const finalState: Record<string, unknown> = {
            status: isPassed ? 'completed' : 'failed',
            scores: {
                theoretical: stats.theoretical,
                maxTheoretical: stats.maxTheoretical,
                practical: practicalMark,
                total: totalScore
            },
            notes,
            session_data: { results, currentIndex, seconds, practicalLink }
        };

        const promise = updateReview(review.id, finalState as unknown as import('@/types').UpdateReviewRequest)
            .then(async () => {
                localStorage.removeItem(`review_session_${review.id}`);
                onComplete();
            });

        toast.promise(promise, {
            loading: 'Saving session results...',
            success: 'Session completed successfully!',
            error: (e) => `Error: ${e.message}`
        });
    };

    if (showResult) {
        return (
            <div className="h-full flex flex-col p-8 bg-bg-main overflow-y-auto custom-scrollbar">
                <div className={cn("rounded-3xl p-8 mb-8 text-white", isPassed ? "bg-green-600" : "bg-red-600")}>
                    <h2 className="text-2xl font-black mb-2">{isPassed ? 'Passed' : 'Failed'}</h2>
                    <div className="text-4xl font-black">{totalScore.toFixed(0)}%</div>
                </div>
                <div className="space-y-4 flex-1">
                    <div className="bg-bg-white p-6 rounded-2xl border border-border-base">
                        <span className="text-[10px] font-black uppercase text-text-tertiary tracking-widest block mb-1">Assessment For</span>
                        <div className="font-bold text-text-primary">{review.studentName}</div>
                    </div>
                </div>
                <button
                    className="btn btn-primary h-14 mt-8 w-full shadow-lg"
                    onClick={handleFinishSession}
                >
                    Close Session
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-bg-subtle">
            {/* Session Info Bar */}
            <div className="px-6 py-4 bg-bg-white border-b border-border-base flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-black text-xs">
                        {review.studentName?.[0]}
                    </div>
                    <div>
                        <div className="text-xs font-bold text-text-primary leading-tight">{review.studentName}</div>
                        <div className="text-[8px] font-black text-text-tertiary uppercase tracking-wider">{review.module}</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[8px] font-black text-text-tertiary uppercase tracking-wider leading-none mb-1">TIME</div>
                        <div className="font-mono text-sm font-bold text-text-primary leading-none">{formatTime(seconds)}</div>
                    </div>
                    <div className="w-px h-6 bg-border-base" />
                    <div className="text-right">
                        <div className="text-[8px] font-black text-text-tertiary uppercase tracking-wider leading-none mb-1">SCORE</div>
                        <div className={cn("text-sm font-black leading-none", isPassed ? "text-green-600" : "text-amber-500")}>
                            {totalScore.toFixed(0)}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className={cn(
                    "mx-auto space-y-8 h-full",
                    isFullScreen ? "max-w-6xl py-12" : "max-w-xl"
                )}>
                    <div className="flex justify-between items-center px-2">
                        <span className="badge bg-primary text-white border-none px-4 py-2 text-[10px] font-black uppercase tracking-widest">
                            {review.module} • Question {currentIndex + 1} of {moduleQuestions.length}
                        </span>
                        <div className="flex gap-2">
                            <button className="btn btn-secondary w-10 h-10 p-0 shadow-sm" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
                                <ArrowLeft size={18} />
                            </button>
                            <button className="btn btn-secondary w-10 h-10 p-0 shadow-sm" onClick={() => setCurrentIndex(Math.min(moduleQuestions.length - 1, currentIndex + 1))} disabled={currentIndex === moduleQuestions.length - 1}>
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {currentQuestion ? (
                            <motion.div
                                key={currentQuestion.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className={cn("space-y-12", isFullScreen ? "grid grid-cols-1 lg:grid-cols-2 gap-12 space-y-0" : "")}
                            >
                                <div className="space-y-8">
                                    <h1 className={cn(
                                        "font-black text-text-primary tracking-tight leading-tight",
                                        isMini ? "text-xl" : isFullScreen ? "text-5xl" : "text-3xl"
                                    )}>
                                        {currentQuestion.text}
                                    </h1>

                                    <div className="space-y-4">
                                        {!showAnswer ? (
                                            <button
                                                onClick={() => setShowAnswer(true)}
                                                className="w-full p-8 rounded-[2.5rem] bg-bg-white border-2 border-dashed border-border-base hover:border-primary/30 hover:bg-primary-subtle group transition-all flex flex-col items-center justify-center gap-4"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <Eye size={24} />
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-xs font-black uppercase tracking-widest text-text-primary mb-1">View Answer Guidance</div>
                                                    <div className="text-[10px] text-text-tertiary font-bold">Default hidden for mentor assessment</div>
                                                </div>
                                            </button>
                                        ) : (
                                            <div className="bg-bg-white p-8 rounded-[2.5rem] border border-primary/10 shadow-xl border-l-[6px] border-l-primary relative">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-2 text-[10px] font-black tracking-widest text-primary items-center uppercase">
                                                        <PenTool size={14} /> Answer Guidance
                                                    </div>
                                                    <button
                                                        onClick={() => setShowAnswer(false)}
                                                        className="btn-icon w-8 h-8 rounded-lg bg-bg-subtle hover:bg-red-50 hover:text-red-500 transition-all border-none"
                                                        title="Hide Answer"
                                                    >
                                                        <EyeOff size={14} />
                                                    </button>
                                                </div>
                                                <div className={cn(
                                                    "text-text-secondary leading-relaxed font-medium whitespace-pre-wrap",
                                                    isMini ? "text-xs" : isFullScreen ? "text-xl" : "text-base"
                                                )}>
                                                    {currentQuestion.answer || "Experimental practical question - Verify logic directly."}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 justify-center">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary px-2 mb-2">Mark Candidate Performance</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { status: 'answered' as ReviewStatus, label: 'Exemplary', icon: CheckCircle, color: '#10b981', bg: 'bg-green-50' },
                                            { status: 'need-improvement' as ReviewStatus, label: 'Correction', icon: AlertCircle, color: '#f59e0b', bg: 'bg-amber-50' },
                                            { status: 'wrong' as ReviewStatus, label: 'Unsatisfactory', icon: XCircle, color: '#ef4444', bg: 'bg-red-50' },
                                            { status: 'skip' as ReviewStatus, label: 'Bypass', icon: SkipForward, color: '#64748b', bg: 'bg-slate-50' }
                                        ].map(btn => (
                                            <button
                                                key={btn.status}
                                                onClick={() => handleMark(btn.status)}
                                                className={cn(
                                                    "flex items-center gap-4 p-6 rounded-[2rem] border-2 transition-all relative overflow-hidden group",
                                                    currentResult?.status === btn.status
                                                        ? "bg-bg-white border-primary shadow-xl ring-4 ring-primary-subtle"
                                                        : cn("bg-transparent border-transparent hover:bg-bg-white shadow-sm border-dashed hover:border-solid hover:border-border-base", btn.bg)
                                                )}
                                                style={{ color: currentResult?.status === btn.status ? btn.color : '#475569' }}
                                            >
                                                <btn.icon size={isFullScreen ? 24 : 18} className={cn("transition-transform group-hover:scale-110", currentResult?.status === btn.status && "animate-pulse")} />
                                                <span className="font-black text-[11px] uppercase tracking-widest">{btn.label}</span>
                                                {currentResult?.status === btn.status && (
                                                    <div className="absolute right-6 w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ) : null}
                    </AnimatePresence>

                    {/* Practical section link if not mini */}
                    {!isMini && (
                        <div className={cn(
                            "pt-12 border-t border-border-base space-y-8",
                            isFullScreen ? "grid grid-cols-1 lg:grid-cols-2 gap-12 space-y-0" : ""
                        )}>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Practical Submission Link</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            className="h-14 w-full px-6 bg-bg-white rounded-2xl text-base font-bold shadow-inner outline-none border border-border-base focus:border-primary focus:ring-4 focus:ring-primary-subtle transition-all"
                                            placeholder="https://github.com/..."
                                            value={practicalLink}
                                            onChange={e => setPracticalLink(e.target.value)}
                                        />
                                        <ExternalLink size={16} className="absolute right-5 top-5 text-text-tertiary" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Practical Mark</label>
                                        <span className="text-xl font-black text-primary">{practicalMark}/10</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="1"
                                        value={practicalMark}
                                        onChange={e => setPracticalMark(parseInt(e.target.value))}
                                        className="w-full h-2 bg-bg-white rounded-lg appearance-none cursor-pointer accent-primary border border-border-base shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Session Notes & Feedback</label>
                                <textarea
                                    className="w-full h-full min-h-[160px] p-6 bg-bg-white border border-border-base rounded-3xl text-base font-medium outline-none focus:border-primary focus:ring-4 focus:ring-primary-subtle transition-all resize-none shadow-sm placeholder:italic"
                                    placeholder="Detail technical observations, strengths, and areas for improvement..."
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="p-6 bg-bg-white border-t border-border-base shrink-0">
                <button
                    className="btn btn-primary h-14 w-full shadow-lg shadow-primary/20 font-black"
                    onClick={() => {
                        if (!practicalLink && !isMini) {
                            toast.error("Please provide a Practical Submission Link");
                            return;
                        }
                        setShowResult(true);
                    }}
                >
                    Review Performance <ArrowRight size={18} className="ml-2" />
                </button>
            </div>
        </div>
    );
};
