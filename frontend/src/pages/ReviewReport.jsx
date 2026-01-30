import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { ArrowLeft, Check, X, AlertTriangle, Send, Layers, User, Users, SkipForward, Copy, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

const ReviewReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showCopyToast, setShowCopyToast] = useState(false);

    useEffect(() => {
        api.get(`core/reviews/${id}/`).then(res => {
            setSession(res.data);
            setFeedback(res.data.feedback_text || '');
        }).catch(console.error);
    }, [id]);

    const stats = session ? {
        answered: session.responses.filter(r => r.status === 'ANSWERED').length,
        improvement: session.responses.filter(r => r.status === 'IMPROVEMENT').length,
        wrong: session.responses.filter(r => r.status === 'NOT_ANSWERED').length,
        skipped: session.responses.filter(r => r.status === 'SKIPPED').length,
        total: session.responses.length
    } : null;

    const score = stats?.total > 0 ? Math.round((stats.answered / stats.total) * 100) : 0;
    const isPassed = score >= 60;

    useEffect(() => {
        if (session && isPassed) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10b981', '#3b82f6', '#f59e0b']
            });
        }
    }, [session, isPassed]);

    const handleCopyReport = () => {
        const pendingQuestions = session.responses
            .filter(r => r.status === 'NOT_ANSWERED')
            .map(r => r.question_text)
            .join('\n');

        const improvementQuestions = session.responses
            .filter(r => r.status === 'IMPROVEMENT')
            .map(r => r.question_text)
            .join('\n');

        let reportSections = [];

        if (pendingQuestions) {
            reportSections.push(`Pending\n-----------\n${pendingQuestions}`);
        }

        if (improvementQuestions) {
            reportSections.push(`Need Improvements\n----------------------------\n${improvementQuestions}`);
        }

        if (session.scorecard_data && Object.keys(session.scorecard_data).length > 0) {
            let scorecardText = `${session.module_name} Assessment Scores\n----------------------------`;
            Object.entries(session.scorecard_data).forEach(([cat, score]) => {
                scorecardText += `\n${cat}: ${score}/10`;
            });
            reportSections.push(scorecardText);
        }

        if (feedback) {
            reportSections.push(feedback);
        }

        const reportText = reportSections.join('\n\n').trim() || 'Review assessment submitted successfully.';

        navigator.clipboard.writeText(reportText);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.patch(`core/reviews/${id}/`, { feedback_text: feedback, is_completed: true });

            if (isPassed) {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#10b981', '#3b82f6', '#f59e0b']
                });
            }
            // Update local state to show completion state
            setSession(prev => ({ ...prev, is_completed: true }));
        } catch (err) {
            console.error(err);
            setIsSubmitting(false);
        }
    };

    if (!session) return <div className="text-center text-muted" style={{ padding: '4rem' }}>Loading...</div>;

    const studentName = session.student_name || session.student_display_name || 'Student';
    const isSubmitted = session.is_completed;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative' }}>
            {/* Copy Success Toast */}
            <AnimatePresence>
                {showCopyToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        style={{
                            position: 'fixed',
                            top: '2rem',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--text)',
                            color: 'var(--bg)',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '99px',
                            zIndex: 100,
                            boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                            fontSize: '0.875rem',
                            fontWeight: 500
                        }}
                    >
                        Report copied to clipboard!
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate(isSubmitted ? '/' : `/review/${id}`)} className="btn btn-ghost btn-icon">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <span className="text-xs uppercase text-muted font-medium">
                        {session.module_name || 'Foundation'} Report
                    </span>
                    <h1>{studentName}</h1>
                </div>
            </div>

            <div className="flex flex-col gap-6" style={{ paddingBottom: '4rem' }}>
                {/* Result Spotlight */}
                <div className={`card flex flex-col items-center justify-center gap-2 text-center`}
                    style={{
                        background: isPassed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        border: `1px solid ${isPassed ? 'var(--success)' : 'var(--danger)'}`,
                        padding: '2.5rem'
                    }}>
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        color: isPassed ? 'var(--success)' : 'var(--danger)'
                    }}>
                        {isPassed ? 'Assessment Passed' : 'Needs More Preparation'}
                    </div>
                    <div style={{ fontSize: '4rem', fontWeight: 800, lineHeight: 1 }}>{score}%</div>
                    <div className="text-muted text-sm">Target score: 60%</div>

                    {/* Gated Copy Button & Dashboard Link */}
                    <AnimatePresence>
                        {isSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center gap-3"
                                style={{ marginTop: '1.5rem' }}
                            >
                                <button
                                    onClick={handleCopyReport}
                                    className="btn btn-primary flex items-center gap-2"
                                    style={{ padding: '0.75rem 2rem', borderRadius: '12px' }}
                                >
                                    <Copy size={18} />
                                    Copy Report to Clipboard
                                </button>
                                <button
                                    onClick={() => navigate('/')}
                                    className="btn btn-ghost text-sm"
                                >
                                    Back to Dashboard
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Scorecard Display */}
                {session.scorecard_data && Object.keys(session.scorecard_data).length > 0 && (
                    <div className="card flex flex-col gap-4">
                        <div className="text-sm font-semibold uppercase tracking-wider text-muted">{session.module_name} Assessment Scores</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(session.scorecard_data).map(([cat, score]) => (
                                <div key={cat} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--hover)' }}>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{cat}</span>
                                        {cat === "Theory" && session.module_name !== 'M4' && (
                                            <span className="text-xs text-muted">Auto-calculated from review</span>
                                        )}
                                    </div>
                                    <span className="font-bold">{score} / 10</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Info Cards */}
                <div className="grid grid-cols-3 gap-4">
                    {session.batch && (
                        <div className="card flex items-center gap-3">
                            <Users size={20} className="text-muted" />
                            <div>
                                <div className="text-xs uppercase text-muted">Batch</div>
                                <div className="font-medium">{session.batch}</div>
                            </div>
                        </div>
                    )}
                    {session.module_name && (
                        <div className="card flex items-center gap-3">
                            <Layers size={20} className="text-muted" />
                            <div>
                                <div className="text-xs uppercase text-muted">Module</div>
                                <div className="font-medium">{session.module_name}</div>
                            </div>
                        </div>
                    )}
                    {session.coordinator && (
                        <div className="card flex items-center gap-3">
                            <User size={20} className="text-muted" />
                            <div>
                                <div className="text-xs uppercase text-muted">Coordinator</div>
                                <div className="font-medium">{session.coordinator}</div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Score Breakdown */}
                <div className="card flex flex-col gap-4">
                    <div className="text-sm font-semibold uppercase tracking-wider text-muted">Breakdown</div>
                    <div className="flex flex-wrap gap-6 items-center">
                        <div className="flex items-center gap-2">
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--success)' }} />
                            <span className="font-medium">{stats.answered} Correct</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--warning)' }} />
                            <span className="font-medium">{stats.improvement} Need Improvement</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--danger)' }} />
                            <span className="font-medium">{stats.wrong} Pending (Wrong)</span>
                        </div>
                    </div>

                    {/* Visual Bar */}
                    <div style={{ height: '8px', width: '100%', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
                        <div style={{ width: `${(stats.answered / stats.total) * 100}%`, background: 'var(--success)' }} />
                        <div style={{ width: `${(stats.improvement / stats.total) * 100}%`, background: 'var(--warning)' }} />
                        <div style={{ width: `${(stats.wrong / stats.total) * 100}%`, background: 'var(--danger)' }} />
                    </div>
                </div>

                {/* Feedback */}
                <div className="card flex flex-col gap-4">
                    <label className="font-medium flex items-center gap-2">
                        Reviewer Feedback
                    </label>
                    <textarea
                        className="input"
                        rows="6"
                        placeholder="Provide detailed observations about the candidate..."
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        disabled={isSubmitted}
                        style={{ resize: 'vertical' }}
                    />
                </div>

                {!isSubmitted && (
                    <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        className="btn btn-primary w-full"
                        disabled={isSubmitting}
                        style={{ padding: '1rem', fontSize: '1rem' }}
                    >
                        {isSubmitting ? 'Submitting...' : 'Finish & Submit Assessment'}
                        <ChevronRight size={18} />
                    </motion.button>
                )}
            </div>
        </div>
    );
};

export default ReviewReport;
