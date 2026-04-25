import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, StatusBar, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import Animated, { FadeInDown, FadeIn, ZoomIn } from 'react-native-reanimated';
import { useSettings } from '@/context/SettingsContext';

const PLANS = [
    {
        id: 'free',
        name: 'Basic',
        monthlyPrice: 0,
        yearlyPrice: 0,
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
        monthlyPrice: 49,
        yearlyPrice: 499,
        period: '/mo',
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
        id: 'squad',
        name: 'Squad',
        monthlyPrice: 99,
        yearlyPrice: 999,
        period: '/mo',
        desc: 'Team plan for families & groups.',
        features: [
            'All Pro features',
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

    const { user, refreshUser } = useAuth();
    const { formatCurrency } = useSettings();

    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 24;

    const [activePlan, setActivePlan] = useState('pro');
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [loading, setLoading] = useState(false);
    const currentPlan = user?.subscription?.plan || 'free';
    const isActive = user?.subscription?.status === 'active' || user?.subscription?.status === 'authenticated';

    const handleUpgrade = async () => {
        if (activePlan === 'free') {
            router.back();
            return;
        }
        
        // Find selected plan price
        const plan = PLANS.find(p => p.id === activePlan);
        const price = billingPeriod === 'yearly' ? plan?.yearlyPrice : plan?.monthlyPrice;

        if (isActive && currentPlan === activePlan) {
            Alert.alert('Already Subscribed', `You are already on the ${activePlan.toUpperCase()} plan.`);
            return;
        }

        setLoading(true);
        try {
            const planKey = activePlan;
            const res = await api.post('/api/payments/create-order', { 
                plan: planKey,
                billingPeriod: billingPeriod
            });
            const data = res.data;

            if (data.success && data.key && data.subscription_id) {
                // Navigate to in-app Razorpay WebView checkout
                router.push({
                    pathname: '/features/razorpay-checkout',
                    params: {
                        subscriptionId: data.subscription_id,
                        key: data.key,
                        planName: activePlan.toUpperCase(),
                        amount: String(data.amount || ''),
                        email: user?.email || '',
                        name: user?.displayName || '',
                    },
                });
            } else {
                Alert.alert('Error', 'Could not initiate payment. Please try again.');
            }
        } catch (e: any) {
            const msg = e.response?.data?.message || 'Payment failed. Please try again.';
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };
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
                        paddingBottom: insets.bottom + 180,
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.contentInner, isTablet && styles.contentInnerTablet]}>

                    {/* Hero */}
                    <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                        <View style={styles.heroSection}>
                            <View style={styles.heroBadge}>
                                <Ionicons name="sparkles" size={12} color="#F59E0B" />
                                <Text style={styles.heroBadgeText}>PREMIUM FEATURES</Text>
                            </View>
                            <Text style={styles.heroTitle}>Upgrade to Pro</Text>
                            <Text style={styles.heroDesc}>
                                Unleash the full potential of your finances with advanced AI insights and unlimited tracking.
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Billing Toggle */}
                    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.toggleContainer}>
                        <TouchableOpacity
                            style={[styles.toggleBtn, billingPeriod === 'monthly' && styles.toggleBtnActive]}
                            onPress={() => setBillingPeriod('monthly')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.toggleText, billingPeriod === 'monthly' && styles.toggleTextActive]}>Monthly</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.toggleBtn, billingPeriod === 'yearly' && styles.toggleBtnActive]}
                            onPress={() => setBillingPeriod('yearly')}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.toggleText, billingPeriod === 'yearly' && styles.toggleTextActive]}>Yearly</Text>
                            <View style={styles.discountBadge}>
                                <Text style={styles.discountBadgeText}>-20%</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Plans */}
                    <View style={styles.plansContainer}>
                        {PLANS.map((plan, index) => {
                            const isSelected = activePlan === plan.id;
                            const price = billingPeriod === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
                            const periodText = plan.id === 'free' ? 'forever' : (billingPeriod === 'yearly' ? '/yr' : '/mo');

                            return (
                                <Animated.View key={plan.id} entering={FadeInDown.delay(300 + index * 100).duration(500)}>
                                    <TouchableOpacity
                                        onPress={() => setActivePlan(plan.id)}
                                        activeOpacity={0.9}
                                        style={[
                                            styles.planCard,
                                            isSelected && styles.planCardActive,
                                            plan.isPopular && styles.planCardPopular
                                        ]}
                                    >
                                        {plan.isPopular && (
                                            <LinearGradient
                                                colors={['#F59E0B', '#D97706']}
                                                style={styles.popularBadge}
                                            >
                                                <Ionicons name="star" size={10} color="#fff" style={{ marginRight: 4 }} />
                                                <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                                            </LinearGradient>
                                        )}

                                        <View style={styles.planHeader}>
                                            <View style={{ flex: 1 }}>
                                                <View style={styles.planTitleRow}>
                                                    <Text style={[styles.planName, plan.isPopular && styles.planNamePopular]}>{plan.name}</Text>
                                                    {plan.id === 'pro' && <Ionicons name="ribbon" size={16} color={plan.isPopular ? "#F59E0B" : "#6366F1"} style={{ marginLeft: 6 }} />}
                                                </View>
                                                <Text style={[styles.planDesc, plan.isPopular && styles.planDescPopular]}>{plan.desc}</Text>
                                            </View>
                                            <View style={styles.priceWrap}>
                                                <Text style={[styles.planPrice, plan.isPopular && styles.planPricePopular]}>
                                                    {price === 0 ? 'Free' : formatCurrency(price as number)}
                                                </Text>
                                                <Text style={[styles.planPeriod, plan.isPopular && styles.planPeriodPopular]}>{periodText}</Text>
                                            </View>
                                        </View>

                                        <View style={styles.featuresList}>
                                            {plan.features.map((feature, i) => (
                                                <View key={i} style={styles.featureRow}>
                                                    <View style={[styles.checkCircle, plan.isPopular && styles.checkCirclePopular]}>
                                                        <Ionicons
                                                            name="checkmark"
                                                            size={12}
                                                            color={plan.isPopular ? '#fff' : '#6366F1'}
                                                        />
                                                    </View>
                                                    <Text style={[styles.featureText, plan.isPopular && styles.featureTextPopular]}>
                                                        {feature}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </View>
            </ScrollView>

            {/* Bottom CTA */}
            <View style={[styles.bottomCard, { paddingBottom: Math.max(insets.bottom, 24) }]}>
                <TouchableOpacity style={styles.ctaButton} activeOpacity={0.9} onPress={handleUpgrade} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <>
                            <Text style={styles.ctaText}>
                                {activePlan === 'free' ? 'Continue with Basic' : (isActive && currentPlan !== 'free' ? 'Change Plan' : 'Upgrade Now')}
                            </Text>
                            <Ionicons name="arrow-forward" size={18} color="#fff" />
                        </>
                    )}
                </TouchableOpacity>
                <View style={styles.trustRow}>
                    <Ionicons name="shield-checkmark" size={12} color="#8E8E93" />
                    <Text style={styles.trustText}>Secure payment • Cancel anytime</Text>
                </View>
                <Text style={styles.termsText}>
                    By upgrading, you agree to our Terms & Privacy Policy.
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFC',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
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
        paddingTop: 8,
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
        paddingVertical: 24,
        paddingHorizontal: 20,
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(245,158,11,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 16,
    },
    heroBadgeText: {
        fontSize: 10,
        color: '#D97706',
        fontWeight: '800',
        marginLeft: 4,
        letterSpacing: 1,
    },
    heroTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111',
        marginBottom: 10,
        textAlign: 'center',
    },
    heroDesc: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
        fontWeight: '500',
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        marginHorizontal: 20,
        padding: 4,
        borderRadius: 24,
        marginBottom: 24,
    },
    toggleBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 20,
    },
    toggleBtnActive: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#8E8E93',
    },
    toggleTextActive: {
        color: '#111',
    },
    discountBadge: {
        backgroundColor: '#2DCA72',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginLeft: 6,
    },
    discountBadgeText: {
        fontSize: 10,
        color: '#fff',
        fontWeight: '800',
    },
    plansContainer: {
        gap: 16,
        paddingHorizontal: 4,
    },
    planCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        borderWidth: 1.5,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.03,
        shadowRadius: 10,
        elevation: 2,
    },
    planCardActive: {
        borderColor: '#6366F1',
        shadowOpacity: 0.08,
        shadowRadius: 15,
    },
    planCardPopular: {
        backgroundColor: '#1E293B',
        borderColor: '#1E293B',
    },
    popularBadge: {
        position: 'absolute',
        top: -12,
        right: 24,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    popularBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 1,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    planTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    planName: {
        fontSize: 20,
        fontWeight: '900',
        color: '#111',
    },
    planNamePopular: {
        color: '#fff',
    },
    planDesc: {
        fontSize: 13,
        color: '#8E8E93',
        marginTop: 4,
        lineHeight: 18,
        fontWeight: '500',
    },
    planDescPopular: {
        color: 'rgba(255,255,255,0.7)',
    },
    priceWrap: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111',
    },
    planPricePopular: {
        color: '#fff',
    },
    planPeriod: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '700',
    },
    planPeriodPopular: {
        color: 'rgba(255,255,255,0.5)',
    },
    featuresList: {
        gap: 12,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    checkCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: 'rgba(99,102,241,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkCirclePopular: {
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    featureText: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
    },
    featureTextPopular: {
        color: 'rgba(255,255,255,0.9)',
    },
    bottomCard: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        paddingTop: 16,
        paddingHorizontal: 24,
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
    },
    ctaButton: {
        width: '100%',
        height: 56,
        borderRadius: 18,
        backgroundColor: '#6366F1',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 4,
        marginBottom: 12,
    },
    ctaText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    termsText: {
        fontSize: 11,
        color: '#A1A1AA',
        textAlign: 'center',
        lineHeight: 16,
        fontWeight: '500',
    },
    trustRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 8,
    },
    trustText: {
        fontSize: 12,
        color: '#8E8E93',
        fontWeight: '600',
    },
});
