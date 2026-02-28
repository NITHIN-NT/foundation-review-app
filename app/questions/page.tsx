"use client";
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Database,
    Loader2,
    X,
    User as UserIcon,
    BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';

interface Question {
    id: number;
    text: string;
    module_id: number;
    answer: string | null;
    userId: string | null;
}

export default function QuestionPoolPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedModule, setSelectedModule] = useState<number | 'all'>('all');
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        text: '',
        moduleId: 1,
        answer: ''
    });

    const getHeaders = React.useCallback(async (): Promise<HeadersInit> => {
        return {
            'Content-Type': 'application/json'
        };
    }, []);

    const fetchQuestions = React.useCallback(async (silent = false) => {
        if (!silent) setIsLoading(true);
        try {
            const headers = await getHeaders();
            const res = await fetch('/api/questions', { headers });

            const contentType = res.headers.get('content-type');
            if (!res.ok) {
                const errorData = contentType?.includes('application/json') ? await res.json() : null;
                throw new Error(errorData?.details || errorData?.error || `Server Error (${res.status})`);
            }

            const data = await res.json();
            setQuestions(data);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Check your database handshake';
            toast.error('Repository Error', {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    }, [getHeaders]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            fetchQuestions();
        }
    }, [user, authLoading, router, fetchQuestions]);

    const handleSync = async () => {
        const confirmSync = window.confirm("This will import initial questions from the system pool. Continue?");
        if (!confirmSync) return;

        toast.loading('Synchronizing pool...');
        try {
            const headers = await getHeaders();
            const res = await fetch('/api/questions/sync', {
                method: 'POST',
                headers
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                fetchQuestions();
            } else {
                toast.error(data.error || 'Sync failed');
            }
        } catch {
            toast.error('Sync failed');
        } finally {
            toast.dismiss();
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this question permanently?')) return;

        try {
            const headers = await getHeaders();
            const res = await fetch(`/api/questions/${id}`, {
                method: 'DELETE',
                headers
            });
            if (res.ok) {
                setQuestions((prev: Question[]) => prev.filter((q: Question) => q.id !== id));
                toast.success('Question removed');
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to delete');
            }
        } catch {
            toast.error('Connection error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const endpoint = isEditing ? `/api/questions/${isEditing}` : '/api/questions';
        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const headers = await getHeaders();
            const res = await fetch(endpoint, {
                method,
                headers,
                body: JSON.stringify({
                    text: formData.text,
                    module_id: Number(formData.moduleId),
                    answer: formData.answer || null
                })
            });
            const data = await res.json();

            if (res.ok) {
                toast.success(isEditing ? 'Question updated' : 'Question added');
                fetchQuestions();
                closeForm();
            } else {
                toast.error(data.error || 'Operation failed');
            }
        } catch {
            toast.error('Connection error');
        } finally {
            setIsSubmitting(false);
        }
    };


    const openEdit = (question: Question) => {
        setIsEditing(question.id);
        setFormData({
            text: question.text,
            moduleId: question.module_id,
            answer: question.answer || ''
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setIsEditing(null);
        setFormData({ text: '', moduleId: 1, answer: '' });
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.answer?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
        const matchesModule = selectedModule === 'all' || q.module_id === Number(selectedModule);
        return matchesSearch && matchesModule;
    });

    const modules = [1, 2, 3, 4, 5, 6];

    if (authLoading || (!user && isLoading)) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Page Header Matrix */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-indigo-950 p-6 md:p-12 text-white shadow-2xl"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6 flex-wrap">
                        <span className="badge bg-white/20 text-white border-none px-4 py-2">Repository Active</span>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 backdrop-blur-md">
                            <UserIcon size={12} />
                            {user?.email}
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-2">Question Bank</h1>
                            <p className="text-white/60 text-base md:text-lg font-medium">Manage and organize your assessment questions here.</p>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <button
                                onClick={handleSync}
                                className="btn bg-white/10 hover:bg-white/20 border-white/10 text-white h-12 md:h-14 px-4 md:px-8 text-sm md:text-base backdrop-blur-md flex-1 md:flex-none"
                            >
                                <Database size={18} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowForm(true)}
                                className="btn btn-primary h-12 md:h-14 px-4 md:px-8 text-sm md:text-base shadow-xl flex-1 md:flex-none"
                            >
                                <Plus size={18} />
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>

                {/* Background Decor */}
                <div className="absolute -right-24 -bottom-24 w-64 md:w-80 h-64 md:h-80 bg-primary/30 rounded-full blur-[80px]" />
                <BookOpen className="absolute right-6 md:right-12 top-6 md:top-12 text-white/5 w-32 md:w-48 h-32 md:h-48 rotate-12" />
            </motion.div>

            {/* Filter Hub */}
            <div className="sticky top-4 z-30 p-2 glass rounded-2xl md:rounded-3xl border border-border-base shadow-xl mx-auto max-w-5xl flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors" size={20} />
                    <input
                        type="text"
                        placeholder="Search all questions..."
                        className="w-full h-12 md:h-14 pl-14 pr-6 bg-transparent text-sm font-bold text-text-primary outline-none placeholder:text-text-tertiary"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-1.5 p-1 bg-bg-subtle rounded-xl md:rounded-2xl w-full md:w-auto overflow-x-auto scrollbar-hide no-scrollbar">
                    <button
                        onClick={() => setSelectedModule('all')}
                        className={cn(
                            "px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            selectedModule === 'all'
                                ? "bg-bg-white text-primary shadow-sm"
                                : "text-text-tertiary hover:text-text-primary"
                        )}
                    >
                        Show All
                    </button>
                    {modules.map(m => (
                        <button
                            key={m}
                            onClick={() => setSelectedModule(m)}
                            className={cn(
                                "px-4 md:px-6 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                selectedModule === m
                                    ? "bg-bg-white text-primary shadow-sm"
                                    : "text-text-tertiary hover:text-text-primary"
                            )}
                        >
                            Mod {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isLoading ? (
                    [1, 2, 3, 4].map(i => <div key={i} className="h-64 bento-card animate-pulse" />)
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredQuestions.map((q: Question, i: number) => (
                            <motion.div
                                key={q.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: i * 0.02 }}
                                className="bento-card group p-0 overflow-hidden border-border-base hover:border-primary/50"
                            >
                                <div className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-2 items-center">
                                            <span className="badge bg-primary/10 text-primary border-none text-[8px] px-3">Module {q.module_id}</span>
                                            {q.userId === user?.uid && (
                                                <span className="badge bg-green-500/10 text-green-500 border-none text-[8px] px-3">My Question</span>
                                            )}
                                        </div>
                                        {q.userId === user?.uid && (
                                            <div className="flex gap-2">
                                                <button onClick={() => openEdit(q)} className="btn-icon">
                                                    <Edit size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(q.id)} className="btn-icon hover:text-red-500 hover:bg-red-50">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-black text-xl text-text-primary leading-tight tracking-tight mb-6">{q.text}</h3>
                                </div>

                                <div className="px-8 pb-8 space-y-4">
                                    {q.answer && (
                                        <div className="p-6 bg-bg-subtle rounded-2xl text-sm font-medium text-text-secondary leading-relaxed border border-border-subtle group-hover:bg-bg-white group-hover:border-primary/20 transition-all duration-500 italic">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary block mb-3 not-italic">Ideal Answer</span>
                                            &quot;{q.answer}&quot;
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between pt-4 border-t border-border-subtle opacity-40 group-hover:opacity-100 transition-opacity">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">Question #{q.id}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">{q.userId ? 'USER_DEF' : 'SYS_CORE'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>

            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/90 backdrop-blur-xl" onClick={closeForm}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-10 bg-bg-subtle border-b border-border-base flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-black text-text-primary tracking-tight">{isEditing ? 'Edit Question' : 'Add Question'}</h3>
                                    <p className="text-text-secondary text-sm font-medium mt-1">Set the question and guidance for this module.</p>
                                </div>
                                <button onClick={closeForm} className="btn-icon rounded-2xl w-12 h-12">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-10 max-h-[70vh] overflow-y-auto scrollbar-hide">
                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Assessment Module</label>
                                        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                            {modules.map(m => (
                                                <button
                                                    key={m}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, moduleId: m })}
                                                    className={cn(
                                                        "h-12 rounded-xl text-xs font-black uppercase transition-all",
                                                        formData.moduleId === m
                                                            ? "bg-primary text-white shadow-lg shadow-primary/20"
                                                            : "bg-bg-subtle text-text-tertiary hover:bg-bg-white hover:border-border-base border-2 border-transparent"
                                                    )}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Question Text</label>
                                        <textarea
                                            className="input-field h-32 py-5 resize-none text-base font-medium leading-relaxed"
                                            placeholder="What is the core question or task student needs to address?"
                                            value={formData.text}
                                            onChange={e => setFormData({ ...formData, text: e.target.value })}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Answer Guidance</label>
                                        <textarea
                                            className="input-field h-40 py-5 resize-none text-base font-medium leading-relaxed"
                                            placeholder="Provide the ideal performance metrics or answers..."
                                            value={formData.answer}
                                            onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={closeForm}
                                            className="btn btn-secondary flex-1 h-14 text-base"
                                        >
                                            Discard
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn btn-primary flex-[2] h-14 text-base shadow-xl"
                                        >
                                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (isEditing ? 'Update Question' : 'Save Question')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
