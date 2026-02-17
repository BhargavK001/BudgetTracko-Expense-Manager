import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Container } from '../../components/Container';
import { Button } from '../../components/Button';
import Animated, { FadeInUp, FadeInDown, ZoomIn, useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export default function SecurityFeature() {
    const router = useRouter();
    const shieldPulse = useSharedValue(1);

    useEffect(() => {
        shieldPulse.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedShieldStyle = useAnimatedStyle(() => ({
        transform: [{ scale: shieldPulse.value }],
    }));

    return (
        <Container backgroundColor="#1a1a1a">
            <StatusBar style="light" />

            <View style={styles.content}>
                {/* Visual Section */}
                <View style={styles.visualContainer}>
                    <View style={styles.shieldContainer}>
                        {/* Background Circles */}
                        <Animated.View style={[styles.pulseCircle, styles.pulseCircle1, animatedShieldStyle]} />
                        <Animated.View style={[styles.pulseCircle, styles.pulseCircle2, animatedShieldStyle]} />

                        {/* Main Shield */}
                        <Animated.View entering={ZoomIn.delay(200).springify()}>
                            <View style={styles.shield}>
                                <MaterialCommunityIcons name="shield-check" size={80} color="#1a1a1a" />
                            </View>
                        </Animated.View>

                        {/* Floating Badges */}
                        <Animated.View entering={FadeInDown.delay(400).springify()}>
                            <View style={[styles.badge, styles.badgeTopRight]}>
                                <MaterialCommunityIcons name="lock" size={20} color="#FFFFFF" />
                            </View>
                        </Animated.View>
                        <Animated.View entering={FadeInDown.delay(600).springify()}>
                            <View style={[styles.badge, styles.badgeBottomLeft]}>
                                <MaterialCommunityIcons name="eye-off" size={20} color="#FFFFFF" />
                            </View>
                        </Animated.View>
                    </View>
                </View>

                {/* Text Content */}
                <View style={styles.textContent}>
                    <Animated.View entering={FadeInUp.delay(300)}>
                        <View style={styles.stepContainer}>
                            <Text style={styles.step}>03 / 04</Text>
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(400)}>
                        <Text style={styles.title}>
                            BANK-GRADE
                            {'\n'}
                            SECURITY.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeInUp.delay(500)}>
                        <Text style={styles.description}>
                            Your data is encrypted and 100% private. We never share your financial details.
                        </Text>
                    </Animated.View>
                </View>

                {/* Footer Navigation */}
                <View style={styles.footer}>
                    <Button
                        title="Skip"
                        onPress={() => router.push('/(auth)/login')}
                        variant="outline"
                        style={styles.skipButton}
                        textStyle={{ color: '#FFFFFF', fontSize: 14 }}
                    />
                    <Button
                        title="Next"
                        onPress={() => router.push('/features/offline')}
                        variant="primary" // Changed to primary (yellow) for contrast on dark bg
                        style={styles.nextButton}
                    />
                </View>
            </View>
        </Container>
    );
}

const styles = StyleSheet.create({
    content: {
        flex: 1,
        // Removed space-between
        paddingVertical: Platform.OS === 'ios' ? 20 : 40,
    },
    visualContainer: {
        // Removed flex: 1
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
        minHeight: 300, // Guarantee space for shield
    },
    shieldContainer: {
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    pulseCircle: {
        position: 'absolute',
        borderRadius: 999,
        borderWidth: 2,
        borderColor: '#333333',
    },
    pulseCircle1: {
        width: 240,
        height: 240,
        opacity: 0.5,
    },
    pulseCircle2: {
        width: 300,
        height: 300,
        opacity: 0.3,
    },
    shield: {
        width: 140,
        height: 160,
        backgroundColor: '#4ADE80',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30, // Shield-ish shape approximation
        borderBottomLeftRadius: 70,
        borderBottomRightRadius: 70,
        borderWidth: 4,
        borderColor: '#FFFFFF',
        shadowColor: '#4ADE80',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    badge: {
        position: 'absolute',
        backgroundColor: '#333333',
        padding: 12,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeTopRight: {
        top: 0,
        right: 0,
    },
    badgeBottomLeft: {
        bottom: 0,
        left: 0,
    },
    textContent: {
        paddingHorizontal: 24,
        marginBottom: 30,
        marginTop: 0,
    },
    stepContainer: {
        backgroundColor: '#333333',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 16,
    },
    step: {
        fontSize: 12,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    title: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFFFFF',
        lineHeight: 44,
        letterSpacing: -1,
        marginBottom: 16,
        textTransform: 'uppercase',
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#AAAAAA', // Light gray for readability on dark
        fontWeight: '500',
        maxWidth: '90%',
    },
    footer: {
        flexDirection: 'row',
        paddingHorizontal: 24,
        gap: 16,
        marginBottom: 10,
    },
    skipButton: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: 'transparent',
        borderColor: '#FFFFFF', // For type safety, though width 0 hides it
    },
    nextButton: {
        flex: 2,
    },
});
