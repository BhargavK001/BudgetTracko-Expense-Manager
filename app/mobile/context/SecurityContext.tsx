import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState, AppStateStatus, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { DarkTheme } from '@/constants/Theme';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface SecurityContextType {
    isAppLockEnabled: boolean;
    setAppLockEnabled: (enabled: boolean) => Promise<void>;
    authenticate: () => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(true);
    const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);
    const [isCheckingLock, setIsCheckingLock] = useState(true);

    // Initial Load
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedValue = await AsyncStorage.getItem('appLockEnabled');
                const isEnabled = storedValue === 'true';
                setIsAppLockEnabled(isEnabled);
                if (isEnabled) {
                    setIsUnlocked(false);
                }
            } catch (error) {
                console.error('Failed to load app lock settings', error);
            } finally {
                setIsCheckingLock(false);
            }
        };
        loadSettings();
    }, []);

    // Monitor App State changes (background/foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', nextAppState => {
            if (
                appState.match(/inactive|background/) &&
                nextAppState === 'active' &&
                isAppLockEnabled
            ) {
                // App came to foreground - lock it if enabled
                setIsUnlocked(false);
            } else if (nextAppState.match(/inactive|background/) && isAppLockEnabled) {
                // App went to background - blur immediately
                setIsUnlocked(false);
            }
            setAppState(nextAppState);
        });

        return () => subscription.remove();
    }, [appState, isAppLockEnabled]);

    // Trigger Authentication
    useEffect(() => {
        if (!isUnlocked && isAppLockEnabled && appState === 'active') {
            authenticate();
        }
    }, [isUnlocked, isAppLockEnabled, appState]);

    const setAppLockEnabled = async (enabled: boolean) => {
        try {
            await AsyncStorage.setItem('appLockEnabled', String(enabled));
            setIsAppLockEnabled(enabled);
            if (enabled && !isUnlocked) {
                await authenticate();
            }
        } catch (error) {
            console.error('Failed to save app lock settings', error);
        }
    };

    const authenticate = async (): Promise<boolean> => {
        try {
            const hasHardware = await LocalAuthentication.hasHardwareAsync();
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();

            if (!hasHardware || !isEnrolled) {
                // If the device doesn't support it or the user hasn't set up Biometrics/PIN, let them pass
                setIsUnlocked(true);
                return true;
            }

            const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Unlock BudgetTracko',
                fallbackLabel: 'Use PIN',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });

            if (result.success) {
                setIsUnlocked(true);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Authentication Error:', error);
            return false;
        }
    };

    if (isCheckingLock) {
        return null; // or a splash screen
    }

    return (
        <SecurityContext.Provider value={{ isAppLockEnabled, setAppLockEnabled, authenticate }}>
            {children}

            {/* Lock Overlay */}
            {!isUnlocked && isAppLockEnabled && (
                <Animated.View exiting={FadeOut.duration(300)} style={StyleSheet.absoluteFillObject}>
                    <BlurView intensity={100} tint="dark" style={styles.overlay}>
                        <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.content}>
                            <View style={styles.iconWrap}>
                                <Ionicons name="lock-closed" size={48} color="#06B6D4" />
                            </View>
                            <Text style={styles.title}>BudgetTracko Locked</Text>
                            <Text style={styles.subtitle}>Use Face ID or PIN to view your budget.</Text>

                            <TouchableOpacity onPress={authenticate} style={styles.btn} activeOpacity={0.8}>
                                <Text style={styles.btnTxt}>Unlock App</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </BlurView>
                </Animated.View>
            )}
        </SecurityContext.Provider>
    );
}

export function useSecurity() {
    const ctx = useContext(SecurityContext);
    if (!ctx) throw new Error('useSecurity must be used within SecurityProvider');
    return ctx;
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999999, // Ensure it's above everything
    },
    content: {
        alignItems: 'center',
        padding: 40,
    },
    iconWrap: {
        width: 100, height: 100, borderRadius: 50,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 24, borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.2)',
    },
    title: { fontSize: 24, fontWeight: '900', color: '#fff', marginBottom: 12 },
    subtitle: { fontSize: 16, color: '#A1A1AA', textAlign: 'center', marginBottom: 40 },
    btn: {
        backgroundColor: '#06B6D4', paddingHorizontal: 32, paddingVertical: 16,
        borderRadius: 100, minWidth: 200, alignItems: 'center',
    },
    btnTxt: { fontSize: 16, fontWeight: '800', color: '#fff' }
});
