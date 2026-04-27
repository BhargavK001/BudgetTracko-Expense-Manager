import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import * as localDB from '@/services/localDB';

interface User {
    id: string;
    displayName: string;
    email: string;
    avatar?: string;
    photoURL?: string; // Add for compatibility
    createdAt?: string;
    subscription?: {
        plan: string;
        status: string;
    };
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    isBiometricSupported: boolean;
    hasBiometricKey: boolean;
    isLocked: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    completeSocialLogin: (token: string, user: User) => Promise<void>;
    checkAuth: () => Promise<void>;
    refreshUser: () => Promise<void>;
    enableBiometricLogin: () => Promise<boolean>;
    disableBiometricLogin: () => Promise<void>;
    loginWithBiometrics: () => Promise<void>;
    lockApp: () => void;
    unlockApp: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isBiometricSupported, setIsBiometricSupported] = useState(false);
    const [hasBiometricKey, setHasBiometricKey] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const BIOMETRIC_STORAGE_KEY = 'budgettracko_biometric_token';

    const checkBiometricSupport = async () => {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();
        setIsBiometricSupported(compatible && enrolled);

        if (compatible && enrolled) {
            const storedKey = await SecureStore.getItemAsync(BIOMETRIC_STORAGE_KEY);
            setHasBiometricKey(!!storedKey);
        }
    };

    const checkAuth = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('token');
            const storedUser = await AsyncStorage.getItem('user');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));

                // Optional: Verify token with /me endpoint
                try {
                    const response = await api.get('/auth/me');
                    if (response.data.user) {
                        setUser(response.data.user);
                        await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                    }
                } catch (e) {
                    // If /me fails, token might be invalid
                    await logout();
                }
                // Check if we should lock
                const compatible = await LocalAuthentication.hasHardwareAsync();
                const enrolled = await LocalAuthentication.isEnrolledAsync();
                if (compatible && enrolled) {
                    const storedKey = await SecureStore.getItemAsync(BIOMETRIC_STORAGE_KEY);
                    if (storedKey) setIsLocked(true);
                }
            }
        } catch (error) {
            console.error('Failed to load auth state', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        try {
            const response = await api.get('/auth/me');
            if (response.data.user) {
                setUser(response.data.user);
                await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
            }
        } catch (e) {
            console.error('Failed to refresh user', e);
        }
    };

    useEffect(() => {
        checkAuth();
        checkBiometricSupport();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, data: user } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            const response = await api.post('/auth/signup', { displayName: name, email, password });
            const { token, data: user } = response.data;

            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Signup failed');
        }
    };

    const logout = async () => {
        try {
            // Clear local sync cache
            localDB.clearAll();
            await AsyncStorage.multiRemove(['token', 'user']);
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            await api.post('/auth/forgotpassword', { email });
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to send reset email');
        }
    };

    const completeSocialLogin = async (token: string, user: User) => {
        try {
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(user));

            setToken(token);
            setUser(user);
        } catch (error) {
            console.error('Social login completion failed', error);
        }
    };

    const enableBiometricLogin = async (): Promise<boolean> => {
        if (!token) return false;

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to enable biometric login',
                disableDeviceFallback: true,
                cancelLabel: 'Cancel'
            });

            if (result.success) {
                await SecureStore.setItemAsync(BIOMETRIC_STORAGE_KEY, token);
                setHasBiometricKey(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to enable biometrics', error);
            return false;
        }
    };

    const disableBiometricLogin = async () => {
        try {
            await SecureStore.deleteItemAsync(BIOMETRIC_STORAGE_KEY);
            setHasBiometricKey(false);
        } catch (error) {
            console.error('Failed to disable biometrics', error);
        }
    };

    const loginWithBiometrics = async () => {
        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Sign in to BudgetTracko',
                fallbackLabel: 'Use Passcode',
                cancelLabel: 'Cancel'
            });

            if (result.success) {
                setLoading(true);
                const storedBiometricToken = await SecureStore.getItemAsync(BIOMETRIC_STORAGE_KEY);

                if (storedBiometricToken) {
                    setToken(storedBiometricToken);
                    await AsyncStorage.setItem('token', storedBiometricToken);

                    try {
                        const response = await api.get('/auth/me');
                        if (response.data.user) {
                            setUser(response.data.user);
                            await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
                        }
                    } catch (e) {
                        await logout();
                        throw new Error('Biometric session expired. Please log in normally.');
                    }
                } else {
                    throw new Error('No biometric key found');
                }
            } else {
                throw new Error('Biometric authentication failed or was cancelled.');
            }
        } catch (error: any) {
            throw new Error(error.message || 'Biometric login failed');
        } finally {
            setLoading(false);
        }
    };

    const lockApp = () => {
        if (hasBiometricKey) setIsLocked(true);
    };

    const unlockApp = async (): Promise<boolean> => {
        if (!hasBiometricKey) {
            setIsLocked(false);
            return true;
        }

        try {
            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock BudgetTracko',
                fallbackLabel: 'Use Passcode',
            });

            if (result.success) {
                setIsLocked(false);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Unlock failed', error);
            return false;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!token,
                loading,
                isBiometricSupported,
                hasBiometricKey,
                isLocked,
                login,
                signup,
                logout,
                forgotPassword,
                completeSocialLogin,
                checkAuth,
                refreshUser,
                enableBiometricLogin,
                disableBiometricLogin,
                loginWithBiometrics,
                lockApp,
                unlockApp,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
