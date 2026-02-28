import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../components/Container';
import { Button } from '../components/Button';
import { StatusBar } from 'expo-status-bar';
import Animated, {
    FadeInDown,
    FadeInUp,
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing,
    withDelay
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const FloatingIcon = ({ name, size, startX, startY, delay, duration }: any) => {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = withDelay(
            delay,
            withRepeat(
                withSequence(
                    withTiming(-20, { duration: duration, easing: Easing.inOut(Easing.sin) }),
                    withTiming(0, { duration: duration, easing: Easing.inOut(Easing.sin) })
                ),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    return (
        <Animated.View style={[styles.floatingIcon, { left: startX, top: startY }, animatedStyle]}>
            <MaterialCommunityIcons name={name} size={size} color="#6366F1" style={{ opacity: 0.07 }} />
        </Animated.View>
    );
};

export default function Welcome() {
    const router = useRouter();
    const badgeRotation = useSharedValue(-2);

    useEffect(() => {
        badgeRotation.value = withRepeat(
            withSequence(
                withTiming(2, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
                withTiming(-2, { duration: 1500, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );
    }, []);

    const badgeStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${badgeRotation.value}deg` }]
        };
    });

    return (
        <Container>
            <StatusBar style="light" />

            {/* Background Floating Icons */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <FloatingIcon name="finance" size={80} startX={width * 0.1} startY={height * 0.1} delay={0} duration={3000} />
                <FloatingIcon name="chart-line" size={120} startX={width * 0.7} startY={height * 0.2} delay={1000} duration={4000} />
                <FloatingIcon name="currency-usd" size={60} startX={width * 0.2} startY={height * 0.5} delay={500} duration={3500} />
                <FloatingIcon name="bank-outline" size={90} startX={width * 0.6} startY={height * 0.6} delay={1500} duration={4500} />
                <FloatingIcon name="wallet-outline" size={70} startX={width * 0.8} startY={height * 0.8} delay={200} duration={3800} />
                <FloatingIcon name="credit-card-outline" size={100} startX={width * -0.1} startY={height * 0.7} delay={800} duration={4200} />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    {/* Brand Header */}
                    <Animated.View entering={FadeInDown.delay(200).duration(800)}>
                        <View style={styles.brandHeader}>
                            <Text style={styles.brandText}>BUDGET</Text>
                            <View style={styles.brandAccent}>
                                <Text style={styles.brandAccentText}>TRACKO</Text>
                            </View>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300).springify()}>
                        <Animated.View style={[styles.badgeContainer, badgeStyle]}>
                            <Text style={styles.badgeText}>✨ V 1.0 IS LIVE!</Text>
                        </Animated.View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(400).duration(800)}>
                        <Text style={styles.title}>MASTER</Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(500).duration(800)}>
                        <Text style={styles.title}>YOUR</Text>
                    </Animated.View>
                    <Animated.View entering={FadeInDown.delay(600).duration(800)}>
                        <Text style={[styles.title, styles.highlight]}>MONEY.</Text>
                    </Animated.View>
                </View>

                <Animated.View entering={FadeInDown.delay(800).duration(800)}>
                    <Text style={styles.subtitle}>
                        Stop guessing where your money goes. Track, analyze, and optimize your spending.
                    </Text>
                </Animated.View>

                <View style={styles.spacer} />

                <View style={styles.footer}>
                    <Animated.View entering={FadeInUp.delay(1000).springify()}>
                        <Button
                            title="Start Tracking Free"
                            onPress={() => router.push('/features/track')}
                            variant="primary"
                        />
                    </Animated.View>
                    <Animated.View entering={FadeInUp.delay(1100).springify()}>
                        <Button
                            title="Login"
                            onPress={() => router.push('/(auth)/login')}
                            variant="outline"
                        />
                    </Animated.View>
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    brandHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: 24,
    },
    brandText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#F1F5F9',
    },
    brandAccent: {
        backgroundColor: '#6366F1',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
        transform: [{ rotate: '-2deg' }],
    },
    brandAccentText: {
        fontSize: 24,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        zIndex: 1,
    },
    header: {
        marginBottom: 24,
    },
    badgeContainer: {
        backgroundColor: 'rgba(99,102,241,0.15)',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 1,
        borderColor: 'rgba(99,102,241,0.4)',
        marginBottom: 24,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#A5B4FC',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#F1F5F9',
        lineHeight: 52,
        letterSpacing: -1.5,
    },
    highlight: {
        color: '#A5B4FC',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#94A3B8',
        lineHeight: 24,
        marginBottom: 48,
    },
    spacer: {
        flex: 1,
    },
    footer: {
        gap: 8,
    },
    floatingIcon: {
        position: 'absolute',
    }
});
