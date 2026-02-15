import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-[#f0f0f0] dark:bg-[#1a1a1a]">
                <div className="w-8 h-8 border-4 border-[#1a1a1a] dark:border-[#f0f0f0] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children ? children : <Outlet />;
};

export default PublicRoute;
