import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    withSpring,
    withDelay,
    withSequence,
    withRepeat,
    Easing,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
    onComplete: () => void;
}

export default function AnimatedSplash({ onComplete }: AnimatedSplashProps) {
    // ── Shared values for each animation phase ──
    const logoScale = useSharedValue(0);
    const logoRotate = useSharedValue(-30);
    const logoOpacity = useSharedValue(0);

    const ringScale1 = useSharedValue(0);
    const ringScale2 = useSharedValue(0);
    const ringOpacity1 = useSharedValue(0);
    const ringOpacity2 = useSharedValue(0);

    const budgetX = useSharedValue(-width);
    const trackoX = useSharedValue(width);
    const textOpacity = useSharedValue(0);

    const taglineY = useSharedValue(30);
    const taglineOpacity = useSharedValue(0);

    const dot1Opacity = useSharedValue(0);
    const dot2Opacity = useSharedValue(0);
    const dot3Opacity = useSharedValue(0);

    const lineWidth = useSharedValue(0);

    const exitScale = useSharedValue(1);
    const exitOpacity = useSharedValue(1);

    useEffect(() => {
        // ── Phase 1: Logo entrance (0ms) ──
        logoOpacity.value = withTiming(1, { duration: 600 });
        logoScale.value = withSpring(1, {
            damping: 8,
            stiffness: 80,
            mass: 1,
        });
        logoRotate.value = withSpring(0, {
            damping: 10,
            stiffness: 60,
        });

        // ── Phase 1b: Expanding rings (300ms) ──
        ringScale1.value = withDelay(300, withTiming(2.5, { duration: 1000, easing: Easing.out(Easing.ease) }));
        ringOpacity1.value = withDelay(300, withSequence(
            withTiming(0.4, { duration: 400 }),
            withTiming(0, { duration: 600 })
        ));
        ringScale2.value = withDelay(550, withTiming(2.5, { duration: 1000, easing: Easing.out(Easing.ease) }));
        ringOpacity2.value = withDelay(550, withSequence(
            withTiming(0.3, { duration: 400 }),
            withTiming(0, { duration: 600 })
        ));

        // ── Phase 2: Brand text slides in (900ms) ──
        budgetX.value = withDelay(900, withSpring(0, { damping: 14, stiffness: 70 }));
        trackoX.value = withDelay(1050, withSpring(0, { damping: 14, stiffness: 70 }));
        textOpacity.value = withDelay(900, withTiming(1, { duration: 500 }));

        // ── Phase 3: Decorative line expands (1500ms) ──
        lineWidth.value = withDelay(1500, withTiming(width * 0.5, { duration: 800, easing: Easing.out(Easing.ease) }));

        // ── Phase 4: Tagline fades up (1800ms) ──
        taglineOpacity.value = withDelay(1800, withTiming(1, { duration: 600 }));
        taglineY.value = withDelay(1800, withSpring(0, { damping: 15, stiffness: 60 }));

        // ── Phase 5: Loading dots pulse (2200ms) ──
        dot1Opacity.value = withDelay(2200, withRepeat(
            withSequence(
                withTiming(1, { duration: 350 }),
                withTiming(0.2, { duration: 350 })
            ), 3, false
        ));
        dot2Opacity.value = withDelay(2400, withRepeat(
            withSequence(
                withTiming(1, { duration: 350 }),
                withTiming(0.2, { duration: 350 })
            ), 3, false
        ));
        dot3Opacity.value = withDelay(2600, withRepeat(
            withSequence(
                withTiming(1, { duration: 350 }),
                withTiming(0.2, { duration: 350 })
            ), 3, false
        ));

        // ── Phase 6: Exit animation (3500ms) ──
        exitScale.value = withDelay(3500, withTiming(1.15, { duration: 450, easing: Easing.in(Easing.ease) }));
        exitOpacity.value = withDelay(3500, withTiming(0, { duration: 450, easing: Easing.in(Easing.ease) }));

        // ── Complete after exit ──
        const timer = setTimeout(() => {
            onComplete();
        }, 4000);

        return () => clearTimeout(timer);
    }, []);

    // ── Animated Styles ──
    const logoStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: logoScale.value },
            { rotate: `${logoRotate.value}deg` },
        ],
        opacity: logoOpacity.value,
    }));

    const ring1Style = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale1.value }],
        opacity: ringOpacity1.value,
    }));

    const ring2Style = useAnimatedStyle(() => ({
        transform: [{ scale: ringScale2.value }],
        opacity: ringOpacity2.value,
    }));

    const budgetStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: budgetX.value }],
        opacity: textOpacity.value,
    }));

    const trackoStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: trackoX.value }],
        opacity: textOpacity.value,
    }));

    const taglineStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: taglineY.value }],
        opacity: taglineOpacity.value,
    }));

    const dot1Style = useAnimatedStyle(() => ({
        opacity: dot1Opacity.value,
    }));
    const dot2Style = useAnimatedStyle(() => ({
        opacity: dot2Opacity.value,
    }));
    const dot3Style = useAnimatedStyle(() => ({
        opacity: dot3Opacity.value,
    }));

    const lineStyle = useAnimatedStyle(() => ({
        width: lineWidth.value,
    }));

    const exitStyle = useAnimatedStyle(() => ({
        transform: [{ scale: exitScale.value }],
        opacity: exitOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, exitStyle]}>
            {/* Background subtle pattern */}
            <View style={styles.bgPattern}>
                {[...Array(6)].map((_, i) => (
                    <View
                        key={i}
                        style={[
                            styles.bgCircle,
                            {
                                width: 200 + i * 80,
                                height: 200 + i * 80,
                                borderRadius: 100 + i * 40,
                                opacity: 0.03 - i * 0.004,
                            },
                        ]}
                    />
                ))}
            </View>

            {/* Center content */}
            <View style={styles.centerContent}>
                {/* Expanding rings */}
                <Animated.View style={[styles.ring, ring1Style]} />
                <Animated.View style={[styles.ring, ring2Style]} />

                {/* Logo Icon */}
                <Animated.View style={[styles.logoContainer, logoStyle]}>
                    <View style={styles.logoInner}>
                        <MaterialCommunityIcons name="wallet" size={48} color="#FFFFFF" />
                    </View>
                </Animated.View>

                {/* Brand Name */}
                <View style={styles.brandRow}>
                    <Animated.View style={budgetStyle}>
                        <Text style={styles.brandBudget}>BUDGET</Text>
                    </Animated.View>
                    <Animated.View style={[styles.trackoBadge, trackoStyle]}>
                        <Text style={styles.brandTracko}>TRACKO</Text>
                    </Animated.View>
                </View>

                {/* Decorative Line */}
                <View style={styles.lineContainer}>
                    <Animated.View style={[styles.decorativeLine, lineStyle]} />
                </View>

                {/* Tagline */}
                <Animated.View style={taglineStyle}>
                    <Text style={styles.tagline}>Master Your Money</Text>
                </Animated.View>

                {/* Loading Dots */}
                <View style={styles.dotsContainer}>
                    <Animated.View style={[styles.dot, dot1Style]} />
                    <Animated.View style={[styles.dot, dot2Style]} />
                    <Animated.View style={[styles.dot, dot3Style]} />
                </View>
            </View>

            {/* Bottom version text */}
            <View style={styles.bottomContent}>
                <Text style={styles.versionText}>v1.0.0</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#060D1F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgPattern: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgCircle: {
        position: 'absolute',
        borderWidth: 1,
        borderColor: '#6366F1',
    },
    centerContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    ring: {
        position: 'absolute',
        width: 80,
        height: 80,
        borderRadius: 40,
        borderWidth: 2,
        borderColor: 'rgba(99,102,241,0.4)',
    },
    logoContainer: {
        marginBottom: 32,
    },
    logoInner: {
        width: 88,
        height: 88,
        borderRadius: 20,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 16,
    },
    brandBudget: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    trackoBadge: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
        transform: [{ rotate: '-2deg' }],
    },
    brandTracko: {
        fontSize: 34,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 2,
    },
    lineContainer: {
        height: 3,
        marginBottom: 16,
        alignItems: 'center',
    },
    decorativeLine: {
        height: 3,
        backgroundColor: '#6366F1',
        borderRadius: 2,
        opacity: 0.6,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '600',
        color: '#94A3B8',
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 40,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#6366F1',
    },
    bottomContent: {
        position: 'absolute',
        bottom: 50,
    },
    versionText: {
        fontSize: 12,
        color: '#666666',
        fontWeight: '600',
        letterSpacing: 1,
    },
});
