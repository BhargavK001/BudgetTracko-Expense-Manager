import React, { useEffect, useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    StatusBar, ActivityIndicator, Platform, Dimensions,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import Animated, {
    FadeIn, FadeInDown, FadeInUp,
    useSharedValue, useAnimatedStyle,
    withRepeat, withSequence, withTiming, withSpring,
    Easing, interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function LockScreen() {
    const { unlockApp, logout, user } = useAuth();
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Animations
    const pulse = useSharedValue(0);
    const ring1 = useSharedValue(0);
    const ring2 = useSharedValue(0);
    const lockShake = useSharedValue(0);

    useEffect(() => {
        // Pulsing glow on the center button
        pulse.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
                withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
            ), -1, false,
        );
        // Expanding ring animations (staggered)
        ring1.value = withRepeat(
            withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
            -1, false,
        );
        setTimeout(() => {
            ring2.value = withRepeat(
                withTiming(1, { duration: 2400, easing: Easing.out(Easing.ease) }),
                -1, false,
            );
        }, 1200);
        // Auto-trigger biometric on mount
        handleUnlock();
    }, []);

    const pulseStyle = useAnimatedStyle(() => ({
        opacity: interpolate(pulse.value, [0, 1], [0.4, 0.9]),
        transform: [{ scale: interpolate(pulse.value, [0, 1], [0.95, 1.05]) }],
    }));

    const ring1Style = useAnimatedStyle(() => ({
        opacity: interpolate(ring1.value, [0, 0.6, 1], [0.6, 0.2, 0]),
        transform: [{ scale: interpolate(ring1.value, [0, 1], [1, 2.2]) }],
    }));

    const ring2Style = useAnimatedStyle(() => ({
        opacity: interpolate(ring2.value, [0, 0.6, 1], [0.5, 0.15, 0]),
        transform: [{ scale: interpolate(ring2.value, [0, 1], [1, 2.2]) }],
    }));

    const shakeStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: lockShake.value }],
    }));

    const triggerShake = () => {
        lockShake.value = withSequence(
            withTiming(-10, { duration: 60 }),
            withTiming(10, { duration: 60 }),
            withTiming(-8, { duration: 60 }),
            withTiming(8, { duration: 60 }),
            withTiming(0, { duration: 60 }),
        );
    };

    const handleUnlock = async () => {
        setIsAuthenticating(true);
        setError(null);
        try {
            const success = await unlockApp();
            if (!success) {
                setError('Authentication failed. Try again.');
                triggerShake();
            }
        } catch (e: any) {
            setError(e.message || 'Authentication error');
            triggerShake();
        } finally {
            setIsAuthenticating(false);
        }
    };

    const displayName = user?.displayName || 'User';
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* Background Gradient */}
            <LinearGradient
                colors={['#050B18', '#0A1628', '#0D1D35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative blobs */}
            <View style={styles.blobTopLeft} />
            <View style={styles.blobBottomRight} />

            {/* Top: User info */}
            <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.topSection}>
                <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>{initials}</Text>
                </View>
                <Text style={styles.welcomeBack}>Welcome back</Text>
                <Text style={styles.userName}>{displayName}</Text>
            </Animated.View>

            {/* Center: Lock button with rings */}
            <Animated.View style={[styles.centerSection, shakeStyle]}>
                {/* Expanding rings */}
                <Animated.View style={[styles.ring, ring1Style]} />
                <Animated.View style={[styles.ring, ring2Style]} />

                {/* Glow behind button */}
                <Animated.View style={[styles.glow, pulseStyle]} />

                {/* Main auth button */}
                <TouchableOpacity
                    onPress={handleUnlock}
                    disabled={isAuthenticating}
                    activeOpacity={0.85}
                >
                    <Animated.View style={[styles.authBtn, pulseStyle]}>
                        <LinearGradient
                            colors={['#7C3AED', '#6366F1', '#4F46E5']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.authBtnGradient}
                        >
                            {isAuthenticating ? (
                                <ActivityIndicator color="#fff" size="large" />
                            ) : (
                                <Ionicons
                                    name={Platform.OS === 'ios' ? 'scan-outline' : 'finger-print'}
                                    size={44}
                                    color="#fff"
                                />
                            )}
                        </LinearGradient>
                    </Animated.View>
                </TouchableOpacity>
            </Animated.View>

            {/* Hint text */}
            <Animated.View entering={FadeInUp.delay(400).duration(500)} style={styles.hintSection}>
                <Text style={styles.hintTitle}>
                    {isAuthenticating ? 'Authenticating…' : 'Tap to unlock'}
                </Text>
                <Text style={styles.hintSub}>
                    Use your {Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'fingerprint'} to continue
                </Text>

                {error ? (
                    <Animated.View entering={FadeIn} style={styles.errorBadge}>
                        <Ionicons name="alert-circle-outline" size={14} color="#F87171" />
                        <Text style={styles.errorText}>{error}</Text>
                    </Animated.View>
                ) : null}
            </Animated.View>

            {/* Bottom actions */}
            <Animated.View entering={FadeInUp.delay(600).duration(500)} style={styles.bottomSection}>
                <TouchableOpacity style={styles.retryBtn} onPress={handleUnlock} activeOpacity={0.8}>
                    <MaterialCommunityIcons name="refresh" size={18} color="#A5B4FC" />
                    <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={16} color="#6B7280" />
                    <Text style={styles.logoutText}>Sign Out</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Powered by badge */}
            <View style={styles.badge}>
                <MaterialCommunityIcons name="shield-check" size={12} color="#4ADE80" />
                <Text style={styles.badgeText}>BudgetTracko Secure</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 60 },

    // Blobs
    blobTopLeft: {
        position: 'absolute', top: -80, left: -80,
        width: 260, height: 260, borderRadius: 130,
        backgroundColor: 'rgba(99,102,241,0.12)',
    },
    blobBottomRight: {
        position: 'absolute', bottom: -100, right: -60,
        width: 300, height: 300, borderRadius: 150,
        backgroundColor: 'rgba(45,202,114,0.07)',
    },

    // Top user block
    topSection: { alignItems: 'center', marginTop: 20 },
    avatarCircle: {
        width: 72, height: 72, borderRadius: 36,
        backgroundColor: 'rgba(99,102,241,0.2)',
        borderWidth: 2, borderColor: 'rgba(99,102,241,0.4)',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 14,
    },
    avatarText: { fontSize: 24, fontWeight: '900', color: '#A5B4FC' },
    welcomeBack: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.4)', marginBottom: 4, letterSpacing: 0.5 },
    userName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },

    // Center lock
    centerSection: { alignItems: 'center', justifyContent: 'center', width: 200, height: 200 },
    ring: {
        position: 'absolute',
        width: 130, height: 130, borderRadius: 65,
        borderWidth: 1.5, borderColor: 'rgba(99,102,241,0.5)',
    },
    glow: {
        position: 'absolute',
        width: 130, height: 130, borderRadius: 65,
        backgroundColor: 'rgba(99,102,241,0.18)',
    },
    authBtn: {
        width: 110, height: 110, borderRadius: 55,
        shadowColor: '#6366F1', shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.6, shadowRadius: 24, elevation: 20,
    },
    authBtnGradient: {
        width: 110, height: 110, borderRadius: 55,
        justifyContent: 'center', alignItems: 'center',
    },

    // Hint text
    hintSection: { alignItems: 'center', paddingHorizontal: 40 },
    hintTitle: { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 8, textAlign: 'center' },
    hintSub: { fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: '500', textAlign: 'center' },
    errorBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        marginTop: 16, backgroundColor: 'rgba(248,113,113,0.12)',
        paddingHorizontal: 16, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, borderColor: 'rgba(248,113,113,0.25)',
    },
    errorText: { color: '#F87171', fontSize: 13, fontWeight: '600' },

    // Bottom
    bottomSection: {
        width: width - 64,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20, paddingVertical: 4,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
    },
    retryBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16,
    },
    retryText: { color: '#A5B4FC', fontSize: 15, fontWeight: '700' },
    divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.07)', marginHorizontal: 16 },
    logoutBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: 8, paddingVertical: 16,
    },
    logoutText: { color: '#6B7280', fontSize: 14, fontWeight: '600' },

    // Badge
    badge: {
        flexDirection: 'row', alignItems: 'center', gap: 5,
        position: 'absolute', bottom: 28,
    },
    badgeText: { fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: '700', letterSpacing: 0.5 },
});
