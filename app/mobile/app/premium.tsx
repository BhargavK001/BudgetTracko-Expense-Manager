import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';

const PLANS = [
    {
        id: 'free',
        name: 'Basic',
        price: 'Free',
        period: 'forever',
        desc: 'Essential tracking for everyday needs.',
        features: [
            'Manual expense tracking',
            'Up to 3 basic budgets',
            'Standard categories',
            '1 month history',
        ],
        isPopular: false,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '₹149',
        period: '/month',
        desc: 'Advanced tools for serious savers.',
        features: [
            'AI-powered transaction parsing',
            'Unlimited budgets & bills',
            'Custom categories',
            'Export data to CSV/JSON',
            'Priority support',
        ],
        isPopular: true,
    },
    {
        id: 'lifetime',
        name: 'Lifetime',
        price: '₹3,499',
        period: 'once',
        desc: 'One-time payment for endless value.',
        features: [
            'All Pro features forever',
            'Family sharing (up to 4)',
            'Early access to new features',
            'Direct line to developers',
        ],
        isPopular: false,
    }
];

export default function PremiumScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 24;

    const [activePlan, setActivePlan] = useState('pro');

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <Animated.View entering={FadeIn.delay(50).duration(300)} style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upgrade to Pro</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: insets.bottom + 100,
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.contentInner, isTablet && styles.contentInnerTablet]}>

                    {/* Hero */}
                    <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
                        <View style={styles.heroSection}>
                            <View style={styles.heroGlow} />
                            <Ionicons name="diamond" size={64} color="#F59E0B" />
                            <Text style={styles.heroTitle}>Unlock Your Full Financial Power</Text>
                            <Text style={styles.heroDesc}>
                                Take absolute control with AI-driven insights, limitless tracking, and complete data freedom.
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Plans */}
                    <View style={styles.plansContainer}>
                        {PLANS.map((plan, index) => {
                            const isSelected = activePlan === plan.id;

                            // Animate popular plan with a pop
                            const EnteringAnimation = plan.isPopular
                                ? ZoomIn.delay(200 + index * 100).duration(500).springify()
                                : FadeInDown.delay(200 + index * 100).duration(400).springify();

                            return (
                                <Animated.View key={plan.id} entering={EnteringAnimation}>
                                    <TouchableOpacity
                                        onPress={() => setActivePlan(plan.id)}
                                        activeOpacity={0.9}
                                    >
                                        <LinearGradient
                                            colors={plan.isPopular ? ['#2A2D3A', '#1F222B'] : ['#fff', '#fff']}
                                            style={[
                                                styles.planCard,
                                                isSelected && styles.planCardActive,
                                                plan.isPopular && styles.planCardPopular
                                            ]}
                                        >
                                            {plan.isPopular && (
                                                <View style={styles.popularBadge}>
                                                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                                                </View>
                                            )}

                                            <View style={styles.planHeader}>
                                                <View>
                                                    <Text style={[styles.planName, plan.isPopular && { color: '#fff' }]}>{plan.name}</Text>
                                                    <Text style={[styles.planDesc, plan.isPopular && { color: 'rgba(255,255,255,0.7)' }]}>{plan.desc}</Text>
                                                </View>
                                                <View style={styles.priceWrap}>
                                                    <Text style={[styles.planPrice, plan.isPopular && { color: '#fff' }]}>{plan.price}</Text>
                                                    <Text style={[styles.planPeriod, plan.isPopular && { color: 'rgba(255,255,255,0.5)' }]}>{plan.period}</Text>
                                                </View>
                                            </View>

                                            <View style={styles.featuresList}>
                                                {plan.features.map((feature, i) => (
                                                    <View key={i} style={styles.featureRow}>
                                                        <Ionicons
                                                            name="checkmark-circle"
                                                            size={18}
                                                            color={plan.isPopular ? '#2DCA72' : '#6366F1'}
                                                        />
                                                        <Text style={[styles.featureText, plan.isPopular && { color: '#fff' }]}>
                                                            {feature}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </View>

                                            <View style={[
                                                styles.radioBtn,
                                                isSelected && styles.radioBtnActive,
                                                plan.isPopular && isSelected && { borderColor: '#6366F1' }
                                            ]}>
                                                {isSelected && <View style={[styles.radioDot, plan.isPopular && { backgroundColor: '#6366F1' }]} />}
                                            </View>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <Animated.View entering={FadeInDown.delay(500).duration(400)} style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity style={styles.ctaButton} activeOpacity={0.9}>
                    <LinearGradient
                        colors={['#6366F1', '#4F46E5']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.ctaGradient}
                    >
                        <Text style={styles.ctaText}>
                            {activePlan === 'free' ? 'Continue with Basic' : 'Upgrade Now'}
                        </Text>
                        <Ionicons name="arrow-forward" size={20} color="#fff" />
                    </LinearGradient>
                </TouchableOpacity>
                <Text style={styles.termsText}>
                    By upgrading, you agree to our Terms of Service & Privacy Policy.
                </Text>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        backgroundColor: '#F8FAFC',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 16,
    },
    contentInner: {
        width: '100%',
    },
    contentInnerTablet: {
        maxWidth: 760,
        alignSelf: 'center',
    },
    heroSection: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 16,
        position: 'relative',
    },
    heroGlow: {
        position: 'absolute',
        top: 20,
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: 'rgba(245,158,11,0.15)',
        transform: [{ scale: 1.5 }],
    },
    heroTitle: {
        fontSize: 26,
        fontWeight: '900',
        color: '#111',
        marginTop: 20,
        marginBottom: 12,
        textAlign: 'center',
        lineHeight: 32,
    },
    heroDesc: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    plansContainer: {
        gap: 20,
    },
    planCard: {
        borderRadius: 28,
        padding: 24,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 16,
        elevation: 2,
    },
    planCardActive: {
        borderColor: '#6366F1',
        shadowColor: '#6366F1',
        shadowOpacity: 0.1,
    },
    planCardPopular: {
        borderWidth: 0,
        shadowColor: '#111',
        shadowOpacity: 0.2,
    },
    popularBadge: {
        position: 'absolute',
        top: -14,
        alignSelf: 'center',
        backgroundColor: '#F59E0B',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
        zIndex: 10,
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '900',
        letterSpacing: 1.5,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    planName: {
        fontSize: 22,
        fontWeight: '900',
        color: '#111',
        marginBottom: 6,
    },
    planDesc: {
        fontSize: 13,
        color: '#8E8E93',
        maxWidth: 200,
        lineHeight: 18,
    },
    priceWrap: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111',
    },
    planPeriod: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
        marginTop: 2,
    },
    featuresList: {
        gap: 12,
        marginTop: 8,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    featureText: {
        fontSize: 14,
        color: '#111',
        fontWeight: '500',
        flex: 1,
        lineHeight: 20,
    },
    radioBtn: {
        position: 'absolute',
        top: 24,
        right: 24,
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#C7C7CC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioBtnActive: {
        borderColor: '#6366F1',
    },
    radioDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#6366F1',
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingTop: 20,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    ctaButton: {
        width: '100%',
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    ctaGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
        paddingVertical: 18,
        gap: 10,
    },
    ctaText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: '900',
    },
    termsText: {
        fontSize: 11,
        color: '#A1A1AA',
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 16,
    },
});
