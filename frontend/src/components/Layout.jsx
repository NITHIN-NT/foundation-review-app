import React, { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, ChevronDown } from 'lucide-react';

const Layout = () => {
    const { user, logout } = useAuth();
    const [theme, setTheme] = useState(() => {
        return document.documentElement.getAttribute('data-theme') || 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');

    return (
        <div style={{ minHeight: '100vh' }}>
            <nav style={{
                position: 'sticky',
                top: 0,
                background: 'var(--surface)',
                borderBottom: '1px solid var(--border)',
                zIndex: 100
            }}>
                <div className="container flex items-center justify-between" style={{ padding: '1rem 2rem' }}>
                    <Link to="/" className="flex items-center gap-2" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <img src="/logo.png" alt="Foundation Logo" style={{ height: '24px', width: 'auto' }} />
                        <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>
                            Foundation
                        </span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} className="btn btn-ghost btn-icon">
                            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        <div className="flex items-center gap-2" style={{
                            padding: '0.5rem 0.75rem',
                            background: 'var(--hover)',
                            borderRadius: '100px'
                        }}>
                            <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '0.75rem' }}>
                                {user?.first_name?.[0]}
                            </div>
                            <span className="text-sm font-medium">{user?.first_name}</span>
                            <span className="badge" style={{ marginLeft: '0.25rem' }}>{user?.role}</span>
                        </div>

                        <button onClick={logout} className="btn btn-ghost btn-icon" title="Logout">
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="container animate-in" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Outlet />
                </motion.div>
            </main>
        </div>
    );
};

export default Layout;
