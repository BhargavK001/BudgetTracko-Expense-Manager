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
            <MaterialCommunityIcons name={name} size={size} color="#000000" style={{ opacity: 0.05 }} />
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
        <Container backgroundColor="#FFD700">
            <StatusBar style="dark" />

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
                    <Animated.View
                        entering={FadeInDown.delay(300).springify()}
                        style={[styles.badgeContainer, badgeStyle]}
                    >
                        <Text style={styles.badgeText}>✨ V 1.0 IS LIVE!</Text>
                    </Animated.View>

                    <Animated.Text entering={FadeInDown.delay(400).duration(800)} style={styles.title}>
                        MASTER
                    </Animated.Text>
                    <Animated.Text entering={FadeInDown.delay(500).duration(800)} style={styles.title}>
                        YOUR
                    </Animated.Text>
                    <Animated.Text entering={FadeInDown.delay(600).duration(800)} style={[styles.title, styles.highlight]}>
                        MONEY.
                    </Animated.Text>
                </View>

                <Animated.Text entering={FadeInDown.delay(800).duration(800)} style={styles.subtitle}>
                    Stop guessing where your money goes. Track, analyze, and optimize your spending.
                </Animated.Text>

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
                            style={{ backgroundColor: 'transparent', borderColor: '#000000', borderWidth: 2 }}
                        />
                    </Animated.View>
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        justifyContent: 'center',
        zIndex: 1, // Ensure content is above background icons
    },
    header: {
        marginBottom: 24,
    },
    badgeContainer: {
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: '#000000',
        marginBottom: 24,
        shadowColor: '#000000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '900',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#000000',
        lineHeight: 48,
        letterSpacing: -2,
    },
    highlight: {
        color: '#FFFFFF',
        textShadowColor: '#000000',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 0,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000000',
        lineHeight: 26,
        marginBottom: 48,
    },
    spacer: {
        flex: 1,
    },
    footer: {
        gap: 12,
    },
    floatingIcon: {
        position: 'absolute',
    }
});
