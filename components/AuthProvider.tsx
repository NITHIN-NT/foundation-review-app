"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: { uid: string; email: string; name: string } | null;
    loading: boolean;
    loginViaPin: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    loginViaPin: () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<{ uid: string; email: string; name: string } | null>(null);
    const [loading, setLoading] = useState(true);

    const loginViaPin = () => {
        const adminUser = { uid: 'admin-bypass-id', email: 'admin@foundation.app', name: 'Administrator' };
        localStorage.setItem('auth_pin_verified', 'true');
        setUser(adminUser);
    };

    useEffect(() => {
        const checkAuth = () => {
            // Check if PIN was previously verified
            const isVerified = localStorage.getItem('auth_pin_verified') === 'true';
            if (isVerified) {
                setUser({ uid: 'admin-bypass-id', email: 'admin@foundation.app', name: 'Administrator' });
            }
            setLoading(false);
        };

        // Use a small delay to ensure this runs after initial mount
        const timer = setTimeout(checkAuth, 0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, loginViaPin }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
