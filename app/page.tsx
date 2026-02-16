"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  BookOpen,
  Search,
  ArrowRight,
  UserPlus,
  SlidersHorizontal,
  MoreVertical,
  Clock,
  Loader2,
  Edit,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { fetchReviews, createReview, deleteReview, updateReview } from '@/lib/api';
import type { ScheduledReview } from '@/types';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ScheduledReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | number | null>(null);
  const [isEditing, setIsEditing] = useState<string | number | null>(null);
  const [formData, setFormData] = useState({
    studentName: '',
    module: 'Module 1',
    batch: '',
  });

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    setIsLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
    } catch (error) {
      toast.error('Connection failed. Please ensure the database is accessible.');
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const reviewData: any = {
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
        const savedReview = await createReview(reviewData);
        setReviews(prev => [savedReview, ...prev]);
        toast.success('Assessment scheduled successfully');
      }
      setShowForm(false);
      setIsEditing(null);
      setFormData({ studentName: '', batch: '', module: 'Module 1' });
    } catch (err: any) {
      toast.error(err.message || 'Validation failed. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;

    try {
      await deleteReview(id);
      setReviews(prev => prev.filter(r => r.id !== id));
      toast.success('Assessment deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete assessment');
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

  const filteredReviews = reviews.filter(r =>
    r.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.batch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startReview = (review: ScheduledReview) => {
    router.push(`/reviews/${review.id}`);
  };

  if (isLoading && reviews.length === 0) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-64 bg-bg-subtle rounded-lg mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-bg-subtle rounded-3xl"></div>)}
        </div>
        <div className="h-12 w-full max-w-md bg-bg-subtle rounded-xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-64 bg-bg-subtle rounded-3xl"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Dashboard</h1>
          <p className="text-text-secondary mt-1">Foundational assessment management console.</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary" aria-label="Assessment Protocols">
            <SlidersHorizontal size={18} />
            Protocols
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} aria-label="Schedule New Session">
            <UserPlus size={18} />
            Schedule Session
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Cumulative Reviews', value: reviews.length, color: 'primary' },
          { label: 'Pending Mastery', value: reviews.filter(r => r.status === 'pending').length, color: 'amber' },
          { label: 'Validated Sessions', value: reviews.filter(r => r.status === 'completed' || r.status === 'failed').length, color: 'green' },
        ].map((stat, i) => (
          <div key={i} className="bento-card hover:border-primary/50 transition-colors">
            <span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">{stat.label}</span>
            <div className="text-3xl font-black mt-2 text-text-primary">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
        <input
          type="text"
          placeholder="Lookup student or batch code..."
          className="input-field pl-12"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          aria-label="Search reviews"
        />
      </div>

      {/* Review Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredReviews.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full py-20 flex flex-col items-center justify-center text-text-tertiary opacity-50"
            >
              <Search size={48} className="mb-4" />
              <p className="font-medium">No records matching your search index.</p>
            </motion.div>
          ) : (
            filteredReviews.map((review) => (
              <motion.div
                layout
                key={review.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bento-card group hover:shadow-xl transition-all border-l-4 border-l-transparent hover:border-l-primary"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-bg-subtle text-text-tertiary rounded-xl flex items-center justify-center font-black text-xl group-hover:bg-primary-subtle group-hover:text-primary transition-colors">
                      {review.studentName?.[0] || '?'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg leading-tight text-text-primary">{review.studentName}</h3>
                      <p className="text-xs text-text-tertiary font-bold uppercase tracking-wider">{review.batch}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      className={cn(
                        "btn-icon transition-all shrink-0",
                        activeMenu === review.id ? "bg-bg-subtle text-primary" : ""
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
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenu(null)}
                          />
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-bg-white border border-border-base rounded-2xl shadow-2xl z-20 overflow-hidden py-1.5"
                          >
                            <button
                              onClick={() => openEditModal(review)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-text-secondary hover:bg-bg-subtle hover:text-primary transition-colors text-left"
                            >
                              <Edit size={16} />
                              Edit Properties
                            </button>
                            <div className="h-px bg-border-subtle mx-2 my-1" />
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                            >
                              <Trash2 size={16} />
                              Delete Record
                            </button>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="space-y-3 py-4 border-y border-border-subtle my-2">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <BookOpen size={16} className="text-primary" />
                    <span className="text-sm font-bold">{review.module}</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-tertiary">
                    <Calendar size={16} />
                    <span className="text-xs font-semibold">
                      LOGGED: {new Date(review.scheduledAt || "").toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <span className={cn(
                    "badge font-black uppercase tracking-widest text-[9px]",
                    review.status === 'completed' ? 'badge-passed' : 'badge-pending'
                  )}>
                    {review.status}
                  </span>
                  {review.status === 'pending' ? (
                    <button
                      onClick={() => startReview(review)}
                      className="btn btn-primary h-9 px-4 text-[10px] font-black uppercase tracking-widest"
                    >
                      Initialize Session
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-600">
                      <Clock size={14} />
                      Archived
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

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
              <div className="p-8 bg-bg-subtle border-b border-border-base">
                <h3 className="text-xl font-black text-text-primary">{isEditing ? 'Update Session' : 'Schedule Session'}</h3>
                <p className="text-text-secondary text-sm mt-1">{isEditing ? 'Modify student assessment details.' : 'Register a new student for assessment.'}</p>
              </div>
              <div className="p-8">
                <form onSubmit={handleCreateReview} className="space-y-6">
                  <div className="space-y-2">
                    <label htmlFor="studentName" className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Candidate Nominal</label>
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
                    <label htmlFor="moduleSelect" className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Assessment Matrix</label>
                    <select
                      id="moduleSelect"
                      className="input-field appearance-none"
                      value={formData.module}
                      onChange={e => setFormData({ ...formData, module: e.target.value })}
                      disabled={isSubmitting}
                    >
                      {[1, 2, 3, 4, 5, 6].map(m => <option key={m} value={`Module ${m}`}>Module {m} - Advanced Core</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="batchCode" className="text-[10px] font-black uppercase tracking-widest text-text-tertiary ml-1">Batch Reference</label>
                    <input
                      id="batchCode"
                      className="input-field"
                      placeholder="e.g. BR-2026"
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
                        {isEditing ? 'Updating Record...' : 'Deploying Session...'}
                      </>
                    ) : (isEditing ? 'Save Changes' : 'Register & Schedule')}
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
