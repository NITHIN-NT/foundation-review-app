"use client";

import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Filter,
    BookOpen,
    Database,
    Loader2,
    ChevronDown,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Question {
    id: number;
    text: string;
    module_id: number;
    answer: string | null;
}

export default function QuestionPoolPage() {
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

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/questions');
            const data = await res.json();
            if (res.ok) {
                setQuestions(data);
            } else {
                toast.error(data.error || 'Failed to fetch questions');
            }
        } catch (error) {
            toast.error('Connection error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSync = async () => {
        const confirmSync = window.confirm("This will import initial questions from the system pool. Continue?");
        if (!confirmSync) return;

        toast.loading('Synchronizing pool...');
        try {
            const res = await fetch('/api/questions/sync', { method: 'POST' });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                fetchQuestions();
            } else {
                toast.error(data.error || 'Sync failed');
            }
        } catch (error) {
            toast.error('Sync failed');
        } finally {
            toast.dismiss();
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Delete this question permanently?')) return;

        try {
            const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setQuestions(prev => prev.filter(q => q.id !== id));
                toast.success('Question removed');
            } else {
                toast.error('Failed to delete');
            }
        } catch (error) {
            toast.error('Connection error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const endpoint = isEditing ? `/api/questions/${isEditing}` : '/api/questions';
        const method = isEditing ? 'PATCH' : 'POST';

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
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
        } catch (error) {
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

    return (
        <div className="space-y-8 min-h-screen">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-text-primary">Question Pool</h1>
                    <p className="text-text-secondary mt-1">Manage theoretical assessment matrix.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSync}
                        className="btn btn-secondary"
                    >
                        <Database size={18} />
                        Sync Pool
                    </button>
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn btn-primary"
                    >
                        <Plus size={18} />
                        Add Question
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-bg-white p-4 rounded-2xl border border-border-base shadow-sm">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
                    <input
                        type="text"
                        placeholder="Search questions or answers..."
                        className="input-field pl-12 h-11"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                    <button
                        onClick={() => setSelectedModule('all')}
                        className={cn(
                            "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                            selectedModule === 'all'
                                ? "bg-primary text-white shadow-lg shadow-primary/20"
                                : "bg-bg-subtle text-text-tertiary hover:text-text-primary border border-transparent hover:border-border-base"
                        )}
                    >
                        All Modules
                    </button>
                    {modules.map(m => (
                        <button
                            key={m}
                            onClick={() => setSelectedModule(m)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                selectedModule === m
                                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-bg-subtle text-text-tertiary hover:text-text-primary border border-transparent hover:border-border-base"
                            )}
                        >
                            Module {m}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-bg-subtle rounded-3xl"></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <AnimatePresence mode="popLayout">
                        {filteredQuestions.map((q) => (
                            <motion.div
                                key={q.id}
                                layout
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="bento-card group flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-3 py-1 bg-primary-subtle text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                                            Module {q.module_id}
                                        </span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEdit(q)}
                                                className="p-2 hover:bg-bg-subtle rounded-lg text-text-tertiary hover:text-primary transition-colors"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(q.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg text-text-tertiary hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg text-text-primary leading-snug">{q.text}</h3>
                                    {q.answer && (
                                        <div className="mt-4 p-4 bg-bg-subtle rounded-xl text-sm text-text-secondary leading-relaxed border border-border-subtle">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary block mb-2">Ideal Response</span>
                                            {q.answer}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 flex items-center justify-between text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                                    <span>ID: #{q.id}</span>
                                    <span>Ref: FOUN-MATRIX-Q{q.id}</span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredQuestions.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center text-text-tertiary opacity-50">
                    <Database size={48} className="mb-4" />
                    <p className="font-medium">No questions found in this index.</p>
                    <button onClick={handleSync} className="mt-4 text-xs font-black uppercase tracking-widest hover:text-primary transition-colors">
                        Try Syncing pool?
                    </button>
                </div>
            )}

            {/* Question Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md" onClick={closeForm}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-bg-white rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-white/20"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 bg-bg-subtle border-b border-border-base flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-text-primary">{isEditing ? 'Edit Question' : 'Add New Question'}</h3>
                                    <p className="text-text-secondary text-sm mt-1">Matrix definitions for foundational module.</p>
                                </div>
                                <button onClick={closeForm} className="btn-icon">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8 scrollbar-hide max-h-[70vh] overflow-y-auto">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Module</label>
                                        <select
                                            className="input-field appearance-none"
                                            value={formData.moduleId}
                                            onChange={e => setFormData({ ...formData, moduleId: Number(e.target.value) })}
                                            disabled={isSubmitting}
                                        >
                                            {modules.map(m => <option key={m} value={m}>Module {m} - Matrix Pool</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Question Text</label>
                                        <textarea
                                            className="input-field h-32 py-4 resize-none"
                                            placeholder="Enter the core question..."
                                            value={formData.text}
                                            onChange={e => setFormData({ ...formData, text: e.target.value })}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Expected Answer / Guidance</label>
                                        <textarea
                                            className="input-field h-40 py-4 resize-none"
                                            placeholder="Provide the ideal response for grading..."
                                            value={formData.answer}
                                            onChange={e => setFormData({ ...formData, answer: e.target.value })}
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button
                                            type="button"
                                            onClick={closeForm}
                                            className="btn btn-secondary flex-1 h-14 font-black"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="btn btn-primary flex-1 h-14 text-base font-black shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (isEditing ? 'Save Changes' : 'Publish Question')}
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
