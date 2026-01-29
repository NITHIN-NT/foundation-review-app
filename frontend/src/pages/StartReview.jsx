import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, ArrowRight, Layers, User, Users, UserCheck } from 'lucide-react';

const StartReview = () => {
    const [modules, setModules] = useState([]);
    const [selectedModule, setSelectedModule] = useState('');
    const [studentName, setStudentName] = useState('');
    const [batch, setBatch] = useState('');
    const [coordinator, setCoordinator] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        api.get('core/modules/').then(res => setModules(res.data)).catch(console.error);
    }, []);

    const handleStart = async () => {
        if (!selectedModule || !studentName.trim()) return;
        setIsLoading(true);
        try {
            const res = await api.post('core/reviews/', {
                module: selectedModule,
                student_name: studentName.trim(),
                batch: batch.trim(),
                coordinator: coordinator.trim() || user.first_name,
                reviewer: user.user_id
            });
            navigate(`/review/${res.data.id}`);
        } catch (err) {
            console.error(err);
            alert("Failed to start review");
        }
        setIsLoading(false);
    };

    return (
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
            {/* Header */}
            <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
                <button onClick={() => navigate('/')} className="btn btn-ghost btn-icon">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <span className="text-xs uppercase text-muted font-medium">Foundation Review</span>
                    <h1>New Session</h1>
                </div>
            </div>

            {/* Form Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card flex flex-col gap-6"
            >
                {/* Module Selection */}
                <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Layers size={16} className="text-muted" />
                        Select Module (Week)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {modules.length > 0 ? modules.map((mod, idx) => (
                            <button
                                key={mod.id}
                                onClick={() => setSelectedModule(mod.id)}
                                className={`btn ${selectedModule === mod.id ? 'btn-primary' : 'btn-secondary'}`}
                                style={{ padding: '1rem', flexDirection: 'column', gap: '0.25rem' }}
                            >
                                <span className="text-xs text-muted">Week {idx + 1}</span>
                                <span className="font-bold">M{idx + 1}</span>
                            </button>
                        )) : (
                            <>
                                {[1, 2, 3, 4].map(n => (
                                    <button
                                        key={n}
                                        onClick={() => setSelectedModule(n)}
                                        className={`btn ${selectedModule === n ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{ padding: '1rem', flexDirection: 'column', gap: '0.25rem' }}
                                    >
                                        <span className="text-xs" style={{ opacity: 0.6 }}>Week {n}</span>
                                        <span className="font-bold">M{n}</span>
                                    </button>
                                ))}
                            </>
                        )}
                    </div>
                </div>

                <div className="divider" />

                {/* Student Name */}
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <User size={16} className="text-muted" />
                        Student Name
                    </label>
                    <input
                        type="text"
                        className="input"
                        placeholder="Enter student's full name"
                        value={studentName}
                        onChange={e => setStudentName(e.target.value)}
                    />
                </div>

                {/* Batch */}
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <Users size={16} className="text-muted" />
                        Batch
                    </label>
                    <input
                        type="text"
                        className="input"
                        placeholder="e.g., B24"
                        value={batch}
                        onChange={e => {
                            const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                            setBatch(val);
                        }}
                    />
                    <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>Uppercase letters and numbers only</span>
                </div>

                {/* Review Coordinator */}
                <div className="flex flex-col gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                        <UserCheck size={16} className="text-muted" />
                        Review Coordinator
                    </label>
                    <input
                        type="text"
                        className="input"
                        placeholder={user?.first_name || "Coordinator name"}
                        value={coordinator}
                        onChange={e => setCoordinator(e.target.value)}
                    />
                </div>

                <div className="divider" />

                {/* Submit Button */}
                <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStart}
                    className="btn btn-primary w-full"
                    disabled={!selectedModule || !studentName.trim() || isLoading}
                    style={{ padding: '1rem' }}
                >
                    {isLoading ? 'Starting...' : 'Begin Review Session'}
                    <ArrowRight size={18} />
                </motion.button>
            </motion.div>
        </div>
    );
}

export default StartReview;
