import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { user } = useAuth();

    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? Spacing.xxxl : isCompact ? Spacing.md : Spacing.lg;

    const displayName = user?.displayName || 'BudgetTracko User';
    const email = user?.email || 'Authenticated mode';
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');
    const plan = user?.subscription?.plan || 'Free Plan';
    const memberSince = 'Feb 2024';

    const stats = [
        { label: 'Transactions', value: '42', icon: 'list-outline', color: '#3B82F6' },
        { label: 'Accounts', value: '3', icon: 'wallet-outline', color: '#10B981' },
        { label: 'Budgets', value: '5', icon: 'pie-chart-outline', color: '#F59E0B' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: insets.bottom + 36,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.contentInner, isTablet && styles.contentInnerTablet]}>
                    <LinearGradient
                        colors={['#1E2D6B', '#0D1630', '#060D1F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.profileHero, isCompact && styles.profileHeroCompact]}
                    >
                        <View style={styles.heroBlobTL} />
                        <View style={styles.heroBlobBR} />

                        <View style={styles.profileHeaderRow}>
                            <View style={styles.avatar}>
                                {initials ? (
                                    <Text style={styles.avatarInitials}>{initials}</Text>
                                ) : (
                                    <Ionicons name="person" size={32} color={DarkTheme.textAccent} />
                                )}
                            </View>
                            <View style={styles.profileTextWrap}>
                                <Text style={styles.userName} numberOfLines={1}>{displayName}</Text>
                                <Text style={styles.userEmail} numberOfLines={1}>{email}</Text>
                            </View>
                        </View>

                        <View style={styles.badgeContainer}>
                            <View style={styles.premiumBadge}>
                                <Ionicons name="diamond" size={12} color={'#FFFFFF'} />
                                <Text style={styles.premiumText}>{plan.toUpperCase()}</Text>
                            </View>
                            <View style={styles.memberSinceChip}>
                                <Ionicons name="calendar-outline" size={12} color={DarkTheme.textSecondary} />
                                <Text style={styles.memberSinceText}>Since {memberSince}</Text>
                            </View>
                        </View>
                    </LinearGradient>

                    <View style={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statCard}>
                                <View style={[styles.statIcon, { backgroundColor: stat.color + '22' }]}>
                                    <Ionicons name={stat.icon as any} size={18} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </View>
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Account Details</Text>
                    <View style={styles.detailsContainer}>
                        <DetailItem label="Member Since" value={memberSince} icon="calendar-outline" />
                        <DetailItem label="Account Type" value="Authenticated" icon="business-outline" />
                        <DetailItem label="Data Backup" value="Enabled" icon="cloud-done-outline" isLast />
                    </View>

                    <View style={styles.profileActionsCard}>
                        <TouchableOpacity style={styles.profileActionBtn} activeOpacity={0.8}>
                            <Ionicons name="create-outline" size={16} color={DarkTheme.textPrimary} />
                            <Text style={styles.profileActionText}>Edit Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.profileActionBtn, styles.profileActionBtnAlt]} activeOpacity={0.8}>
                            <Ionicons name="sparkles-outline" size={16} color={DarkTheme.textAccent} />
                            <Text style={[styles.profileActionText, { color: DarkTheme.textAccent }]}>Manage Plan</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function DetailItem({ label, value, icon, isLast }: { label: string; value: string; icon: string; isLast?: boolean }) {
    return (
        <View style={[styles.detailItem, isLast && styles.detailItemLast]}>
            <View style={styles.detailLeft}>
                <Ionicons name={icon as any} size={18} color={DarkTheme.textSecondary} />
                <Text style={styles.detailLabel}>{label}</Text>
            </View>
            <Text style={styles.detailValue}>{value}</Text>
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
        fontSize: FontSize.xl,
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

    profileHero: {
        borderRadius: BorderRadius.xl,
        padding: Spacing.xl,
        marginBottom: Spacing.xxl,
        borderWidth: 1,
        borderColor: DarkTheme.borderLight,
        overflow: 'hidden',
        ...NeoShadowSm,
    },
    profileHeroCompact: {
        padding: Spacing.lg,
    },
    heroBlobTL: {
        position: 'absolute',
        top: -35,
        left: -35,
        width: 140,
        height: 140,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(99,102,241,0.15)',
    },
    heroBlobBR: {
        position: 'absolute',
        bottom: -45,
        right: -35,
        width: 170,
        height: 170,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(139,92,246,0.10)',
    },
    profileHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.md,
    },
    avatar: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.lg,
        backgroundColor: 'rgba(13,22,48,0.65)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: DarkTheme.border,
        ...NeoShadowSm,
    },
    avatarInitials: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    profileTextWrap: {
        flex: 1,
        minWidth: 0,
    },
    userName: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: 2,
    },
    userEmail: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(99,102,241,0.30)',
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: 'rgba(165,180,252,0.35)',
    },
    memberSinceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: Spacing.sm,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        backgroundColor: 'rgba(255,255,255,0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
    },
    memberSinceText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
    },
    premiumText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#FFFFFF',
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xxl,
        gap: Spacing.sm,
    },
    statCard: {
        flex: 1,
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: DarkTheme.border,
    },
    statIcon: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    statValue: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    statLabel: {
        fontSize: 10,
        color: DarkTheme.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        textAlign: 'center',
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.textMuted,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: 2,
    },
    detailsContainer: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: DarkTheme.separator,
    },
    detailItemLast: {
        borderBottomWidth: 0,
    },
    detailLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    detailLabel: {
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: FontSize.md,
        color: DarkTheme.textSecondary,
        fontWeight: '500',
    },
    profileActionsCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
        padding: Spacing.sm,
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    profileActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        backgroundColor: DarkTheme.cardBgElevated,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: DarkTheme.border,
        paddingVertical: Spacing.sm + 2,
    },
    profileActionBtnAlt: {
        backgroundColor: 'rgba(99,102,241,0.12)',
        borderColor: 'rgba(99,102,241,0.28)',
    },
    profileActionText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: DarkTheme.textPrimary,
    },
});

