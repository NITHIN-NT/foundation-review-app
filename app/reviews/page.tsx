"use client";

import React, { useState, useEffect } from 'react';
import {
    Search,
    ArrowRight,
    MoreVertical,
    Loader2,
    Edit,
    Trash2,
    ExternalLink,
    Filter,
    X,
    AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fetchReviews, deleteReview, updateReview } from '@/lib/api';
import type { ScheduledReview } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { useAssessment } from '@/components/AssessmentSessionProvider';

export default function ReviewsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [reviews, setReviews] = useState<ScheduledReview[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [activeMenu, setActiveMenu] = useState<string | number | null>(null);
    const [selectedModule, setSelectedModule] = useState<string>('all');
    const [isEditing, setIsEditing] = useState<string | number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<ScheduledReview | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState({
        studentName: '',
        module: 'Module 1',
        batch: '',
    });

    const { startAssessment } = useAssessment();


    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        } else if (user) {
            loadReviews();
        }
    }, [user, authLoading, router]);

    async function loadReviews(silent = false) {
        if (!silent) setIsLoading(true);
        try {
            const data = await fetchReviews();
            setReviews(data);
        } catch (error) {
            console.error('Failed to load reviews:', error);
            const errorMessage = error instanceof Error ? error.message : 'Connection failed';
            toast.error('Sync Failed', {
                description: errorMessage
            });
        } finally {
            setIsLoading(false);
        }
    }

    const handleUpdateReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isEditing) return;
        setIsSubmitting(true);

        const reviewData: import('@/types').UpdateReviewRequest = {
            student_name: formData.studentName,
            batch: formData.batch,
            module: formData.module,
        };

        try {
            const updated = await updateReview(isEditing, reviewData);
            setReviews(prev => prev.map(r => r.id === isEditing ? updated : r));
            toast.success('Assessment updated successfully');
            setShowForm(false);
            setIsEditing(null);
            setFormData({ studentName: '', batch: '', module: 'Module 1' });
        } catch (error) {
            console.error('Failed to update assessment:', error);
            const errorMessage = error instanceof Error ? error.message : 'Validation failed';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteReview(deleteTarget.id);
            setReviews(prev => prev.filter(r => r.id !== deleteTarget.id));
            toast.success('Assessment deleted successfully');
            setDeleteTarget(null);
        } catch (error) {
            console.error('Failed to delete assessment:', error);
            toast.error('Deletion failed');
        } finally {
            setIsDeleting(false);
        }
    };

    const openEditModal = (review: ScheduledReview) => {
        setIsEditing(review.id);
        setFormData({
            studentName: review.studentName || '',
            module: review.module || 'Module 1',
            batch: review.batch || '',
        });
        setShowForm(true);
        setActiveMenu(null);
    };

    const filteredReviews = reviews.filter(r => {
        const matchesSearch =
            r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.batch?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesModule = selectedModule === 'all' || r.module === selectedModule;
        return matchesSearch && matchesModule;
    });

    const startReview = (review: ScheduledReview) => {
        startAssessment(review);
    };

    if (isLoading && reviews.length === 0) {
        return (
            <div className="h-[80vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    return (
        <div className="space-y-12 pb-20">
            {/* Page Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-slate-900 p-8 md:p-12 text-white shadow-2xl"
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                        <span className="badge bg-primary text-white border-none px-4 py-2">Master Index</span>
                        <span className="text-white/40 text-[10px] font-black tracking-widest uppercase">Database status: Online</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-4">Assessment Registry</h1>
                    <p className="text-white/60 text-lg font-medium max-w-2xl">Manage your student assessments, track progress, and review historical performance data across all modules.</p>
                </div>
                <div className="absolute -right-20 -top-20 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-[100px]" />
                <Filter className="absolute right-12 bottom-12 text-white/5 w-32 h-32 -rotate-12" />
            </motion.div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-end">
                <div className="lg:col-span-2 space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Search Registry</label>
                    <div className="relative group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by student or batch..."
                            className="input-field pl-16 h-14 rounded-2xl"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Filter Module</label>
                    <select
                        className="input-field h-14 rounded-2xl appearance-none"
                        value={selectedModule}
                        onChange={e => setSelectedModule(e.target.value)}
                    >
                        <option value="all">All Modules</option>
                        {[1, 2, 3, 4, 5, 6].map(m => (
                            <option key={m} value={`Module ${m}`}>Module {m}</option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center justify-between lg:justify-end px-2">
                    <div className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
                        Total Records: <span className="text-primary">{filteredReviews.length}</span>
                    </div>
                </div>
            </div>

            {/* Assessment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredReviews.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="col-span-full py-32 bento-card border-dashed border-2 flex flex-col items-center justify-center text-text-tertiary"
                        >
                            <Search size={48} className="mb-4 opacity-10" />
                            <p className="font-bold uppercase tracking-widest text-[10px]">No records found matching criteria</p>
                        </motion.div>
                    ) : (
                        filteredReviews.map((review, i) => (
                            <motion.div
                                layout
                                key={review.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: i * 0.05 }}
                                className="bento-card group p-0 overflow-hidden border-border-base hover:border-primary/50 flex flex-col h-full bg-white dark:bg-[#0a0a0a]"
                            >
                                <div className="p-6 md:p-8 flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 bg-bg-subtle text-text-tertiary rounded-[1.25rem] flex items-center justify-center font-black text-xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-12 group-hover:scale-110 shrink-0">
                                                {review.studentName?.[0] || '?'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-black text-xl leading-tight text-text-primary tracking-tight truncate">{review.studentName}</h3>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <span className="badge bg-bg-subtle text-text-secondary border-none px-2 py-0.5 lowercase text-[9px]">{review.batch}</span>
                                                    <span className="w-1 h-1 rounded-full bg-text-tertiary hidden sm:block" />
                                                    <span className="text-[10px] font-bold text-text-tertiary uppercase">{review.module}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="relative shrink-0">
                                            <button
                                                className={cn(
                                                    "btn-icon rounded-2xl w-10 h-10 transition-all",
                                                    activeMenu === review.id ? "bg-primary text-white" : ""
                                                )}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setActiveMenu(activeMenu === review.id ? null : review.id);
                                                }}
                                            >
                                                <MoreVertical size={18} />
                                            </button>

                                            <AnimatePresence>
                                                {activeMenu === review.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                        className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#0a0a0a] border border-border-base rounded-2xl shadow-2xl z-50 overflow-hidden py-2"
                                                    >
                                                        <button onClick={() => openEditModal(review)} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-text-secondary hover:bg-bg-subtle hover:text-primary transition-all">
                                                            <Edit size={16} /> Edit details
                                                        </button>
                                                        <div className="h-px bg-border-subtle mx-3 my-1" />
                                                        <button onClick={() => { setDeleteTarget(review); setActiveMenu(null); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all">
                                                            <Trash2 size={16} /> Delete record
                                                        </button>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    <div className="h-px bg-border-subtle mb-6" />

                                    <div className="flex justify-between items-center bg-bg-subtle/50 p-4 rounded-2xl border border-border-subtle">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest leading-none">Status</p>
                                            <span className={cn(
                                                "badge px-0 bg-transparent border-none text-[10px] font-black uppercase tracking-widest",
                                                review.status === 'completed' ? 'text-green-500' :
                                                    review.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                                            )}>
                                                {review.status === 'pending' ? 'READY' : review.status}
                                            </span>
                                        </div>
                                        <div className="text-right space-y-1">
                                            <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest leading-none">Scheduled</p>
                                            <p className="text-[10px] font-bold text-text-secondary">
                                                {new Date(review.scheduledAt || "").toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-8 pb-8 mt-auto">
                                    {review.status === 'pending' ? (
                                        <button
                                            onClick={() => startReview(review)}
                                            className="btn btn-primary w-full h-14 bg-slate-900 group-hover:bg-primary transition-all duration-300 text-white font-black uppercase tracking-widest text-xs shadow-none group-hover:shadow-xl group-hover:shadow-primary/30"
                                        >
                                            Start Session
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => startReview(review)}
                                            className="btn btn-secondary w-full h-14 bg-bg-subtle/30 border-dashed border-2 hover:border-primary/30 text-text-tertiary font-black uppercase tracking-widest text-xs"
                                        >
                                            View Performance
                                            <ExternalLink size={16} />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteTarget && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md" onClick={() => {
                        if (!isDeleting) setDeleteTarget(null);
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-white/20"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className="w-16 h-16 rounded-[1.25rem] bg-red-50 flex items-center justify-center mb-6">
                                    <AlertTriangle size={32} className="text-red-500" />
                                </div>
                                <h3 className="text-xl font-black text-text-primary mb-2">Delete Assessment</h3>
                                <p className="text-text-secondary text-sm leading-relaxed">
                                    Are you sure you want to permanently delete the assessment record for{' '}
                                    <span className="font-bold text-text-primary">{deleteTarget.studentName}</span>?
                                    This action cannot be undone.
                                </p>
                            </div>
                            <div className="px-8 pb-8 flex gap-3">
                                <button
                                    onClick={() => setDeleteTarget(null)}
                                    disabled={isDeleting}
                                    className="btn btn-secondary flex-1 h-14 font-black uppercase tracking-widest text-xs disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="btn flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20 disabled:opacity-50 transition-all"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            Deleting...
                                        </>
                                    ) : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md" onClick={() => {
                        if (!isSubmitting) {
                            setShowForm(false);
                            setIsEditing(null);
                        }
                    }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl border border-white/20"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8 bg-bg-subtle border-b border-border-base flex justify-between items-center">
                                <div>
                                    <h3 className="text-xl font-black text-text-primary">Update Record</h3>
                                    <p className="text-text-secondary text-sm mt-1">Modify student details.</p>
                                </div>
                                <button onClick={() => setShowForm(false)} className="btn-icon rounded-2xl w-10 h-10">
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="p-8">
                                <form onSubmit={handleUpdateReview} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="studentName" className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Student Name</label>
                                        <input
                                            id="studentName"
                                            className="input-field"
                                            placeholder="e.g. Nithin Raj"
                                            value={formData.studentName}
                                            onChange={e => setFormData({ ...formData, studentName: e.target.value })}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="moduleSelect" className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Module</label>
                                        <select
                                            id="moduleSelect"
                                            className="input-field appearance-none"
                                            value={formData.module}
                                            onChange={e => setFormData({ ...formData, module: e.target.value })}
                                            disabled={isSubmitting}
                                        >
                                            {[1, 2, 3, 4, 5, 6].map(m => <option key={m} value={`Module ${m}`}>Module {m}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="batchCode" className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Batch Name</label>
                                        <input
                                            id="batchCode"
                                            className="input-field"
                                            placeholder="e.g. Batch 2026"
                                            value={formData.batch}
                                            onChange={e => setFormData({ ...formData, batch: e.target.value })}
                                            required
                                            disabled={isSubmitting}
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn btn-primary w-full h-14 text-base font-black shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                Updating...
                                            </>
                                        ) : 'Save Changes'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

