import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

type Plan = {
    name: string;
    emoji: string;
    price: string;
    period: string;
    isCurrent?: boolean;
    isPopular?: boolean;
    features: string[];
};

const PLANS: Plan[] = [
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
    const { width } = useWindowDimensions();

    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? Spacing.xxxl : isCompact ? Spacing.md : Spacing.lg;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upgrade to Premium</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: insets.bottom + 40,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.contentInner, isTablet && styles.contentInnerTablet]}>
                    <LinearGradient
                        colors={['#1E2D6B', '#0D1630', '#060D1F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.heroCard, isCompact && styles.heroCardCompact]}
                    >
                        <View style={styles.heroTopRow}>
                            <View style={styles.heroIconWrap}>
                                <Ionicons name="diamond" size={20} color={DarkTheme.brandYellow} />
                            </View>
                            <View style={styles.heroBadge}>
                                <Text style={styles.heroBadgeText}>Student Friendly</Text>
                            </View>
                        </View>
                        <Text style={styles.heroTitle}>Premium plans for campus life</Text>
                        <Text style={styles.heroDesc}>
                            Unlock advanced budgeting, analytics, backups, and shared expense tools with affordable plans.
                        </Text>
                    </LinearGradient>

                    <View style={styles.savingsCard}>
                        <Ionicons name="flash-outline" size={16} color={DarkTheme.income} />
                        <Text style={styles.savingsText}>Save up to 50% compared to most expense apps.</Text>
                    </View>

                    {PLANS.map((plan) => (
                        <View
                            key={plan.name}
                            style={[styles.planCard, plan.isPopular && styles.planCardPopular]}
                        >
                            {plan.isPopular && (
                                <View style={styles.popularBadge}>
                                    <Text style={styles.popularText}>MOST POPULAR</Text>
                                </View>
                            )}

                            <View style={styles.planHeader}>
                                <View>
                                    <Text style={styles.planName}>{plan.name} {plan.emoji}</Text>
                                    <Text style={styles.planSubLabel}>Best for {plan.name === 'Starter' ? 'beginners' : plan.name === 'Campus Pro' ? 'power users' : 'groups'}</Text>
                                </View>
                                <View style={styles.priceWrap}>
                                    <Text style={[styles.planPrice, plan.isPopular && styles.planPricePopular]}>{plan.price}</Text>
                                    <Text style={styles.planPeriod}>{plan.period}</Text>
                                </View>
                            </View>

                            <View style={styles.featuresList}>
                                {plan.features.map((feature) => (
                                    <View key={feature} style={styles.featureRow}>
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
                                    <Ionicons name="checkmark-circle" size={14} color={DarkTheme.income} />
                                    <Text style={styles.currentPlanText}>Current Plan</Text>
                                </View>
                            ) : (
                                <TouchableOpacity
                                    style={[styles.getStartedBtn, plan.isPopular && styles.getStartedBtnPopular]}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.getStartedText, plan.isPopular && styles.getStartedTextPopular]}>
                                        Choose {plan.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}

                    <View style={styles.noteCard}>
                        <Ionicons name="information-circle-outline" size={18} color={DarkTheme.brandYellow} />
                        <Text style={styles.noteText}>
                            Billing integration is coming soon. Plan selection UI is ready and will be enabled in a future release.
                        </Text>
                    </View>
                </View>
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
        paddingVertical: Spacing.md,
    },
    backBtn: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingTop: Spacing.sm,
    },
    contentInner: {
        width: '100%',
    },
    contentInnerTablet: {
        maxWidth: 760,
        alignSelf: 'center',
    },
    heroCard: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        borderWidth: 1,
        borderColor: DarkTheme.borderLight,
        marginBottom: Spacing.md,
        ...NeoShadowSm,
    },
    heroCardCompact: {
        padding: Spacing.lg,
    },
    heroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    heroIconWrap: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(251,191,36,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(251,191,36,0.30)',
    },
    heroBadge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.10)',
    },
    heroBadgeText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
    },
    heroTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '900',
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },
    heroDesc: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        lineHeight: 20,
    },
    savingsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: DarkTheme.incomeBg,
        borderWidth: 1,
        borderColor: DarkTheme.income + '35',
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    savingsText: {
        fontSize: FontSize.sm,
        color: DarkTheme.income,
        fontWeight: '700',
        flex: 1,
    },
    planCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
        marginBottom: Spacing.lg,
    },
    planCardPopular: {
        borderColor: DarkTheme.brandYellow,
        backgroundColor: DarkTheme.cardBgElevated,
    },
    popularBadge: {
        alignSelf: 'flex-end',
        backgroundColor: DarkTheme.brandYellow,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        marginBottom: Spacing.sm,
    },
    popularText: {
        fontSize: FontSize.xs,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.4,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    planName: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: 2,
    },
    planSubLabel: {
        fontSize: FontSize.xs,
        color: DarkTheme.textMuted,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    priceWrap: {
        alignItems: 'flex-end',
    },
    planPrice: {
        fontSize: FontSize.display,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        letterSpacing: -0.4,
    },
    planPricePopular: {
        color: DarkTheme.brandYellow,
    },
    planPeriod: {
        fontSize: FontSize.xs,
        color: DarkTheme.textSecondary,
        fontWeight: '700',
        marginTop: -4,
    },
    featuresList: {
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
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
    currentPlanBtn: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        backgroundColor: DarkTheme.income + '16',
        borderWidth: 1,
        borderColor: DarkTheme.income + '42',
    },
    currentPlanText: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.income,
    },
    getStartedBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm + 2,
        borderRadius: BorderRadius.md,
        backgroundColor: DarkTheme.cardBgElevated,
        borderWidth: 1,
        borderColor: DarkTheme.border,
    },
    getStartedBtnPopular: {
        backgroundColor: DarkTheme.brandYellow,
        borderColor: 'transparent',
        ...NeoShadowSm,
    },
    getStartedText: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    getStartedTextPopular: {
        color: '#FFFFFF',
    },
    noteCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        backgroundColor: DarkTheme.brandYellow + '10',
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: DarkTheme.brandYellow + '30',
    },
    noteText: {
        flex: 1,
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        lineHeight: 20,
    },
});
