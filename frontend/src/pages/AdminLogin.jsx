import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const response = await api.post('users/login/', { username: email, password });
            const { token, is_superuser, is_staff, role, ...userData } = response.data;

            if (!is_superuser && !is_staff && role !== 'ADMIN') {
                setError('Access denied. Admin privileges required.');
                setIsLoading(false);
                return;
            }

            localStorage.setItem('adminToken', token);
            localStorage.setItem('token', token);
            localStorage.setItem('adminUser', JSON.stringify({ ...userData, is_superuser, is_staff, role }));
            localStorage.setItem('user', JSON.stringify({ ...userData, is_superuser, is_staff, role }));

            // Reload to sync AuthContext or navigate and let context handle it
            window.location.href = '/admin/dashboard';
        } catch (error) {
            setError(error.response?.data?.non_field_errors?.[0] || 'Login failed');
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center" style={{ minHeight: '100vh', padding: '2rem', background: 'var(--gray-900)' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full"
                style={{ maxWidth: '400px' }}
            >
                {/* Logo/Branding */}
                <div className="flex flex-col items-center gap-3" style={{ marginBottom: '2.5rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 32px rgba(0, 102, 255, 0.3)'
                    }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" />
                            <path d="M2 17l10 5 10-5" />
                            <path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-xs uppercase font-medium" style={{ color: 'var(--gray-500)', letterSpacing: '0.15em' }}>Admin Portal</span>
                        <h1 style={{ color: 'white', fontSize: '1.75rem' }}>Control Panel</h1>
                    </div>
                </div>

                {/* Login Card */}
                <div style={{
                    background: 'var(--gray-800)',
                    border: '1px solid var(--gray-700)',
                    borderRadius: '16px',
                    padding: '2rem'
                }}>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '10px',
                                padding: '0.75rem 1rem',
                                marginBottom: '1.5rem',
                                color: '#ef4444',
                                fontSize: '0.875rem'
                            }}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium" style={{ color: 'var(--gray-300)' }}>Username</label>
                            <input
                                type="text"
                                className="input"
                                placeholder="admin"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    background: 'var(--gray-900)',
                                    border: '1px solid var(--gray-600)',
                                    color: 'white'
                                }}
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium" style={{ color: 'var(--gray-300)' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        background: 'var(--gray-900)',
                                        border: '1px solid var(--gray-600)',
                                        color: 'white',
                                        width: '100%',
                                        paddingRight: '2.5rem'
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--gray-400)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '0'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            style={{
                                marginTop: '0.5rem',
                                padding: '0.875rem',
                                background: 'linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '0.95rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                        </motion.button>
                    </form>
                </div>

                <p className="text-sm" style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--gray-500)' }}>
                    Restricted access • Authorized personnel only
                </p>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
