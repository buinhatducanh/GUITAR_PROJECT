import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

interface AdminGuardProps {
    children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
    const { isAuthenticated, user } = useAuthStore((state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
    }));

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};
