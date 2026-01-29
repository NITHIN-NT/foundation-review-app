import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { Plus, Clock, Check, ArrowRight, Layers } from 'lucide-react';

const ReviewerDashboard = () => {
    const [reviews, setReviews] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('core/reviews/').then(res => setReviews(res.data)).catch(console.error);
    }, []);

    const stats = {
        total: reviews.length,
        completed: reviews.filter(r => r.is_completed).length,
        pending: reviews.filter(r => !r.is_completed).length
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-xs uppercase text-muted font-medium">Dashboard</span>
                    <h1>Foundation Reviews</h1>
                </div>
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/start-review')}
                    className="btn btn-primary"
                >
                    <Plus size={18} />
                    New Review
                </motion.button>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div className="card">
                    <div className="text-xs uppercase text-muted font-medium">Total</div>
                    <div className="font-bold" style={{ fontSize: '2rem' }}>{stats.total}</div>
                </div>
                <div className="card">
                    <div className="text-xs uppercase text-muted font-medium">Completed</div>
                    <div className="font-bold" style={{ fontSize: '2rem', color: 'var(--success)' }}>{stats.completed}</div>
                </div>
                <div className="card">
                    <div className="text-xs uppercase text-muted font-medium">In Progress</div>
                    <div className="font-bold" style={{ fontSize: '2rem', color: 'var(--warning)' }}>{stats.pending}</div>
                </div>
            </div>

            <div className="flex flex-col gap-4">
                <h3>Recent Sessions</h3>

                <div className="flex flex-col gap-3">
                    {reviews.length > 0 ? reviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigate(review.is_completed ? `/report/${review.id}` : `/review/${review.id}`)}
                            className="card card-interactive flex items-center justify-between"
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="flex items-center gap-4">
                                <div className="avatar">
                                    {(review.student_display_name || review.student_name || 'S')?.[0]}
                                </div>
                                <div>
                                    <div className="font-medium">
                                        {review.student_display_name || review.student_name || 'Student'}
                                    </div>
                                    <div className="text-sm text-muted flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {new Date(review.date).toLocaleDateString()}
                                        </span>
                                        {review.module_name && (
                                            <span className="flex items-center gap-1">
                                                <Layers size={14} />
                                                {review.module_name}
                                            </span>
                                        )}
                                        {review.batch && (
                                            <span>{review.batch}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <span className={`badge ${review.is_completed ? 'badge-success' : 'badge-warning'}`}>
                                    {review.is_completed ? <><Check size={12} /> Done</> : 'Active'}
                                </span>
                                <ArrowRight size={18} className="text-muted" />
                            </div>
                        </motion.div>
                    )) : (
                        <div className="card text-center text-muted" style={{ padding: '3rem' }}>
                            No reviews yet. Start a new one!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReviewerDashboard;
