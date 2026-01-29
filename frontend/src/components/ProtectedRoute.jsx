import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles, allowSuperuser = false }) => {
    const { user, loading } = useAuth();

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p>Loading session...</p>
        </div>
    );

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const isAuthorized = (allowedRoles && allowedRoles.includes(user.role)) || (allowSuperuser && user.is_superuser);

    if (allowedRoles && !isAuthorized) {
        return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/reviewer'} replace />;
    }

    return children;
};

export default ProtectedRoute;
