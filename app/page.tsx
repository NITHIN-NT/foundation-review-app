"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  ArrowRight,
  UserPlus,
  MoreVertical,
  Clock,
  Loader2,
  Edit,
  Trash2,
  Terminal,
  LayoutDashboard,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fetchReviews, createReview, deleteReview, updateReview } from '@/lib/api';
import type { ScheduledReview } from '@/types';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { cn } from '@/lib/utils';
import { useAssessment } from '@/components/AssessmentSessionProvider';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reviews, setReviews] = useState<ScheduledReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<ScheduledReview | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { startAssessment } = useAssessment();

  const [isEditing, setIsEditing] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    studentName: '',
    module: 'Module 1',
    batch: '',
  });

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
      console.error('Failed to load dashboard:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      toast.error('Session Sync Failed', {
        description: errorMessage + '. Please ensure the database is accessible.'
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reviewData: import('@/types').UpdateReviewRequest & { scheduled_at?: string } = {
      student_name: formData.studentName,
      batch: formData.batch,
      module: formData.module,
    };

    if (!isEditing) {
      reviewData.status = 'pending';
      reviewData.scheduled_at = new Date().toISOString();
    }

    try {
      if (isEditing) {
        const updated = await updateReview(isEditing, reviewData);
        setReviews(prev => prev.map(r => r.id === isEditing ? updated : r));
        toast.success('Assessment updated successfully');
      } else {
        const savedReview = await createReview(reviewData as import('@/types').CreateReviewRequest);
        setReviews(prev => [savedReview, ...prev]);
        toast.success('Assessment scheduled successfully');
      }
      setShowForm(false);
      setIsEditing(null);
      setFormData({ studentName: '', batch: '', module: 'Module 1' });
    } catch (error) {
      console.error('Failed to create/update assessment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Validation failed';
      toast.error(errorMessage + '. Please check your inputs.');
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

  const startReview = (review: ScheduledReview) => {
    startAssessment(review);
  };

  const filteredReviews = reviews.filter(r => {
    const matchesSearch =
      r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.batch?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === 'all' || r.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  if (isLoading && reviews.length === 0) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-bg-subtle rounded-lg mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-bg-subtle rounded-3xl"></div>)}
        </div>
        <div className="h-12 w-full max-w-md bg-bg-subtle rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-bg-subtle rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Premium Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-slate-900 p-6 md:p-12 text-white shadow-2xl"
      >
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="badge bg-primary text-white border-none px-4 py-2">All Systems Running</span>
            <span className="text-white/40 text-[10px] font-black tracking-widest uppercase">Server Status: Active</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter leading-tight mb-4">
            Welcome back, <span className="text-primary">{user?.email?.split('@')[0] || 'Admin'}</span>
          </h1>
          <p className="text-white/60 text-base md:text-lg font-medium leading-relaxed mb-8">
            You have <span className="text-white font-bold">{reviews.filter(r => r.status === 'pending').length} assessments</span> ready to start. Take a look at your upcoming list.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap gap-4">
            <button
              className="btn btn-primary h-12 md:h-14 px-6 md:px-8 text-sm md:text-base shadow-xl w-full sm:w-auto"
              onClick={() => setShowForm(true)}
            >
              <UserPlus size={20} />
              New Assessment
            </button>
          </div>
        </div>

        {/* Animated Background Elements */}
        <div className="absolute -right-20 -top-20 w-64 md:w-96 h-64 md:h-96 bg-primary/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute right-20 bottom-0 top-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent hidden md:block" />
        <Terminal className="absolute right-6 md:right-12 top-6 md:top-12 text-white/5 w-32 md:w-64 h-32 md:h-64 -rotate-12" />
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Statistical Ledger */}
        <div className="xl:col-span-1 space-y-6">
          <p className="section-title">Performance Summary</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4">
            {[
              { label: 'Total Index', value: reviews.length, trend: '+12%', icon: LayoutDashboard },
              { label: 'Upcoming', value: reviews.filter(r => r.status === 'pending').length, trend: 'High', icon: Clock },
              { label: 'Completed', value: reviews.filter(r => r.status === 'completed' || r.status === 'failed').length, trend: '98%', icon: CheckCircle },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bento-card p-4 md:p-5 flex flex-row items-center justify-between group translate-z-0 h-full"
              >
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-text-tertiary uppercase tracking-widest block mb-0.5">{stat.label}</span>
                  <div className="text-2xl md:text-3xl font-black text-text-primary group-hover:text-primary transition-colors leading-none">{stat.value}</div>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-bg-subtle flex items-center justify-center text-text-tertiary group-hover:bg-primary-subtle group-hover:text-primary transition-all duration-500 shadow-inner shrink-0 ml-4">
                  <stat.icon size={18} className="md:size-[20px]" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Global Registry Map */}
        <div className="xl:col-span-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <p className="section-title mb-0">Assessment Registry</p>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative group flex-1 sm:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search student or batch..."
                  className="w-full h-11 pl-11 pr-4 bg-bg-subtle border border-border-base rounded-xl text-xs font-bold text-text-primary outline-none focus:bg-bg-white focus:border-primary transition-all"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <select
                className="h-11 px-4 bg-bg-subtle border border-border-base rounded-xl text-xs font-bold text-text-primary outline-none focus:bg-bg-white focus:border-primary transition-all appearance-none pr-10"
                value={selectedModule}
                onChange={e => setSelectedModule(e.target.value)}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '16px' }}
              >
                <option value="all">All Modules</option>
                {[1, 2, 3, 4].map(m => (
                  <option key={m} value={`Module ${m}`}>Module {m}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredReviews.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="col-span-full py-32 bento-card border-dashed border-2 flex flex-col items-center justify-center text-text-tertiary"
                >
                  <Search size={48} className="mb-4 opacity-10" />
                  <p className="font-bold uppercase tracking-widest text-[10px]">No results found</p>
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
                    className="bento-card group p-0 overflow-hidden border-border-base hover:border-primary/50 flex flex-col h-full"
                  >
                    <div className="p-6 md:p-8 flex-1">
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex gap-4">
                          <div className="w-14 h-14 bg-bg-subtle text-text-tertiary rounded-[1.25rem] flex items-center justify-center font-black text-xl group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner group-hover:rotate-12 group-hover:scale-110 shrink-0">
                            {review.studentName?.[0] || '?'}
                          </div>
                          <div className="overflow-hidden">
                            <h3 className="font-black text-xl leading-tight text-white group-hover:text-primary transition-colors tracking-tight truncate">{review.studentName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="badge bg-bg-subtle text-text-secondary border-none px-2 py-0.5 lowercase text-[9px]">{review.batch}</span>
                              <span className="w-1 h-1 rounded-full bg-text-tertiary" />
                              <span className="text-[10px] font-bold text-text-tertiary uppercase">{review.module}</span>
                            </div>
                          </div>
                        </div>

                        <div className="relative">
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
                          <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest leading-none">Current Status</p>
                          <span className={cn(
                            "badge px-0 bg-transparent border-none text-[10px] font-black uppercase tracking-widest",
                            review.status === 'completed' ? 'text-green-500' :
                              review.status === 'failed' ? 'text-red-500' : 'text-amber-500'
                          )}>
                            {review.status === 'pending' ? 'READY' : review.status}
                          </span>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-[9px] font-black text-text-tertiary uppercase tracking-widest leading-none">Timestamp</p>
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
                          className="btn btn-secondary w-full h-14 bg-bg-subtle border border-border-base hover:border-primary/50 text-text-primary font-black uppercase tracking-widest text-xs shadow-sm transition-all"
                        >
                          View Results
                          <ExternalLink size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md" onClick={() => {
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
                <div className="w-16 h-16 rounded-[1.25rem] bg-red-50 flex items-center justify-center mb-6 text-red-500">
                  <Trash2 size={32} />
                </div>
                <h3 className="text-xl font-black text-text-primary mb-2">Delete Record?</h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Permanently remove assessment for <span className="font-bold text-text-primary">{deleteTarget.studentName}</span>?
                </p>
              </div>
              <div className="px-8 pb-8 flex gap-3">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="btn btn-secondary flex-1 h-14 font-black uppercase tracking-widest text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="btn flex-1 h-14 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-red-500/20"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md" onClick={() => {
            if (!isSubmitting) {
              setShowForm(false);
              setIsEditing(null);
              setFormData({ studentName: '', batch: '', module: 'Module 1' });
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
                  <h3 className="text-xl font-black text-text-primary">{isEditing ? 'Update Record' : 'New Assessment'}</h3>
                  <p className="text-text-secondary text-sm mt-1">{isEditing ? 'Modify student details.' : 'Register a new student.'}</p>
                </div>
                {isEditing && (
                  <button onClick={() => { setShowForm(false); setIsEditing(null); }} className="btn-icon rounded-2xl w-10 h-10">
                    <Search size={20} className="rotate-45" /> {/* Use X equivalent if available, or just icon */}
                  </button>
                )}
              </div>
              <div className="p-8">
                <form onSubmit={handleCreateReview} className="space-y-6">
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
                    <div className="relative">
                      <select
                        id="moduleSelect"
                        className="input-field appearance-none pr-10"
                        value={formData.module}
                        onChange={e => setFormData({ ...formData, module: e.target.value })}
                        disabled={isSubmitting}
                      >
                        {[1, 2, 3, 4].map(m => <option key={m} value={`Module ${m}`}>Module {m}</option>)}
                      </select>
                      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-text-tertiary">
                        <ArrowRight size={16} className="rotate-90" />
                      </div>
                    </div>
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
                        {isEditing ? 'Updating...' : 'Registering...'}
                      </>
                    ) : (isEditing ? 'Save Changes' : 'Schedule Assessment')}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => { setShowForm(false); setIsEditing(null); }}
                      className="btn btn-secondary w-full h-14 mt-2"
                    >
                      Cancel
                    </button>
                  )}
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
