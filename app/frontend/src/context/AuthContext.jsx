import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                } else if (res.status === 401 || res.status === 403) {
                    // Only clear token on explicit auth failures (invalid/expired token)
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                } else {
                    // For other errors (500, 429, network issues), keep the token
                    // and try to decode basic user info from it
                    console.warn('Auth check returned status:', res.status, '— keeping token');
                    try {
                        const payload = JSON.parse(atob(token.split('.')[1]));
                        setUser({ _id: payload.id, email: payload.email, displayName: payload.email?.split('@')[0] || 'User' });
                    } catch {
                        // Can't decode, still keep token — next API call will verify
                    }
                }
            } catch (error) {
                // Network error — don't log out, keep token for when connection restores
                console.error('Error fetching user (keeping session):', error);
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    setUser({ _id: payload.id, email: payload.email, displayName: payload.email?.split('@')[0] || 'User' });
                } catch {
                    // Can't decode, still keep token
                }
            }
            setLoading(false);
        };

        fetchUser();
    }, [token]);

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        setToken(newToken);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, setUser, token, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
