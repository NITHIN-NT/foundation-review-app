import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { Check, X, AlertTriangle, ChevronLeft, ChevronRight, Send, Eye, EyeOff, Plus, Pause, Play, AlertCircle } from 'lucide-react';

// Constants
const M4_CATEGORIES = [
    "Object-oriented programming (OOP) theory",
    "Object-oriented programming (OOP) practical",
    "Basic C Programming practical",
    "Logical Programming Pattern",
    "Logical Programming Array",
    "Basic C Programming theory"
];

const DEFAULT_CATEGORIES = ["Theory", "Practical"];
const SCORE_UPDATE_DEBOUNCE_MS = 500;

const ReviewSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State management
    const [session, setSession] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [newQuestionText, setNewQuestionText] = useState('');
    const [newQuestionAnswer, setNewQuestionAnswer] = useState('');
    const [scorecard, setScorecard] = useState({});
    const [isScorecardOpen, setIsScorecardOpen] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerPaused, setIsTimerPaused] = useState(false);

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isMarkingQuestion, setIsMarkingQuestion] = useState(false);
    const [isAddingQuestion, setIsAddingQuestion] = useState(false);

    // Refs for debouncing
    const scoreUpdateTimeoutRef = useRef(null);

    /**
     * Clears timer data from localStorage
     * Called when session is completed or user navigates away
     */
    const clearTimerData = useCallback(() => {
        localStorage.removeItem(`review_${id}_start_time`);
        localStorage.removeItem(`review_${id}_paused_time`);
        localStorage.removeItem(`review_${id}_is_paused`);
    }, [id]);

    /**
     * Fetches session and question data from API
     */
    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const sessionRes = await api.get(`core/reviews/${id}/`);
            setSession(sessionRes.data);

            if (sessionRes.data.module) {
                const moduleRes = await api.get(`core/modules/${sessionRes.data.module}/`);
                setQuestions(moduleRes.data.questions || []);
            }
        } catch (err) {
            setError('Failed to load review session. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    // Initialize session data and timer
    useEffect(() => {
        fetchData();

        const storedStartTime = localStorage.getItem(`review_${id}_start_time`);
        const storedPausedTime = localStorage.getItem(`review_${id}_paused_time`);
        const storedPausedState = localStorage.getItem(`review_${id}_is_paused`);

        if (storedStartTime) {
            if (storedPausedState === 'true' && storedPausedTime) {
                setElapsedTime(parseInt(storedPausedTime, 10));
                setIsTimerPaused(true);
            } else {
                const startTime = parseInt(storedStartTime, 10);
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000);
                setElapsedTime(elapsed);
            }
        } else {
            localStorage.setItem(`review_${id}_start_time`, Date.now().toString());
        }

        // Cleanup timer data on unmount
        return () => {
            if (scoreUpdateTimeoutRef.current) {
                clearTimeout(scoreUpdateTimeoutRef.current);
            }
        };
    }, [id, fetchData]);

    // Sync scorecard from session data
    useEffect(() => {
        if (session?.scorecard_data) {
            setScorecard(session.scorecard_data);
        }
    }, [session]);

    // Calculate stats
    const stats = session ? {
        answered: session.responses.filter(r => r.status === 'ANSWERED').length,
        total: questions.length
    } : { answered: 0, total: 0 };

    const theoryScore = stats.total > 0 ? ((stats.answered / stats.total) * 10).toFixed(1) : 0;
    const isM4 = session?.module_name === 'M4';
    const categories = isM4 ? M4_CATEGORIES : DEFAULT_CATEGORIES;

    // Auto-update theory score for non-M4 modules
    useEffect(() => {
        if (!isM4 && session && scorecard["Theory"] !== theoryScore) {
            updateScore("Theory", theoryScore);
        }
    }, [theoryScore, isM4, session]);

    // Timer management
    useEffect(() => {
        if (isTimerPaused) {
            localStorage.setItem(`review_${id}_paused_time`, elapsedTime.toString());
            localStorage.setItem(`review_${id}_is_paused`, 'true');
            return;
        }

        localStorage.setItem(`review_${id}_is_paused`, 'false');

        const interval = setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [isTimerPaused, id, elapsedTime]);

    /**
     * Formats seconds into MM:SS format
     */
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    /**
     * Marks a question with the given status
     */
    const handleMark = async (status) => {
        if (isMarkingQuestion) return;

        const question = questions[currentIndex];
        setIsMarkingQuestion(true);
        setError(null);

        try {
            await api.post('core/mark-response/', {
                session_id: session.id,
                question_id: question.id,
                status
            });

            // Auto advance to next question if marked as correct or skipped
            if (currentIndex < questions.length - 1 && (status === 'ANSWERED' || status === 'SKIPPED')) {
                setCurrentIndex(prev => prev + 1);
                setShowAnswer(false);
            }

            await fetchData();
        } catch (err) {
            setError('Failed to mark question. Please try again.');
        } finally {
            setIsMarkingQuestion(false);
        }
    };

    /**
     * Adds a custom question to the module
     */
    const handleAddCustomQuestion = async (e) => {
        e.preventDefault();
        if (isAddingQuestion) return;

        setIsAddingQuestion(true);
        setError(null);

        try {
            await api.post('core/questions/', {
                module: session.module,
                text: newQuestionText,
                answer: newQuestionAnswer || null
            });

            setNewQuestionText('');
            setNewQuestionAnswer('');
            setShowAddQuestion(false);
            await fetchData();
        } catch (err) {
            setError('Failed to add question. Please try again.');
        } finally {
            setIsAddingQuestion(false);
        }
    };

    /**
     * Updates scorecard with debouncing to prevent excessive API calls
     */
    const updateScore = useCallback(async (category, value) => {
        const newScorecard = { ...scorecard, [category]: value };
        setScorecard(newScorecard);

        // Clear existing timeout
        if (scoreUpdateTimeoutRef.current) {
            clearTimeout(scoreUpdateTimeoutRef.current);
        }

        // Debounce API call
        scoreUpdateTimeoutRef.current = setTimeout(async () => {
            try {
                await api.patch(`core/reviews/${id}/`, { scorecard_data: newScorecard });
            } catch (err) {
                setError('Failed to save score. Please try again.');
            }
        }, SCORE_UPDATE_DEBOUNCE_MS);
    }, [scorecard, id]);

    /**
     * Handles session completion and cleanup
     */
    const handleFinish = () => {
        clearTimerData();
        navigate(`/report/${id}`);
    };

    /**
     * Gets the status of a question by ID
     */
    const getStatus = (qId) => session?.responses?.find(r => r.question === qId)?.status;

    /**
     * Navigation handlers
     */
    const goNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setShowAnswer(false);
        }
    };

    const goPrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setShowAnswer(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="text-center text-muted" style={{ padding: '4rem' }}>
                Loading review session...
            </div>
        );
    }

    // Error state
    if (!session && error) {
        return (
            <div className="text-center" style={{ padding: '4rem' }}>
                <AlertCircle size={48} style={{ color: 'var(--danger)', margin: '0 auto 1rem' }} />
                <p style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</p>
                <button onClick={fetchData} className="btn btn-primary">
                    Retry
                </button>
            </div>
        );
    }

    const studentName = session.student_name || session.student_display_name || 'Student';
    const currentQuestion = questions[currentIndex];
    const currentStatus = currentQuestion ? getStatus(currentQuestion.id) : null;
    const answeredCount = session.responses?.length || 0;
    const isAllMarked = session?.responses?.length === questions.length && questions.length > 0;


    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Error Banner */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed',
                            top: '80px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 3000,
                            background: 'var(--danger)',
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            maxWidth: '500px'
                        }}
                    >
                        <AlertCircle size={20} />
                        <span>{error}</span>
                        <button
                            onClick={() => setError(null)}
                            style={{
                                background: 'none',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                marginLeft: 'auto',
                                fontSize: '1.25rem',
                                padding: '0 0.25rem'
                            }}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Universal Scorecard Sidebar */}
            {session && (
                <motion.div
                    initial={false}
                    animate={{ width: isScorecardOpen ? '280px' : '40px' }}
                    style={{
                        position: 'fixed',
                        right: '0',
                        top: '100px',
                        background: 'white',
                        boxShadow: '-4px 0 20px rgba(0,0,0,0.08)',
                        zIndex: 1000,
                        height: 'fit-content',
                        maxHeight: 'calc(100vh - 120px)',
                        borderRadius: '12px 0 0 12px',
                        overflow: 'hidden',
                        display: 'flex',
                        border: '1px solid var(--gray-200)'
                    }}
                    role="complementary"
                    aria-label="Scorecard"
                >
                    {/* Toggle Bar */}
                    <div
                        onClick={() => setIsScorecardOpen(!isScorecardOpen)}
                        style={{
                            width: '40px',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '1rem 0',
                            cursor: 'pointer',
                            background: isScorecardOpen ? 'var(--gray-50)' : 'white'
                        }}
                        role="button"
                        tabIndex={0}
                        aria-label={isScorecardOpen ? 'Close scorecard' : 'Open scorecard'}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                setIsScorecardOpen(!isScorecardOpen);
                            }
                        }}
                    >
                        {isScorecardOpen ? <ChevronRight size={18} /> :
                            <div style={{
                                writingMode: 'vertical-rl',
                                transform: 'rotate(180deg)',
                                fontWeight: 700,
                                letterSpacing: '1px',
                                textTransform: 'uppercase',
                                fontSize: '0.65rem',
                                color: 'var(--gray-500)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}>
                                <ChevronLeft size={14} /> Scorecard
                            </div>}
                    </div>

                    {/* Content */}
                    <AnimatePresence>
                        {isScorecardOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}
                            >
                                <h3 style={{ fontSize: '0.875rem', marginBottom: '1rem', fontWeight: 700 }}>Assessment</h3>
                                <div className="flex flex-col gap-3">
                                    {categories.map((cat, idx) => {
                                        const isAutoTheory = !isM4 && cat === "Theory";
                                        return (
                                            <div key={cat} style={{ background: 'var(--gray-50)', padding: '0.75rem', borderRadius: '10px', border: '1px solid var(--gray-100)' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                                    {isM4 ? `${idx + 1}. ` : ""}{cat}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="10"
                                                        step="0.5"
                                                        placeholder="Mark"
                                                        value={scorecard[cat] || ''}
                                                        disabled={isAutoTheory}
                                                        onChange={(e) => updateScore(cat, e.target.value)}
                                                        style={{
                                                            width: '80px',
                                                            height: '32px',
                                                            padding: '0 0.5rem',
                                                            borderRadius: '6px',
                                                            border: '1px solid var(--gray-300)',
                                                            fontSize: '0.875rem',
                                                            background: isAutoTheory ? 'var(--gray-100)' : 'white'
                                                        }}
                                                        aria-label={`Score for ${cat}`}
                                                    />
                                                    <span className="text-muted text-xs font-bold">/ 10</span>
                                                </div>
                                                {isAutoTheory && <p className="text-xs text-muted" style={{ marginTop: '0.25rem' }}>Auto-calculated</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            <div className="flex flex-col gap-6" style={{ maxWidth: '700px', margin: '0 auto' }}>
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-xs uppercase text-muted font-medium">
                            {session.module_name || 'Foundation'} • {session.batch || 'Review'}
                        </span>
                        <h1>{studentName}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Timer */}
                        <div className="flex items-center gap-2" style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--gray-100)',
                            borderRadius: '8px'
                        }}>
                            <button
                                onClick={() => setIsTimerPaused(!isTimerPaused)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    color: 'var(--text)',
                                    padding: 0
                                }}
                                title={isTimerPaused ? 'Resume timer' : 'Pause timer'}
                                aria-label={isTimerPaused ? 'Resume timer' : 'Pause timer'}
                            >
                                {isTimerPaused ? <Play size={16} /> : <Pause size={16} />}
                            </button>
                            <div style={{
                                fontFamily: 'monospace',
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: 'var(--text)',
                                letterSpacing: '0.05em'
                            }}
                                aria-live="polite"
                                aria-label={`Elapsed time: ${formatTime(elapsedTime)}`}
                            >
                                {formatTime(elapsedTime)}
                            </div>
                        </div>
                        <motion.button
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowAddQuestion(true)}
                            className="btn btn-secondary"
                            title="Add question during review"
                            aria-label="Add new question"
                        >
                            <Plus size={16} />
                            Add Question
                        </motion.button>
                        {isAllMarked && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleFinish}
                                className="btn btn-primary"
                                aria-label="Finish review session"
                            >
                                Finish
                                <Send size={16} />
                            </motion.button>
                        )}
                    </div>
                </div>


                {/* Progress Bar */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm text-muted">
                        <span>Question {currentIndex + 1} of {questions.length}</span>
                        <span>{answeredCount} answered</span>
                    </div>
                    <div style={{
                        height: '4px',
                        background: 'var(--gray-200)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                            style={{ height: '100%', background: 'var(--text)' }}
                        />
                    </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    {currentQuestion ? (
                        <motion.div
                            key={currentQuestion.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="card"
                            style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}
                        >
                            {/* Question Number & Status */}
                            <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                                <span className="text-muted font-bold" style={{ fontSize: '0.875rem' }}>
                                    Q{currentIndex + 1}
                                </span>
                                {currentStatus && (
                                    <span className={`badge ${currentStatus === 'ANSWERED' ? 'badge-success' :
                                        currentStatus === 'NOT_ANSWERED' ? 'badge-danger' :
                                            currentStatus === 'SKIPPED' ? 'badge-secondary' : 'badge-warning'
                                        }`}>
                                        {currentStatus === 'ANSWERED' ? 'Correct' :
                                            currentStatus === 'NOT_ANSWERED' ? 'Wrong' :
                                                currentStatus === 'SKIPPED' ? 'Skipped' : 'Review'}
                                    </span>
                                )}
                            </div>

                            {/* Question Text */}
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <p style={{
                                    fontSize: '1.25rem',
                                    fontWeight: 500,
                                    textAlign: 'center',
                                    lineHeight: 1.6
                                }}>
                                    {currentQuestion.text}
                                </p>
                            </div>

                            {/* Answer Section */}
                            <div style={{ marginTop: 'auto' }}>
                                {currentQuestion.answer && (
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        {!showAnswer ? (
                                            <button
                                                onClick={() => setShowAnswer(true)}
                                                className="btn btn-ghost w-full"
                                                style={{
                                                    border: '1px dashed var(--gray-300)',
                                                    color: 'var(--gray-500)',
                                                    fontSize: '0.875rem'
                                                }}
                                            >
                                                <Eye size={16} /> Show Suggested Answer
                                            </button>
                                        ) : (
                                            <div style={{
                                                padding: '1rem',
                                                background: 'var(--gray-50)',
                                                borderRadius: '8px',
                                                borderLeft: '4px solid var(--success)',
                                                fontSize: '0.95rem',
                                                color: 'var(--gray-700)',
                                                position: 'relative'
                                            }}>
                                                <button
                                                    onClick={() => setShowAnswer(false)}
                                                    style={{ position: 'absolute', right: '0.5rem', top: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}
                                                >
                                                    <EyeOff size={14} />
                                                </button>
                                                <strong style={{ color: 'var(--success)', display: 'block', marginBottom: '0.25rem', fontSize: '0.75rem', textTransform: 'uppercase' }}>Suggested Answer</strong>
                                                {currentQuestion.answer}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="flex flex-col gap-3">
                                    <div className="flex flex-wrap gap-3" style={{ justifyContent: 'center' }}>
                                        <button
                                            onClick={() => handleMark('ANSWERED')}
                                            className={`btn flex-1 ${currentStatus === 'ANSWERED' ? 'btn-success' : 'btn-secondary'}`}
                                            style={{ padding: '1rem', minWidth: '120px', maxWidth: '160px' }}
                                        >
                                            <Check size={18} /> Correct
                                        </button>
                                        <button
                                            onClick={() => handleMark('IMPROVEMENT')}
                                            className={`btn flex-1 ${currentStatus === 'IMPROVEMENT' ? 'btn-warning' : 'btn-secondary'}`}
                                            style={{ padding: '1rem', minWidth: '120px', maxWidth: '160px' }}
                                        >
                                            <AlertTriangle size={18} /> Review
                                        </button>
                                        <button
                                            onClick={() => handleMark('NOT_ANSWERED')}
                                            className={`btn flex-1 ${currentStatus === 'NOT_ANSWERED' ? 'btn-danger' : 'btn-secondary'}`}
                                            style={{ padding: '1rem', minWidth: '120px', maxWidth: '160px' }}
                                        >
                                            <X size={18} /> Wrong
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="card text-center text-muted" style={{ padding: '4rem' }}>
                            No questions in this module.
                        </div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={goPrev}
                        disabled={currentIndex === 0}
                        className="btn btn-secondary"
                    >
                        <ChevronLeft size={18} /> Previous
                    </button>

                    {/* Question Dots */}
                    <div className="flex gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center', maxWidth: '300px' }}>
                        {questions.map((q, idx) => {
                            const status = getStatus(q.id);
                            return (
                                <button
                                    key={q.id}
                                    onClick={() => { setCurrentIndex(idx); setShowAnswer(false); }}
                                    style={{
                                        width: '10px',
                                        height: '10px',
                                        borderRadius: '50%',
                                        border: idx === currentIndex ? '2px solid var(--text)' : 'none',
                                        background: status === 'ANSWERED' ? 'var(--success)' :
                                            status === 'NOT_ANSWERED' ? 'var(--danger)' :
                                                status === 'IMPROVEMENT' ? 'var(--warning)' :
                                                    status === 'SKIPPED' ? 'var(--gray-500)' :
                                                        'var(--gray-300)',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}
                                />
                            );
                        })}
                    </div>

                    <button
                        onClick={goNext}
                        disabled={currentIndex === questions.length - 1}
                        className="btn btn-secondary"
                    >
                        Next <ChevronRight size={18} />
                    </button>
                </div>


                {/* Add Question Modal */}
                <AnimatePresence>
                    {showAddQuestion && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(0,0,0,0.2)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 2000,
                                padding: '2rem'
                            }}
                            onClick={() => !isAddingQuestion && setShowAddQuestion(false)}
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="add-question-title"
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                onKeyDown={(e) => {
                                    if (e.key === 'Escape' && !isAddingQuestion) {
                                        setShowAddQuestion(false);
                                    }
                                }}
                                style={{
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                                    borderRadius: '16px',
                                    padding: '2rem',
                                    width: '100%',
                                    maxWidth: '500px',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                                    color: 'var(--gray-900)'
                                }}
                            >
                                <h2 id="add-question-title" style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>Add New Question</h2>
                                <form onSubmit={handleAddCustomQuestion}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label
                                            htmlFor="question-text"
                                            style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}
                                        >
                                            Question Text *
                                        </label>
                                        <textarea
                                            id="question-text"
                                            autoFocus
                                            placeholder="Enter question text..."
                                            value={newQuestionText}
                                            onChange={(e) => setNewQuestionText(e.target.value)}
                                            required
                                            disabled={isAddingQuestion}
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: '10px',
                                                border: '1px solid var(--gray-300)',
                                                minHeight: '100px',
                                                fontSize: '1rem',
                                                fontFamily: 'inherit',
                                                resize: 'vertical',
                                                opacity: isAddingQuestion ? 0.6 : 1
                                            }}
                                            aria-required="true"
                                        />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label
                                            htmlFor="question-answer"
                                            style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--gray-700)' }}
                                        >
                                            Suggested Answer (Optional)
                                        </label>
                                        <textarea
                                            id="question-answer"
                                            placeholder="Enter suggested answer..."
                                            value={newQuestionAnswer}
                                            onChange={(e) => setNewQuestionAnswer(e.target.value)}
                                            disabled={isAddingQuestion}
                                            style={{
                                                width: '100%',
                                                padding: '1rem',
                                                borderRadius: '10px',
                                                border: '1px solid var(--gray-300)',
                                                minHeight: '80px',
                                                fontSize: '1rem',
                                                fontFamily: 'inherit',
                                                resize: 'vertical',
                                                opacity: isAddingQuestion ? 0.6 : 1
                                            }}
                                        />
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddQuestion(false)}
                                            className="btn btn-secondary flex-1"
                                            disabled={isAddingQuestion}
                                            style={{ opacity: isAddingQuestion ? 0.6 : 1 }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary flex-1"
                                            disabled={isAddingQuestion}
                                            style={{
                                                opacity: isAddingQuestion ? 0.8 : 1,
                                                cursor: isAddingQuestion ? 'wait' : 'pointer'
                                            }}
                                        >
                                            {isAddingQuestion ? 'Adding...' : 'Add & Sync'}
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ReviewSession;

