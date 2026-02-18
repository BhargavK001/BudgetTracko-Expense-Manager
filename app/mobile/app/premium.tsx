import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

const PLANS = [
    {
        name: 'Starter',
        emoji: '🎒',
        price: '₹0',
        period: 'forever',
        isCurrent: true,
        features: [
            'Track up to 50 transactions/month',
            'Basic dashboard & spending charts',
            'Dark & Light mode',
            'Single account (cash / UPI)',
            'Mobile friendly design',
            'Perfect for pocket money tracking',
        ],
    },
    {
        name: 'Campus Pro',
        emoji: '🎓',
        price: '₹49',
        period: '/month',
        isPopular: true,
        features: [
            'Unlimited transactions',
            'Advanced analytics & monthly reports',
            'Multi-account (Cash, UPI, Bank, Cards)',
            'Cloud backup & sync across devices',
            'Budget alerts before you overspend',
            'Recurring entries (rent, subscriptions)',
            'Custom categories (food, travel, books)',
            'Priority support via email',
        ],
    },
    {
        name: 'Hostel Squad',
        emoji: '🏠',
        price: '₹99',
        period: '/month',
        features: [
            'Everything in Campus Pro',
            'Up to 5 roommates / friends',
            'Split expenses & shared budgets',
            'Group analytics & reports',
            'Export to CSV / PDF',
            'Dedicated support',
            'Great for flatmates & hostel groups',
        ],
    },
];

export default function PremiumScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Premium</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero */}
                <View style={styles.hero}>
                    <Text style={styles.heroTitle}>STUDENT PRICING</Text>
                    <Text style={styles.heroDesc}>
                        Built for students & college life. Affordable plans that won't burn a hole in your pocket. 🤞
                    </Text>
                </View>

                {/* Plans */}
                {PLANS.map((plan, index) => (
                    <View
                        key={index}
                        style={[
                            styles.planCard,
                            plan.isPopular && styles.planCardPopular,
                        ]}
                    >
                        {plan.isPopular && (
                            <View style={styles.popularBadge}>
                                <Text style={styles.popularText}>MOST POPULAR</Text>
                            </View>
                        )}

                        <View style={styles.planHeader}>
                            <Text style={styles.planName}>
                                {plan.name} {plan.emoji}
                            </Text>
                            <View style={styles.priceRow}>
                                <Text style={[styles.planPrice, plan.isPopular && styles.planPricePopular]}>
                                    {plan.price}
                                </Text>
                                <Text style={styles.planPeriod}>{plan.period}</Text>
                            </View>
                        </View>

                        <View style={styles.featuresList}>
                            {plan.features.map((feature, fi) => (
                                <View key={fi} style={styles.featureRow}>
                                    <Ionicons
                                        name="checkmark-circle"
                                        size={16}
                                        color={plan.isPopular ? DarkTheme.brandYellow : DarkTheme.income}
                                    />
                                    <Text style={styles.featureText}>{feature}</Text>
                                </View>
                            ))}
                        </View>

                        {plan.isCurrent ? (
                            <View style={styles.currentPlanBtn}>
                                <Text style={styles.currentPlanText}>Current Plan</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={[styles.getStartedBtn, plan.isPopular && styles.getStartedBtnPopular]}
                                activeOpacity={0.8}
                            >
                                <Text
                                    style={[styles.getStartedText, plan.isPopular && styles.getStartedTextPopular]}
                                >
                                    Get Started
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ))}

                {/* Note */}
                <View style={styles.noteCard}>
                    <Ionicons name="information-circle" size={18} color={DarkTheme.brandYellow} />
                    <Text style={styles.noteText}>
                        Premium features are coming soon! You'll be notified when they're available.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DarkTheme.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: DarkTheme.neoBorder,
    },
    backBtn: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    // Hero
    hero: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    heroTitle: {
        fontSize: FontSize.xxl + 2,
        fontWeight: '900',
        color: DarkTheme.brandYellow,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
    },
    heroDesc: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Plan Card
    planCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.xl,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        marginBottom: Spacing.lg,
    },
    planCardPopular: {
        borderColor: DarkTheme.brandYellow,
        borderWidth: 2.5,
        backgroundColor: '#0D0D0D',
    },
    popularBadge: {
        alignSelf: 'flex-end',
        backgroundColor: DarkTheme.textPrimary,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
        marginBottom: Spacing.sm,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    popularText: {
        fontSize: FontSize.xs - 1,
        fontWeight: '900',
        color: DarkTheme.brandBlack,
        letterSpacing: 0.5,
    },
    planHeader: {
        marginBottom: Spacing.lg,
    },
    planName: {
        fontSize: FontSize.lg,
        fontWeight: '900',
        color: DarkTheme.brandYellow,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    priceRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: Spacing.xs,
    },
    planPrice: {
        fontSize: 36,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
    },
    planPricePopular: {
        color: DarkTheme.brandYellow,
    },
    planPeriod: {
        fontSize: FontSize.sm,
        color: DarkTheme.textMuted,
        fontWeight: '600',
        marginLeft: Spacing.xs,
    },
    // Features
    featuresList: {
        gap: Spacing.sm + 2,
        marginBottom: Spacing.xl,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    featureText: {
        fontSize: FontSize.sm,
        color: DarkTheme.textPrimary,
        fontWeight: '500',
        flex: 1,
        lineHeight: 18,
    },
    // Buttons
    currentPlanBtn: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.income + '15',
        borderWidth: 1.5,
        borderColor: DarkTheme.income + '44',
    },
    currentPlanText: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.income,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    getStartedBtn: {
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.textPrimary,
        borderWidth: 2,
        borderColor: DarkTheme.neoBorder,
    },
    getStartedBtnPopular: {
        backgroundColor: DarkTheme.brandYellow,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadowSm,
    },
    getStartedText: {
        fontSize: FontSize.md,
        fontWeight: '900',
        color: DarkTheme.brandBlack,
        letterSpacing: 0.5,
    },
    getStartedTextPopular: {
        color: DarkTheme.brandBlack,
    },
    // Note
    noteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: DarkTheme.brandYellow + '10',
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.brandYellow + '33',
    },
    noteText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        lineHeight: 20,
    },
});
