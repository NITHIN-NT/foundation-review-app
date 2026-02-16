"use client";

import React, { useState, useEffect, use } from 'react';
import {
    ChevronLeft, CheckCircle, AlertCircle, XCircle,
    SkipForward, Terminal, PenTool, ExternalLink, ArrowRight, ArrowLeft, Play, Pause, RotateCcw, Code, FileText, Copy, ClipboardCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { ScheduledReview, Question, ReviewStatus, QuestionResult } from '@/types';
import questionsData from '@/data/questions.json';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fetchReviews, createReview, updateReview, API_URL } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';


export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [review, setReview] = useState<ScheduledReview | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load review data
    useEffect(() => {
        fetch(`${API_URL}/reviews/${id}`)
            .then(res => res.json())
            .then(data => {
                setReview(data);
                setIsLoading(false);
            })
            .catch(() => {
                toast.error('Failed to load assessment data');
                router.push('/');
            });
    }, [id, router]);

    if (isLoading || !review) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return <ReviewSessionView review={review} onCancel={() => router.push('/')} onComplete={() => router.push('/')} />;
}

interface Props {
    review: ScheduledReview;
    onCancel: () => void;
    onComplete: () => void;
}

const ReviewSessionView: React.FC<Props> = ({ review, onCancel, onComplete }) => {
    const moduleIdStr = review.module.split(' ')[1];
    const moduleId = parseInt(moduleIdStr);

    const moduleQuestions = (questionsData as Question[]).filter(q =>
        q.module_id === moduleId ||
        q.module_id === moduleIdStr as any
    );

    const getSaved = (key: string, def: any) => {
        try {
            const saved = localStorage.getItem(`review_session_${review.id}`);
            if (!saved) return def;
            const data = JSON.parse(saved);
            return data[key] !== undefined ? data[key] : def;
        } catch { return def; }
    };

    const [currentIndex, setCurrentIndex] = useState(() => getSaved('currentIndex', 0));
    const [results, setResults] = useState<QuestionResult[]>(() => getSaved('results', []));
    const [practicalMark, setPracticalMark] = useState<number>(() => getSaved('practicalMark', 0));
    const [practicalLink, setPracticalLink] = useState(() => getSaved('practicalLink', ''));
    const [seconds, setSeconds] = useState(() => getSaved('seconds', 0));
    const [notes, setNotes] = useState(() => getSaved('notes', ''));
    const [showResult, setShowResult] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [linkError, setLinkError] = useState(false);
    const [isPaused, setIsPaused] = useState(() => getSaved('isPaused', false));

    const [language, setLanguage] = useState<'java' | 'c'>(() => getSaved('language', 'c'));
    const [code, setCode] = useState(() => getSaved('code', '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}'));
    const [output, setOutput] = useState<string[]>(['System: Ready for execution...']);
    const [isRunning, setIsRunning] = useState(false);

    const handleLanguageChange = (newLang: 'java' | 'c') => {
        setLanguage(newLang);
        if (newLang === 'java') {
            setCode('public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}');
        } else {
            setCode('#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}');
        }
    };

    const currentQuestion = moduleQuestions[currentIndex];
    const currentResult = results.find(r => r.questionId === currentQuestion?.id);

    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => setSeconds((s: number) => s + 1), 1000);
        return () => clearInterval(timer);
    }, [isPaused]);

    useEffect(() => {
        const state = { currentIndex, results, practicalMark, practicalLink, seconds, notes, language, code, isPaused };
        localStorage.setItem(`review_session_${review.id}`, JSON.stringify(state));
    }, [currentIndex, results, practicalMark, practicalLink, seconds, notes, language, code, isPaused, review.id]);

    const stats = {
        theoretical: results.reduce((acc, curr) => acc + curr.score, 0),
        maxTheoretical: moduleQuestions.length * 10
    };
    const totalScore = (stats.maxTheoretical > 0 ? (stats.theoretical / stats.maxTheoretical) * 70 : 0) + ((practicalMark / 10) * 30);
    const isPassed = totalScore >= 60;

    const handleFinishSession = () => {
        const finalState: any = {
            status: isPassed ? 'completed' : 'failed',
            scores: {
                theoretical: stats.theoretical,
                maxTheoretical: stats.maxTheoretical,
                practical: practicalMark,
                total: totalScore
            },
            notes,
            session_data: { results, currentIndex, seconds, code, language, practicalLink }
        };

        const promise = updateReview(review.id, finalState)
            .then(() => {
                localStorage.removeItem(`review_session_${review.id}`);
                onComplete();
            });

        toast.promise(promise, {
            loading: 'Saving session results...',
            success: 'Session completed successfully!',
            error: (e) => `Error: ${e.message}`
        });
    };

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
            setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
        }
    };

    const runCode = () => {
        setIsRunning(true);
        setOutput(prev => [...prev, `[${new Date().toLocaleTimeString()}] Compiling ${language}...`]);

        setTimeout(() => {
            setOutput(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] Execution Successful.`, `> Program output: Hello World`]);
            setIsRunning(false);
        }, 800);
    };

    const handleSubmit = () => {
        const unmarkedIndex = moduleQuestions.findIndex(q => !results.find(r => r.questionId === q.id));

        if (unmarkedIndex !== -1) {
            setCurrentIndex(unmarkedIndex);
            toast.error(`Please mark Question ${unmarkedIndex + 1} before submitting.`);
            return;
        }

        if (!practicalLink.trim()) {
            setLinkError(true);
            toast.error("Missing Question Link", {
                description: "Please provide the Question Link to complete the evaluation."
            });
            return;
        }
        setLinkError(false);
        setShowFeedbackModal(true);
    };

    const handleGenerateReport = () => {
        setShowFeedbackModal(false);
        setShowResult(true);
        if (isPassed) {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#6366f1', '#10b981', '#ffffff']
            });
        }
    };

    const copyReport = () => {
        const wrongQs = moduleQuestions.filter(q => results.find(r => r.questionId === q.id)?.status === 'wrong');
        const improveQs = moduleQuestions.filter(q => results.find(r => r.questionId === q.id)?.status === 'need-improvement');

        let report = `Evaluation Report: ${review.studentName}\nModule: ${review.module}\nResult: ${isPassed ? 'Passed' : 'Failed'} (${totalScore.toFixed(1)}%)\n\n`;

        if (improveQs.length > 0) {
            report += `Need Improvement\n---------\n`;
            improveQs.forEach(q => report += `- ${q.text}\n`);
            report += `\n`;
        }

        if (wrongQs.length > 0) {
            report += `Incorrect / Pending Mastery\n---------\n`;
            wrongQs.forEach(q => report += `- ${q.text}\n`);
            report += `\n`;
        }

        if (notes) {
            report += `Feedback:\n${notes}\n`;
        }

        navigator.clipboard.writeText(report);
        toast.success('Report copied to clipboard');
    };

    if (showFeedbackModal) {
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="bg-bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl"
                >
                    <div className="p-10 flex justify-between items-start bg-bg-subtle border-b border-border-base">
                        <div>
                            <h2 className="text-2xl font-black text-text-primary tracking-tight">Assessment Commentary</h2>
                            <p className="text-text-tertiary text-sm mt-2">Refine your observations before final publication.</p>
                        </div>
                        <div className="w-14 h-14 rounded-2xl bg-primary-subtle flex items-center justify-center text-primary shadow-inner">
                            <ClipboardCheck size={28} />
                        </div>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">Technical Observations</label>
                            <textarea
                                className="w-full h-64 p-6 bg-bg-subtle border border-border-base rounded-2xl text-base leading-relaxed text-text-primary outline-none focus:bg-bg-white focus:border-primary focus:ring-4 focus:ring-primary-subtle transition-all resize-none shadow-inner"
                                placeholder="Detail the student's performance, areas of excellence, and specific technical gaps identified during this session..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                autoFocus
                            />
                        </div>

                        <div className="flex gap-4 p-5 bg-amber-50 rounded-2xl border border-amber-100 items-start">
                            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-800 leading-relaxed">
                                <b>Internal Policy:</b> Feedback must be constructive and include specific code-level examples from the practical assessment.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <button className="btn btn-secondary flex-1 h-14 text-base" onClick={() => setShowFeedbackModal(false)}>
                                Back to Session
                            </button>
                            <button
                                className="btn btn-primary flex-[2] h-14 text-base shadow-lg shadow-primary/20"
                                onClick={handleGenerateReport}
                            >
                                Finalize Evaluation Report
                                <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (showResult) {
        const wrongQs = moduleQuestions.filter(q => results.find(r => r.questionId === q.id)?.status === 'wrong');
        const improveQs = moduleQuestions.filter(q => results.find(r => r.questionId === q.id)?.status === 'need-improvement');
        const perfectQs = moduleQuestions.filter(q => results.find(r => r.questionId === q.id)?.status === 'answered');

        return (
            <div className="fixed inset-0 z-[150] bg-bg-main overflow-y-auto py-12 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto bg-bg-white rounded-[40px] shadow-2xl border border-border-base overflow-hidden"
                >
                    {/* Executive Header */}
                    <div className={cn("p-12 relative overflow-hidden", isPassed ? "bg-green-600" : "bg-red-600")}>
                        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 text-white">
                            {isPassed ? <CheckCircle size={240} /> : <XCircle size={240} />}
                        </div>

                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-8">
                            <div className="space-y-4">
                                <span className="badge bg-white/20 text-white border-none px-4 py-2">Assessment Certified</span>
                                <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tighter">
                                    {isPassed ? 'Certification Cleared' : 'Proficiency Unmet'}
                                </h1>
                                <p className="text-white/80 font-semibold text-lg">
                                    {review.studentName} • {review.module} • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">AGGREGATE SCORE</div>
                                <div className="text-7xl font-black text-white leading-none">
                                    {totalScore.toFixed(0)}<span className="text-3xl opacity-50">%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-12 space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-bg-subtle p-8 rounded-3xl border border-border-subtle hover:border-primary transition-colors group">
                                <span className="text-[10px] font-black uppercase text-text-tertiary tracking-widest mb-4 block">Theoretical Aptitude</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-text-primary group-hover:text-primary transition-colors">{((stats.theoretical / stats.maxTheoretical) * 70).toFixed(1)}</span>
                                    <span className="text-lg font-bold text-text-tertiary">/ 70</span>
                                </div>
                                <div className="h-2 bg-border-base rounded-full mt-6 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(stats.theoretical / stats.maxTheoretical) * 100}%` }}
                                        className="h-full bg-primary rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                                    />
                                </div>
                            </div>

                            <div className="bg-bg-subtle p-8 rounded-3xl border border-border-subtle hover:border-sky-500 transition-colors group">
                                <span className="text-[10px] font-black uppercase text-text-tertiary tracking-widest mb-4 block">Practical Execution</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-text-primary group-hover:text-sky-500 transition-colors">{((practicalMark / 10) * 30).toFixed(1)}</span>
                                    <span className="text-lg font-bold text-text-tertiary">/ 30</span>
                                </div>
                                <div className="h-2 bg-border-base rounded-full mt-6 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(practicalMark / 10) * 100}%` }}
                                        className="h-full bg-sky-500 rounded-full shadow-[0_0_12px_rgba(14,165,233,0.4)]"
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-900 p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1 block">Mastery Index</span>
                                    <div className="text-4xl font-black text-white">{totalScore.toFixed(1)}%</div>
                                </div>
                                <div className="flex gap-1 mt-6">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ scaleY: 0.1 }}
                                            animate={{ scaleY: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className={cn(
                                                "h-6 flex-1 rounded-full",
                                                (i + 1) * (100 / 12) <= totalScore
                                                    ? (isPassed ? "bg-green-500" : "bg-red-500")
                                                    : "bg-slate-700"
                                            )}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <section>
                                    <h3 className="section-title text-text-primary">
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        Insight Summary
                                    </h3>
                                    <div className="bg-bg-subtle p-8 rounded-3xl border border-border-subtle italic text-text-secondary leading-relaxed shadow-inner">
                                        "{notes || "Qualitative technical assessment was not recorded for this candidate."}"
                                    </div>
                                </section>

                                <section>
                                    <h3 className="section-title text-text-primary">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Key Proficiency Successes
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {perfectQs.length > 0 ? perfectQs.map(q => (
                                            <span key={q.id} className="bg-green-50 text-green-700 border border-green-100 rounded-xl px-4 py-2 text-xs font-bold shadow-sm">
                                                {q.text.split(' ').slice(0, 4).join(' ')}...
                                            </span>
                                        )) : <span className="text-sm text-text-tertiary italic">No absolute proficiencies identified.</span>}
                                    </div>
                                </section>
                            </div>

                            <section>
                                <h3 className="section-title text-text-primary">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    Technical Growth Opportunities
                                </h3>
                                <div className="space-y-3">
                                    {wrongQs.length > 0 ? wrongQs.map(q => (
                                        <div key={q.id} className="flex gap-4 p-5 bg-red-50 border border-red-100 rounded-2xl items-start group hover:bg-red-100 transition-colors">
                                            <XCircle size={20} className="text-red-500 mt-0.5 shrink-0" />
                                            <span className="text-sm font-bold text-red-900 leading-tight">{q.text}</span>
                                        </div>
                                    )) : (
                                        <div className="flex gap-4 p-6 bg-green-50 border border-green-100 rounded-3xl items-center shadow-sm">
                                            <CheckCircle size={24} className="text-green-600 shrink-0" />
                                            <span className="text-base font-black text-green-900">Zero critical failures detected. Candidate exhibits strong baseline.</span>
                                        </div>
                                    )}

                                    {improveQs.length > 0 && improveQs.map(q => (
                                        <div key={q.id} className="flex gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl items-start group hover:bg-amber-100 transition-colors">
                                            <AlertCircle size={20} className="text-amber-600 mt-0.5 shrink-0" />
                                            <span className="text-sm font-bold text-amber-900 leading-tight">{q.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        <div className="pt-12 border-t border-border-base flex flex-wrap gap-4">
                            <button onClick={copyReport} className="btn btn-secondary h-12 px-8">
                                <Copy size={20} /> Copy Executive Report
                            </button>
                            <button onClick={() => window.print()} className="btn btn-secondary h-12 px-8">
                                <ExternalLink size={20} /> Print Manifest
                            </button>
                            <div className="flex-1" />
                            <button
                                className="btn btn-primary h-14 px-12 bg-slate-900 hover:bg-black text-white text-lg font-black shadow-xl"
                                onClick={handleFinishSession}
                            >
                                Close Session
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden fixed inset-0 z-[200] bg-bg-main">
            {/* HUD Header */}
            <header className="h-20 bg-bg-white border-b border-border-base flex items-center px-8 shrink-0 shadow-sm z-10">
                <button onClick={onCancel} className="btn-icon w-10 h-10 hover:bg-bg-subtle">
                    <ChevronLeft size={24} />
                </button>
                <div className="w-px h-8 bg-border-base mx-6" />
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg shadow-lg">
                        {review.studentName?.[0]}
                    </div>
                    <div>
                        <h2 className="font-bold text-text-primary leading-tight">{review.studentName}</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">{review.batch} • {review.module}</p>
                    </div>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-4 bg-bg-subtle p-2 pr-6 rounded-2xl border border-border-base shadow-inner">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                                isPaused ? "bg-green-100 text-green-600 hover:bg-green-200" : "bg-bg-white text-amber-500 hover:bg-amber-50"
                            )}
                        >
                            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
                        </button>
                        <button
                            onClick={() => window.confirm('Reset evaluation timer?') && setSeconds(0)}
                            className="w-10 h-10 rounded-xl bg-bg-white text-text-tertiary flex items-center justify-center hover:bg-bg-white hover:text-text-primary border border-transparent hover:border-border-base transition-all"
                        >
                            <RotateCcw size={18} />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black tracking-widest text-text-tertiary leading-none mb-1">{isPaused ? 'HUD PAUSED' : 'SESSION TIME'}</span>
                            <span className="font-mono font-bold text-xl leading-none text-text-primary">{formatTime(seconds)}</span>
                        </div>
                    </div>

                    <div className="text-right">
                        <span className="text-[9px] font-black tracking-widest text-text-tertiary block mb-1">RUNNING INDEX</span>
                        <span className={cn("text-2xl font-black leading-none", isPassed ? "text-green-600" : "text-amber-500")}>
                            {totalScore.toFixed(1)}%
                        </span>
                    </div>
                    <button className="btn btn-primary h-12 px-8 font-black text-base shadow-lg shadow-primary/20" onClick={handleSubmit}>
                        Finalize Assessment
                        <ArrowRight size={20} />
                    </button>
                </div>
            </header>

            {/* Workspace */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden bg-bg-subtle">
                {/* Theoretical Plane */}
                <div className="p-12 overflow-y-auto custom-scrollbar bg-bg-main">
                    <div className="max-w-xl mx-auto space-y-12">
                        <div className="flex justify-between items-center bg-bg-white p-4 pr-6 rounded-2xl shadow-sm border border-border-base">
                            <span className="badge bg-primary text-white border-none px-4">Q-{currentIndex + 1} / {moduleQuestions.length}</span>
                            <div className="flex gap-2">
                                <button className="btn btn-secondary w-10 p-0 h-10 bg-transparent" onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} disabled={currentIndex === 0}>
                                    <ArrowLeft size={20} />
                                </button>
                                <button className="btn btn-secondary w-10 p-0 h-10 bg-transparent" onClick={() => setCurrentIndex(Math.min(moduleQuestions.length - 1, currentIndex + 1))} disabled={currentIndex === moduleQuestions.length - 1}>
                                    <ArrowRight size={20} />
                                </button>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            {currentQuestion ? (
                                <motion.div
                                    key={currentQuestion.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="space-y-10"
                                >
                                    <h1 className="text-4xl font-black text-text-primary tracking-tight leading-tight">{currentQuestion.text}</h1>

                                    <div className="bg-bg-white p-8 rounded-3xl border border-primary/10 shadow-xl border-l-4 border-l-primary relative">
                                        <div className="flex gap-2 text-[10px] font-black tracking-widest text-primary mb-4 items-center">
                                            <PenTool size={14} /> KNOWLEDGE REFERENCE
                                        </div>
                                        <p className="text-lg text-text-secondary leading-relaxed font-medium">
                                            {currentQuestion.answer || "Experimental practical question - Verify logic directly."}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { status: 'answered' as ReviewStatus, label: 'Exemplary', icon: CheckCircle, color: '#10b981', bg: 'bg-green-50' },
                                            { status: 'need-improvement' as ReviewStatus, label: 'Correction', icon: AlertCircle, color: '#f59e0b', bg: 'bg-amber-50' },
                                            { status: 'wrong' as ReviewStatus, label: 'Unsatisfactory', icon: XCircle, color: '#ef4444', bg: 'bg-red-50' },
                                            { status: 'skip' as ReviewStatus, label: 'Bypass', icon: SkipForward, color: '#64748b', bg: 'bg-slate-100' }
                                        ].map(btn => (
                                            <button
                                                key={btn.status}
                                                onClick={() => handleMark(btn.status)}
                                                className={cn(
                                                    "flex items-center gap-4 p-5 rounded-2xl border-2 transition-all group relative overflow-hidden",
                                                    currentResult?.status === btn.status
                                                        ? "bg-bg-white border-primary shadow-lg ring-4 ring-primary-subtle"
                                                        : "bg-transparent border-border-base hover:border-text-tertiary"
                                                )}
                                                style={{ color: currentResult?.status === btn.status ? btn.color : '#475569' }}
                                            >
                                                <btn.icon size={24} className={cn("transition-transform group-hover:scale-110", currentResult?.status === btn.status && "animate-pulse")} />
                                                <span className="font-black text-base uppercase tracking-tight">{btn.label}</span>
                                                {currentResult?.status === btn.status && (
                                                    <motion.div layoutId="activeMark" className="absolute right-4 w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="py-32 flex flex-col items-center justify-center text-text-tertiary opacity-30">
                                    <Terminal size={64} className="mb-6" />
                                    <span className="font-black tracking-widest uppercase">Null Dataset Reference</span>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Practical Plane */}
                <div className="p-12 space-y-8 overflow-y-auto custom-scrollbar border-l border-border-base">
                    {/* Virtual Compiler */}
                    <div className="bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col min-h-[440px]">
                        <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
                            <div className="flex gap-6 h-full">
                                <div className="flex gap-2 items-center text-indigo-400">
                                    <Code size={18} />
                                    <span className="text-[10px] font-black tracking-widest uppercase">Logical.Runtime</span>
                                </div>
                                <div className="flex gap-1 h-full items-center">
                                    {['c', 'java'].map(l => (
                                        <button
                                            key={l}
                                            onClick={() => handleLanguageChange(l as any)}
                                            className={cn(
                                                "px-4 h-8 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                                language === l ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"
                                            )}
                                        >
                                            {l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={runCode}
                                disabled={isRunning}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 px-4 rounded-lg flex items-center gap-2 text-[10px] font-black uppercase tracking-widest disabled:opacity-50 transition-all shadow-lg shadow-indigo-900/40"
                            >
                                {isRunning ? (
                                    <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                                ) : <Play size={12} fill="currentColor" />}
                                Execute
                            </button>
                        </div>
                        <textarea
                            className="flex-1 bg-transparent p-8 font-mono text-sm leading-relaxed text-slate-300 outline-none resize-none"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            spellCheck={false}
                        />
                        <div className="h-40 bg-black/40 border-t border-slate-800 p-6 font-mono text-[11px] text-green-400/80 overflow-y-auto">
                            <div className="flex gap-2 mb-2 text-slate-500 border-b border-slate-800 pb-2 mb-4 uppercase tracking-widest font-black text-[9px]">
                                Terminal Output
                            </div>
                            {output.map((line, i) => <div key={i} className="mb-1">{line}</div>)}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Analyst Notepad */}
                        <div className="bg-amber-50 h-full rounded-[2.5rem] p-8 border border-amber-100 shadow-inner flex flex-col group transition-all hover:bg-amber-100/50">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-2 text-[10px] font-black tracking-widest text-amber-600 uppercase">
                                    <FileText size={14} /> Live Observations
                                </div>
                                <button
                                    onClick={() => notes && (navigator.clipboard.writeText(notes), toast.success('Observations persistent to clipboard'))}
                                    className="p-2 bg-bg-white/50 rounded-xl text-amber-600 hover:bg-bg-white transition-all shadow-sm"
                                >
                                    <Copy size={16} />
                                </button>
                            </div>
                            <textarea
                                className="flex-1 bg-transparent border-none resize-none outline-none text-base text-amber-900 font-medium placeholder:text-amber-300 leading-relaxed"
                                placeholder="Synchronize findings here..."
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                            />
                        </div>

                        {/* Practical Proficiency Hud */}
                        <div className={cn(
                            "bg-bg-white rounded-[2.5rem] p-8 border-2 flex flex-col justify-between transition-all shadow-sm",
                            linkError ? "border-red-500 ring-4 ring-red-50" : "border-border-base"
                        )}>
                            <div className="flex gap-2 text-[10px] font-black tracking-widest text-text-tertiary uppercase mb-6">
                                <Terminal size={14} /> Practical Validation
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Question Repository *</label>
                                        <ExternalLink size={14} className="text-primary hover:text-primary-hover cursor-pointer" />
                                    </div>
                                    <input
                                        type="text"
                                        className={cn(
                                            "h-12 w-full px-5 bg-bg-subtle rounded-2xl text-sm font-bold shadow-inner outline-none transition-all",
                                            linkError ? "border border-red-200 focus:bg-bg-white focus:border-red-500" : "focus:bg-bg-white focus:ring-4 focus:ring-primary-subtle"
                                        )}
                                        placeholder="https://github.com/assessment/..."
                                        value={practicalLink}
                                        onChange={e => {
                                            setPracticalLink(e.target.value);
                                            if (e.target.value) setLinkError(false);
                                        }}
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-black uppercase text-text-tertiary tracking-widest">Execution Quality</label>
                                        <span className="text-xl font-black text-primary">{practicalMark}<span className="text-xs opacity-30 ml-0.5">/ 10</span></span>
                                    </div>
                                    <div className="relative h-2 flex items-center">
                                        <input
                                            type="range"
                                            min="0" max="10" step="0.5"
                                            className="w-full h-full appearance-none bg-slate-100 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white"
                                            value={practicalMark}
                                            onChange={e => setPracticalMark(parseFloat(e.target.value))}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
