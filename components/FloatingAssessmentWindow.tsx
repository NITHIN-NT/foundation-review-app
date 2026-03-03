"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCircle, AlertCircle, XCircle,
    SkipForward, ExternalLink, ArrowRight, ArrowLeft, X,
    PenTool, Eye, EyeOff
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
    const { mode } = useAssessment();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

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

    if (!mounted || !isOpen || !review) return null;

    return (
        <>
            <AnimatePresence mode="wait">
                <motion.div
                    key="assessment-window-root"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 bg-bg-main flex flex-col overflow-hidden z-[9999]"
                >
                    <div className="flex-1 overflow-hidden relative">
                        {isLoading ? (
                            <div className="flex flex-col h-full">
                                <div className="h-16 bg-bg-white border-b border-border-base flex items-center justify-between px-8 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 animate-pulse" />
                                        <div className="h-4 w-32 bg-bg-subtle animate-pulse rounded-md" />
                                    </div>
                                    <button onClick={onClose} className="text-text-tertiary hover:text-red-500">
                                        <X size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                                </div>
                            </div>
                        ) : (
                            <ReviewSessionView
                                review={review}
                                questions={questions}
                                mode={mode}
                                onComplete={onComplete}
                                onExit={onClose}
                            />
                        )}
                    </div>
                </motion.div >
            </AnimatePresence >
        </>
    );
};

interface SessionProps {
    review: ScheduledReview;
    questions: Question[];
    mode: WindowMode;
    onComplete: () => void;
    onExit: () => void;
}

const ReviewSessionView: React.FC<SessionProps> = ({ review, questions, mode, onComplete, onExit }) => {
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
    const [practicalMark2, setPracticalMark2] = useState<number>(getSaved('practicalMark2', 0));
    const [practicalMark3, setPracticalMark3] = useState<number>(getSaved('practicalMark3', 0));
    const [practicalLink, setPracticalLink] = useState<string>(getSaved('practicalLink', ''));
    const [practicalLink2, setPracticalLink2] = useState<string>(getSaved('practicalLink2', ''));
    const [practicalLink3, setPracticalLink3] = useState<string>(getSaved('practicalLink3', ''));
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
            practicalMark2,
            practicalMark3,
            practicalLink,
            practicalLink2,
            practicalLink3,
            seconds,
            notes,
            isPaused,
            timestamp: Date.now()
        };
        localStorage.setItem(`review_session_${review.id}`, JSON.stringify(state));
    }, [currentIndex, results, practicalMark, practicalMark2, practicalMark3, practicalLink, practicalLink2, practicalLink3, seconds, notes, isPaused, review.id]);

    const stats = {
        theoretical: results.reduce((acc, curr) => acc + curr.score, 0),
        maxTheoretical: moduleQuestions.length * 10
    };

    const effectivePracticalMark = review.module === 'Module 4'
        ? (practicalMark + practicalMark2 + practicalMark3) / 3
        : practicalMark;

    const totalScore = (stats.maxTheoretical > 0 ? (stats.theoretical / stats.maxTheoretical) * 70 : 0) + ((effectivePracticalMark / 10) * 30);
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
                practical: effectivePracticalMark,
                total: totalScore
            },
            notes,
            session_data: {
                results,
                currentIndex,
                seconds,
                practicalLink,
                practicalLink2,
                practicalLink3,
                individualMarks: { practicalMark, practicalMark2, practicalMark3 }
            }
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
            {/* Unified Session Header */}
            <div className="h-16 bg-bg-white border-b border-border-base flex items-center justify-between px-6 shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-sm">
                        {review.studentName?.[0]}
                    </div>
                    <div className="hidden sm:block">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-tertiary block leading-none mb-1">
                            Active Session
                        </span>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-text-primary">{review.studentName}</span>
                            <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                            <span className="text-[10px] font-black text-text-tertiary uppercase">{review.module}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-6 bg-bg-subtle/50 px-6 py-2 rounded-2xl border border-border-subtle">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Timer</span>
                            <span className="font-mono text-sm font-bold text-text-primary">{formatTime(seconds)}</span>
                        </div>
                        <div className="w-px h-6 bg-border-subtle" />
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-text-tertiary uppercase tracking-widest">Score</span>
                            <span className={cn("text-sm font-black", isPassed ? "text-green-600" : "text-amber-500")}>
                                {totalScore.toFixed(0)}%
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={onExit}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 hover:text-red-500 rounded-xl text-text-tertiary transition-all font-black text-[10px] uppercase tracking-widest border border-transparent hover:border-red-100"
                    >
                        <X size={18} /> Exit
                    </button>
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
                                    <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">
                                        {review.module === 'Module 4' ? 'Practical Submission Link 1' : 'Practical Submission Link'}
                                    </label>
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
                                        <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">
                                            {review.module === 'Module 4' ? 'Project 1 Mark' : 'Practical Mark'}
                                        </label>
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

                                {review.module === 'Module 4' && (
                                    <>
                                        <div className="space-y-6 pt-4 border-t border-border-base/50">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Practical Submission Link 2</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="h-14 w-full px-6 bg-bg-white rounded-2xl text-base font-bold shadow-inner outline-none border border-border-base focus:border-primary focus:ring-4 focus:ring-primary-subtle transition-all"
                                                        placeholder="URL or technical feedback..."
                                                        value={practicalLink2}
                                                        onChange={e => setPracticalLink2(e.target.value)}
                                                    />
                                                    <ExternalLink size={16} className="absolute right-5 top-5 text-text-tertiary" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Project 2 Mark</label>
                                                    <span className="text-xl font-black text-primary">{practicalMark2}/10</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    step="1"
                                                    value={practicalMark2}
                                                    onChange={e => setPracticalMark2(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-bg-white rounded-lg appearance-none cursor-pointer accent-primary border border-border-base shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-6 pt-4 border-t border-border-base/50">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Practical Submission Link 3</label>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        className="h-14 w-full px-6 bg-bg-white rounded-2xl text-base font-bold shadow-inner outline-none border border-border-base focus:border-primary focus:ring-4 focus:ring-primary-subtle transition-all"
                                                        placeholder="URL or technical feedback..."
                                                        value={practicalLink3}
                                                        onChange={e => setPracticalLink3(e.target.value)}
                                                    />
                                                    <ExternalLink size={16} className="absolute right-5 top-5 text-text-tertiary" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center px-1">
                                                    <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Project 3 Mark</label>
                                                    <span className="text-xl font-black text-primary">{practicalMark3}/10</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    step="1"
                                                    value={practicalMark3}
                                                    onChange={e => setPracticalMark3(parseInt(e.target.value))}
                                                    className="w-full h-2 bg-bg-white rounded-lg appearance-none cursor-pointer accent-primary border border-border-base shadow-inner"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
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
                            toast.error(`Please provide ${review.module === 'Module 4' ? 'at least one' : 'the'} Practical Submission Link`);
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
