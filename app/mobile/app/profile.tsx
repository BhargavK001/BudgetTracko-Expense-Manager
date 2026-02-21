import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const stats = [
        { label: 'Transactions', value: '42', icon: 'list-outline', color: '#2196F3' },
        { label: 'Accounts', value: '3', icon: 'wallet-outline', color: '#4CAF50' },
        { label: 'Budgets', value: '5', icon: 'pie-chart-outline', color: '#FF9800' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={40} color={DarkTheme.brandYellow} />
                    </View>
                    <Text style={styles.userName}>Bhargav Karande</Text>
                    <Text style={styles.userEmail}>bhargav@example.com</Text>
                    <View style={styles.badgeContainer}>
                        <View style={styles.premiumBadge}>
                            <Ionicons name="diamond" size={12} color={DarkTheme.brandBlack} />
                            <Text style={styles.premiumText}>PREMIUM</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Grid */}
                <View style={styles.statsGrid}>
                    {stats.map((stat, index) => (stat.label !== '' &&
                        <View key={index} style={styles.statCard}>
                            <View style={[styles.statIcon, { backgroundColor: stat.color + '22' }]}>
                                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                            </View>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Account Details */}
                <Text style={styles.sectionTitle}>Account Details</Text>
                <View style={styles.detailsContainer}>
                    <DetailItem label="Member Since" value="Feb 2024" icon="calendar-outline" />
                    <DetailItem label="Account Type" value="Local Mode" icon="business-outline" />
                    <DetailItem label="Data Backup" value="Enabled" icon="cloud-done-outline" />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function DetailItem({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <View style={styles.detailItem}>
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
    // Profile Header
    profileHeader: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: BorderRadius.md,
        backgroundColor: DarkTheme.cardBgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 3,
        borderColor: DarkTheme.brandYellow,
        ...NeoShadowSm,
    },
    userName: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: FontSize.md,
        color: DarkTheme.textSecondary,
        marginBottom: Spacing.md,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    premiumBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: DarkTheme.brandYellow,
        paddingHorizontal: Spacing.md,
        paddingVertical: 4,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
        borderColor: DarkTheme.brandBlack,
    },
    premiumText: {
        fontSize: 10,
        fontWeight: '900',
        color: DarkTheme.brandBlack,
    },
    // Stats Grid
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xxl,
        gap: Spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
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
    },
    // Details
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: DarkTheme.brandYellow,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    detailsContainer: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        overflow: 'hidden',
    },
    detailItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: DarkTheme.separator,
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
});
