import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';

// SVG Icons
const Icons = {
    modules: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
    ),
    users: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    ),
    upload: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
    ),
    plus: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    edit: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    trash: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    file: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
    ),
    warning: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
    ),
    block: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
        </svg>
    ),
    check: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    eye: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    eyeOff: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
            <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
            <line x1="2" y1="2" x2="22" y2="22" />
        </svg>
    )
};

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('modules');
    const [modules, setModules] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedModule, setSelectedModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showAddModule, setShowAddModule] = useState(false);
    const [showAddQuestion, setShowAddQuestion] = useState(false);
    const [showEditQuestion, setShowEditQuestion] = useState(null);
    const [showAddUser, setShowAddUser] = useState(false);
    const [showEditUser, setShowEditUser] = useState(null);
    const [showEditModule, setShowEditModule] = useState(null);
    const [showCSVUpload, setShowCSVUpload] = useState(false);
    const [confirmModal, setConfirmModal] = useState(null); // { title, message, onConfirm }
    const [saving, setSaving] = useState(false);
    const [newModuleName, setNewModuleName] = useState('');
    const [newQuestion, setNewQuestion] = useState({ text: '', answer: '' });
    const [csvFile, setCsvFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(null);
    const fileInputRef = useRef(null);

    const [newUser, setNewUser] = useState({
        email: '', password: '', first_name: '', last_name: '', role: 'REVIEWER'
    });
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

    useEffect(() => {
        fetchModules();
        fetchUsers();
    }, []);

    const fetchModules = async () => {
        try {
            const res = await api.get('core/modules/');
            setModules(res.data);
            if (selectedModule) {
                const updated = res.data.find(m => m.id === selectedModule.id);
                setSelectedModule(updated || res.data[0] || null);
            } else if (res.data.length > 0) {
                setSelectedModule(res.data[0]);
            }
        } catch (err) {
            console.error('Failed to fetch modules:', err);
        }
        setLoading(false);
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('users/all/');
            setUsers(res.data);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleAddModule = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('core/modules/', { name: newModuleName });
            setModules([...modules, res.data]);
            setNewModuleName('');
            setShowAddModule(false);
            setSelectedModule(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditModule = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.patch(`core/modules/${showEditModule.id}/`, { name: showEditModule.name });
            await fetchModules();
            setShowEditModule(null);
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!selectedModule) return;
        try {
            await api.post('core/questions/', {
                module: selectedModule.id,
                text: newQuestion.text,
                answer: newQuestion.answer
            });
            await fetchModules();
            setNewQuestion({ text: '', answer: '' });
            setShowAddQuestion(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditQuestion = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`core/questions/${showEditQuestion.id}/`, {
                text: showEditQuestion.text,
                answer: showEditQuestion.answer
            });
            await fetchModules();
            setShowEditQuestion(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        setDeleteLoading(questionId);
        try {
            await api.delete(`core/questions/${questionId}/`);
            await fetchModules();
        } catch (err) {
            console.error('Delete failed:', err);
        }
        setDeleteLoading(null);
        setConfirmModal(null);
    };

    const handleCSVUpload = async (e) => {
        e.preventDefault();
        if (!csvFile || !selectedModule) return;

        setUploadStatus('Uploading...');
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const text = event.target.result;
                const lines = text.split('\n').filter(line => line.trim());
                let addedCount = 0;

                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i];
                    const match = line.match(/^"?([^"]*)"?,?"?([^"]*)"?$/);
                    if (match) {
                        const question = match[1]?.trim();
                        const answer = match[2]?.trim() || '';
                        if (question) {
                            await api.post('core/questions/', {
                                module: selectedModule.id,
                                text: question,
                                answer: answer
                            });
                            addedCount++;
                        }
                    }
                }

                setUploadStatus(`Successfully added ${addedCount} questions!`);
                await fetchModules();
                setTimeout(() => {
                    setShowCSVUpload(false);
                    setCsvFile(null);
                    setUploadStatus('');
                }, 2000);
            } catch (err) {
                setUploadStatus('Error uploading CSV.');
                console.error(err);
            }
        };
        reader.readAsText(csvFile);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await api.post('users/register/', newUser);
            await fetchUsers();
            setNewUser({ email: '', password: '', first_name: '', last_name: '', role: 'REVIEWER' });
            setShowAddUser(false);
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            await api.patch(`users/${showEditUser.id}/`, {
                first_name: showEditUser.first_name,
                last_name: showEditUser.last_name,
                role: showEditUser.role,
                is_active: showEditUser.is_active
            });
            await fetchUsers();
            setShowEditUser(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleToggleUserStatus = async (user) => {
        try {
            await api.patch(`users/${user.id}/`, { is_active: !user.is_active });
            await fetchUsers();
        } catch (err) {
            console.error(err);
        }
        setConfirmModal(null);
    };

    const handleDeleteUser = async (userId) => {
        try {
            await api.delete(`users/${userId}/`);
            await fetchUsers();
        } catch (err) {
            console.error(err);
        }
        setConfirmModal(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('token');
        navigate('/admin');
    };

    // Confirmation helpers
    const confirmDeleteQuestion = (q) => {
        setConfirmModal({
            title: 'Delete Question',
            message: `Are you sure you want to delete this question? This action cannot be undone.`,
            onConfirm: () => handleDeleteQuestion(q.id),
            type: 'danger'
        });
    };

    const confirmDeleteUser = (user) => {
        setConfirmModal({
            title: 'Delete User',
            message: `Are you sure you want to delete "${user.first_name || user.email}"? This action cannot be undone.`,
            onConfirm: () => handleDeleteUser(user.id),
            type: 'danger'
        });
    };

    const confirmBlockUser = (user) => {
        setConfirmModal({
            title: user.is_active ? 'Block User' : 'Unblock User',
            message: user.is_active
                ? `Are you sure you want to block "${user.first_name || user.email}"? They will not be able to login.`
                : `Are you sure you want to unblock "${user.first_name || user.email}"?`,
            onConfirm: () => handleToggleUserStatus(user),
            type: user.is_active ? 'warning' : 'success'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center" style={{ minHeight: '100vh', background: 'var(--gray-900)' }}>
                <div style={{ color: 'var(--gray-400)' }}>Loading...</div>
            </div>
        );
    }

    const tabStyle = (isActive) => ({
        padding: '0.75rem 1.5rem',
        background: isActive ? 'rgba(0, 102, 255, 0.15)' : 'transparent',
        border: `1px solid ${isActive ? 'rgba(0, 102, 255, 0.5)' : 'var(--gray-700)'}`,
        borderRadius: '8px',
        color: isActive ? 'white' : 'var(--gray-400)',
        cursor: 'pointer',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
    });

    const inputStyle = {
        width: '100%',
        padding: '0.875rem',
        background: 'var(--gray-900)',
        border: '1px solid var(--gray-600)',
        borderRadius: '8px',
        color: 'white',
        marginBottom: '1rem'
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--gray-900)' }}>
            {/* Header */}
            <header style={{
                background: 'var(--gray-800)',
                borderBottom: '1px solid var(--gray-700)',
                padding: '1rem 2rem',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div className="flex items-center justify-between" style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div className="flex items-center gap-4">
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ color: 'white', fontSize: '1.125rem', fontWeight: '600' }}>Admin Dashboard</h2>
                            <span style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>Manage modules, questions & users</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span style={{ color: 'var(--gray-400)', fontSize: '0.875rem' }}>
                            Welcome, <strong style={{ color: 'white' }}>{adminUser.first_name || 'Admin'}</strong>
                        </span>
                        <button onClick={handleLogout} style={{
                            padding: '0.5rem 1rem',
                            background: 'var(--gray-700)',
                            border: '1px solid var(--gray-600)',
                            borderRadius: '8px',
                            color: 'var(--gray-300)',
                            fontSize: '0.875rem',
                            cursor: 'pointer'
                        }}>
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab Navigation */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 0' }}>
                <div className="flex gap-2">
                    <button onClick={() => setActiveTab('modules')} style={tabStyle(activeTab === 'modules')}>
                        {Icons.modules} Modules & Questions
                    </button>
                    <button onClick={() => setActiveTab('users')} style={tabStyle(activeTab === 'users')}>
                        {Icons.users} Users
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 2rem 2rem' }}>

                {/* MODULES TAB */}
                {activeTab === 'modules' && (
                    <div className="flex" style={{ gap: '2rem' }}>
                        {/* Sidebar */}
                        <div style={{ width: '280px', flexShrink: 0 }}>
                            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                                <h3 style={{ color: 'white', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Modules</h3>
                                <button
                                    onClick={() => setShowAddModule(true)}
                                    style={{
                                        width: '28px', height: '28px',
                                        background: 'var(--gray-700)',
                                        border: '1px solid var(--gray-600)',
                                        borderRadius: '6px',
                                        color: 'white',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                >{Icons.plus}</button>
                            </div>

                            <div className="flex flex-col gap-2">
                                {modules.map((mod) => (
                                    <motion.div
                                        key={mod.id}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        style={{
                                            padding: '1rem',
                                            background: selectedModule?.id === mod.id ? 'rgba(0, 102, 255, 0.15)' : 'var(--gray-800)',
                                            border: `1px solid ${selectedModule?.id === mod.id ? 'rgba(0, 102, 255, 0.5)' : 'var(--gray-700)'}`,
                                            borderRadius: '10px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start'
                                        }}
                                    >
                                        <div onClick={() => setSelectedModule(mod)} style={{ flex: 1 }}>
                                            <div style={{ color: 'white', fontWeight: '500', marginBottom: '0.25rem' }}>{mod.name}</div>
                                            <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>
                                                {mod.questions?.length || 0} questions
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowEditModule(mod); }}
                                            style={{
                                                padding: '0.35rem',
                                                background: 'var(--gray-700)',
                                                border: '1px solid var(--gray-600)',
                                                borderRadius: '4px',
                                                color: 'var(--gray-400)',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title="Edit module name"
                                        >
                                            {Icons.edit}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Main Panel */}
                        <div style={{ flex: 1 }}>
                            {selectedModule ? (
                                <>
                                    <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                                        <div>
                                            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>{selectedModule.name}</h2>
                                            <span style={{ color: 'var(--gray-500)', fontSize: '0.875rem' }}>
                                                {selectedModule.questions?.length || 0} questions
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowCSVUpload(true)}
                                                style={{
                                                    padding: '0.75rem 1.25rem',
                                                    background: 'var(--gray-700)',
                                                    border: '1px solid var(--gray-600)',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontWeight: '500',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {Icons.upload} Upload CSV
                                            </button>
                                            <button
                                                onClick={() => setShowAddQuestion(true)}
                                                style={{
                                                    padding: '0.75rem 1.25rem',
                                                    background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    color: 'white',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                {Icons.plus} Add Question
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {selectedModule.questions?.length > 0 ? (
                                            selectedModule.questions.map((q, index) => (
                                                <motion.div
                                                    key={q.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.03 }}
                                                    style={{
                                                        background: 'var(--gray-800)',
                                                        border: '1px solid var(--gray-700)',
                                                        borderRadius: '10px',
                                                        padding: '1.25rem'
                                                    }}
                                                >
                                                    <div className="flex items-start justify-between gap-4">
                                                        <div style={{ flex: 1 }}>
                                                            <div className="flex items-start gap-3">
                                                                <span style={{
                                                                    width: '28px', height: '28px',
                                                                    background: 'var(--gray-700)',
                                                                    borderRadius: '6px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    color: 'var(--gray-400)',
                                                                    fontSize: '0.75rem',
                                                                    fontWeight: '600',
                                                                    flexShrink: 0
                                                                }}>
                                                                    {index + 1}
                                                                </span>
                                                                <div style={{ flex: 1 }}>
                                                                    <p style={{ color: 'white', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '0.5rem' }}>
                                                                        <strong>Q:</strong> {q.text}
                                                                    </p>
                                                                    {q.answer ? (
                                                                        <p style={{ color: 'var(--gray-400)', fontSize: '0.875rem', lineHeight: '1.6', paddingLeft: '1rem', borderLeft: '2px solid var(--gray-600)' }}>
                                                                            <strong style={{ color: '#22c55e' }}>A:</strong> {q.answer}
                                                                        </p>
                                                                    ) : (
                                                                        <p style={{ color: 'var(--gray-500)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                                                                            No answer provided
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => setShowEditQuestion(q)}
                                                                style={{
                                                                    padding: '0.5rem 0.75rem',
                                                                    background: 'rgba(59, 130, 246, 0.1)',
                                                                    border: '1px solid rgba(59, 130, 246, 0.3)',
                                                                    color: '#3b82f6',
                                                                    cursor: 'pointer',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.8rem',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.35rem'
                                                                }}
                                                            >
                                                                {Icons.edit} Edit
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDeleteQuestion(q)}
                                                                disabled={deleteLoading === q.id}
                                                                style={{
                                                                    padding: '0.5rem 0.75rem',
                                                                    background: 'rgba(239, 68, 68, 0.1)',
                                                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                                                    color: '#ef4444',
                                                                    cursor: deleteLoading === q.id ? 'not-allowed' : 'pointer',
                                                                    borderRadius: '6px',
                                                                    fontSize: '0.8rem',
                                                                    opacity: deleteLoading === q.id ? 0.5 : 1,
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    gap: '0.35rem'
                                                                }}
                                                            >
                                                                {Icons.trash} {deleteLoading === q.id ? '...' : 'Delete'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        ) : (
                                            <div style={{
                                                padding: '3rem',
                                                textAlign: 'center',
                                                color: 'var(--gray-500)',
                                                background: 'var(--gray-800)',
                                                borderRadius: '10px',
                                                border: '1px dashed var(--gray-700)'
                                            }}>
                                                No questions yet. Add your first question or upload a CSV!
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    Select a module or create a new one
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div>
                        <div className="flex items-center justify-between" style={{ marginBottom: '1.5rem' }}>
                            <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600' }}>User Management</h2>
                            <button
                                onClick={() => setShowAddUser(true)}
                                style={{
                                    padding: '0.75rem 1.25rem',
                                    background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'white',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                {Icons.plus} Add User
                            </button>
                        </div>

                        <div style={{
                            background: 'var(--gray-800)',
                            border: '1px solid var(--gray-700)',
                            borderRadius: '12px',
                            overflow: 'hidden'
                        }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--gray-700)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--gray-300)', fontSize: '0.75rem', textTransform: 'uppercase' }}>User</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--gray-300)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Email</th>
                                        <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--gray-300)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Role</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--gray-300)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '1rem', textAlign: 'center', color: 'var(--gray-300)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id} style={{ borderTop: '1px solid var(--gray-700)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div className="flex items-center gap-3">
                                                    <div style={{
                                                        width: '36px', height: '36px',
                                                        background: 'var(--gray-600)',
                                                        borderRadius: '50%',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: '600'
                                                    }}>
                                                        {user.first_name?.[0] || user.email?.[0]?.toUpperCase()}
                                                    </div>
                                                    <span style={{ color: 'white' }}>{user.first_name} {user.last_name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--gray-400)' }}>{user.email}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: user.role === 'REVIEWER' ? 'rgba(0, 102, 255, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                                    color: user.role === 'REVIEWER' ? '#60a5fa' : '#22c55e',
                                                    borderRadius: '100px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    background: user.is_active ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                    color: user.is_active ? '#22c55e' : '#ef4444',
                                                    borderRadius: '100px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600'
                                                }}>
                                                    {user.is_active ? 'Active' : 'Blocked'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => setShowEditUser(user)}
                                                        style={{
                                                            padding: '0.4rem 0.75rem',
                                                            background: 'var(--gray-700)',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            color: 'white',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem'
                                                        }}
                                                    >
                                                        {Icons.edit} Edit
                                                    </button>
                                                    <button
                                                        onClick={() => confirmBlockUser(user)}
                                                        style={{
                                                            padding: '0.4rem 0.75rem',
                                                            background: user.is_active ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            color: user.is_active ? '#eab308' : '#22c55e',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem'
                                                        }}
                                                    >
                                                        {user.is_active ? Icons.block : Icons.check} {user.is_active ? 'Block' : 'Unblock'}
                                                    </button>
                                                    <button
                                                        onClick={() => confirmDeleteUser(user)}
                                                        style={{
                                                            padding: '0.4rem 0.75rem',
                                                            background: 'rgba(239, 68, 68, 0.15)',
                                                            border: 'none',
                                                            borderRadius: '6px',
                                                            color: '#ef4444',
                                                            fontSize: '0.8rem',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.35rem'
                                                        }}
                                                    >
                                                        {Icons.trash} Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                                    No users found
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* Confirmation Modal */}
                {confirmModal && (
                    <Modal onClose={() => setConfirmModal(null)} title={confirmModal.title}>
                        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                            {Icons.warning}
                            <p style={{ color: 'var(--gray-300)', marginTop: '1rem' }}>{confirmModal.message}</p>
                        </div>
                        <div className="flex gap-2">
                            <ModalButton type="button" onClick={() => setConfirmModal(null)} secondary>Cancel</ModalButton>
                            <ModalButton
                                type="button"
                                onClick={confirmModal.onConfirm}
                                danger={confirmModal.type === 'danger'}
                            >
                                Confirm
                            </ModalButton>
                        </div>
                    </Modal>
                )}

                {/* Add Module Modal */}
                {showAddModule && (
                    <Modal onClose={() => setShowAddModule(false)} title="Add New Module">
                        <form onSubmit={handleAddModule}>
                            <input type="text" placeholder="Module name (e.g., M1, M2)" value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} required style={inputStyle} />
                            <div className="flex gap-2">
                                <ModalButton type="button" onClick={() => setShowAddModule(false)} secondary>Cancel</ModalButton>
                                <ModalButton type="submit">Create</ModalButton>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Edit Module Modal */}
                {showEditModule && (
                    <Modal onClose={() => setShowEditModule(null)} title="Edit Module">
                        <form onSubmit={handleEditModule}>
                            <input
                                type="text"
                                placeholder="Module name"
                                value={showEditModule.name}
                                onChange={(e) => setShowEditModule({ ...showEditModule, name: e.target.value })}
                                required
                                style={inputStyle}
                                disabled={saving}
                            />
                            <div className="flex gap-2">
                                <ModalButton type="button" onClick={() => setShowEditModule(null)} secondary disabled={saving}>Cancel</ModalButton>
                                <ModalButton type="submit" disabled={saving} loading={saving}>
                                    {saving ? (
                                        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                style={{ display: 'inline-block' }}
                                            >
                                                ⟳
                                            </motion.span>
                                            Saving...
                                        </span>
                                    ) : 'Save Changes'}
                                </ModalButton>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Add Question Modal */}
                {showAddQuestion && (
                    <Modal onClose={() => setShowAddQuestion(false)} title={`Add Question to ${selectedModule?.name}`} wide>
                        <form onSubmit={handleAddQuestion}>
                            <label style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Question</label>
                            <textarea placeholder="Enter question text..." value={newQuestion.text} onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })} required rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                            <label style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Answer</label>
                            <textarea placeholder="Enter answer (optional)..." value={newQuestion.answer} onChange={(e) => setNewQuestion({ ...newQuestion, answer: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                            <div className="flex gap-2">
                                <ModalButton type="button" onClick={() => setShowAddQuestion(false)} secondary>Cancel</ModalButton>
                                <ModalButton type="submit">Add Question</ModalButton>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Edit Question Modal */}
                {showEditQuestion && (
                    <Modal onClose={() => setShowEditQuestion(null)} title="Edit Question" wide>
                        <form onSubmit={handleEditQuestion}>
                            <label style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Question</label>
                            <textarea value={showEditQuestion.text} onChange={(e) => setShowEditQuestion({ ...showEditQuestion, text: e.target.value })} required rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                            <label style={{ color: 'var(--gray-400)', fontSize: '0.875rem', marginBottom: '0.5rem', display: 'block' }}>Answer</label>
                            <textarea placeholder="Enter answer..." value={showEditQuestion.answer || ''} onChange={(e) => setShowEditQuestion({ ...showEditQuestion, answer: e.target.value })} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                            <div className="flex gap-2">
                                <ModalButton type="button" onClick={() => setShowEditQuestion(null)} secondary>Cancel</ModalButton>
                                <ModalButton type="submit">Save Changes</ModalButton>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* CSV Upload Modal */}
                {showCSVUpload && (
                    <Modal onClose={() => { setShowCSVUpload(false); setCsvFile(null); setUploadStatus(''); }} title={`Upload CSV to ${selectedModule?.name}`} wide>
                        <form onSubmit={handleCSVUpload}>
                            <div style={{ border: '2px dashed var(--gray-600)', borderRadius: '10px', padding: '2rem', textAlign: 'center', marginBottom: '1rem', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
                                <input type="file" accept=".csv" ref={fileInputRef} onChange={(e) => setCsvFile(e.target.files[0])} style={{ display: 'none' }} />
                                <div style={{ color: 'var(--gray-400)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                    {Icons.file} {csvFile ? csvFile.name : 'Click to select CSV file'}
                                </div>
                                <div style={{ color: 'var(--gray-500)', fontSize: '0.75rem' }}>Format: question,answer (first row as header)</div>
                            </div>
                            {uploadStatus && (
                                <div style={{ padding: '0.75rem', background: uploadStatus.includes('Success') ? 'rgba(34, 197, 94, 0.15)' : 'rgba(234, 179, 8, 0.15)', color: uploadStatus.includes('Success') ? '#22c55e' : '#eab308', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                                    {uploadStatus}
                                </div>
                            )}
                            <div className="flex gap-2">
                                <ModalButton type="button" onClick={() => { setShowCSVUpload(false); setCsvFile(null); }} secondary>Cancel</ModalButton>
                                <ModalButton type="submit" disabled={!csvFile}>Upload</ModalButton>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Add User Modal */}
                {showAddUser && (
                    <Modal onClose={() => setShowAddUser(false)} title="Add New User">
                        <form onSubmit={handleAddUser}>
                            <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} required style={inputStyle} />
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    required
                                    style={{ ...inputStyle, width: '100%', paddingRight: '2.5rem' }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: 'calc(50% - 0.5rem)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--gray-400)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0'
                                    }}
                                >
                                    {showPassword ? Icons.eyeOff : Icons.eye}
                                </button>
                            </div>
                            <div className="flex gap-2" style={{ marginBottom: '1rem' }}>
                                <input type="text" placeholder="First Name" value={newUser.first_name} onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} />
                                <input type="text" placeholder="Last Name" value={newUser.last_name} onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} />
                            </div>
                            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} style={inputStyle}>
                                <option value="REVIEWER">Reviewer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <div className="flex gap-2">
                                <ModalButton type="button" onClick={() => setShowAddUser(false)} secondary>Cancel</ModalButton>
                                <ModalButton type="submit">Create User</ModalButton>
                            </div>
                        </form>
                    </Modal>
                )}

                {/* Edit User Modal */}
                {showEditUser && (
                    <Modal onClose={() => setShowEditUser(null)} title="Edit User">
                        <form onSubmit={handleUpdateUser}>
                            <div style={{ color: 'var(--gray-400)', marginBottom: '1rem' }}>{showEditUser.email}</div>
                            <div className="flex gap-2" style={{ marginBottom: '1rem' }}>
                                <input type="text" placeholder="First Name" value={showEditUser.first_name} onChange={(e) => setShowEditUser({ ...showEditUser, first_name: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} />
                                <input type="text" placeholder="Last Name" value={showEditUser.last_name} onChange={(e) => setShowEditUser({ ...showEditUser, last_name: e.target.value })} style={{ ...inputStyle, marginBottom: 0 }} />
                            </div>
                            <select value={showEditUser.role} onChange={(e) => setShowEditUser({ ...showEditUser, role: e.target.value })} style={inputStyle}>
                                <option value="REVIEWER">Reviewer</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            <div className="flex gap-2">
                                <ModalButton type="button" onClick={() => setShowEditUser(null)} secondary>Cancel</ModalButton>
                                <ModalButton type="submit">Save Changes</ModalButton>
                            </div>
                        </form>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
};

const Modal = ({ children, onClose, title, wide }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
        onClick={onClose}
    >
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{ background: 'var(--gray-800)', border: '1px solid var(--gray-700)', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: wide ? '600px' : '400px' }}
        >
            <h3 style={{ color: 'white', marginBottom: '1.5rem' }}>{title}</h3>
            {children}
        </motion.div>
    </motion.div>
);

const ModalButton = ({ children, secondary, danger, ...props }) => (
    <button
        {...props}
        style={{
            flex: 1,
            padding: '0.75rem',
            background: secondary ? 'var(--gray-700)' : danger ? '#ef4444' : 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontWeight: secondary ? '400' : '600',
            cursor: props.disabled ? 'not-allowed' : 'pointer',
            opacity: props.disabled ? 0.5 : 1
        }}
    >
        {children}
    </button>
);

export default AdminDashboard;
