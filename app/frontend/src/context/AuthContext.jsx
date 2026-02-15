import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api, { setCsrfToken } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch current user from cookie-authenticated endpoint
    const fetchUser = useCallback(async () => {
        try {
            const res = await api.get('/auth/me');
            if (res.data?.user) {
                setUser(res.data.user);
            } else {
                setUser(null);
            }
        } catch (error) {
            // 401 means no valid cookie/token — user is not logged in
            if (error.response?.status === 401 || error.response?.status === 403) {
                setUser(null);
            } else {
                // Network or server error — don't log out, silently keep session
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        const initAuth = async () => {
            try {
                // Ensure CSRF token is set by making a GET request
                const { data } = await api.get('/api/csrf-token');
                // Store the token in memory so it can be used even if the
                // cross-origin cookie isn't readable from document.cookie
                if (data?.csrfToken) {
                    setCsrfToken(data.csrfToken);
                }
            } catch (e) {
                console.error("Failed to initialize CSRF token", e);
            }
            fetchUser();
        };
        initAuth();
    }, [fetchUser]);

    // Listen for 401 events from axios interceptor (auto-logout)
    useEffect(() => {
        const handleUnauthorized = () => {
            setUser(null);
        };
        window.addEventListener('auth:unauthorized', handleUnauthorized);
        return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
    }, []);

    // Login is now handled by cookie set by the backend on OAuth callback
    // This function is called after redirect to refresh user state
    const login = useCallback(async () => {
        setLoading(true);
        await fetchUser();
    }, [fetchUser]);

    const logout = useCallback(async () => {
        try {
            await api.get('/auth/logout');
        } catch {
            // Logout request failed — clear local state anyway
        }
        setUser(null);
    }, []);

    return (
        <AuthContext.Provider value={{ user, setUser, loading, login, logout, refreshUser: fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
