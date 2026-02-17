import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';
import StatCard from '@/components/StatCard';
import DonutChart from '@/components/DonutChart';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const CATEGORY_DATA = [
    { name: 'Enjoyment', icon: 'headset-outline' as const, color: '#4CAF50', amount: 1283, change: '+12728.0%', changeType: 'up' as const },
    { name: 'Food and Dining', icon: 'restaurant-outline' as const, color: '#FF9800', amount: 1137, change: '-73.5%', changeType: 'down' as const },
    { name: 'Friend', icon: 'people-outline' as const, color: '#7C4DFF', amount: 125, change: '-20.4%', changeType: 'down' as const },
    { name: 'Due', icon: 'document-text-outline' as const, color: '#2196F3', amount: 122, change: '-95.2%', changeType: 'down' as const },
    { name: 'Health/Self Groom', icon: 'heart-outline' as const, color: '#E91E63', amount: 4, change: '-99.7%', changeType: 'down' as const },
];

const CHART_DATA = CATEGORY_DATA.map(c => ({ value: c.amount, color: c.color, label: c.name }));

const STATS = {
    totalTransactions: 39,
    avgSpendingPerDay: '₹157.1',
    avgSpendingPerTx: '₹72.17',
    avgIncomePerDay: '₹588.2',
    avgIncomePerTx: '₹10,000',
};

type TimeFilter = 'Week' | 'Month' | 'Year' | 'Custom';

export default function AnalysisScreen() {
    const insets = useSafeAreaInsets();
    const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('Month');
    const [currentMonthIndex, setCurrentMonthIndex] = useState(1);
    const currentYear = 2026;

    const goToPrevMonth = () => setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : 11));
    const goToNextMonth = () => setCurrentMonthIndex((prev) => (prev < 11 ? prev + 1 : 0));

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Sticky Header ─── */}
            <View style={styles.stickyHeader}>
                <Text style={styles.title}>Analysis</Text>
                <TouchableOpacity style={styles.downloadBtn}>
                    <Ionicons name="download-outline" size={18} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Time Filter */}
                <View style={styles.filterRow}>
                    {(['Week', 'Month', 'Year', 'Custom'] as TimeFilter[]).map((filter) => (
                        <TouchableOpacity
                            key={filter}
                            style={[styles.filterChip, selectedFilter === filter && styles.filterChipActive]}
                            onPress={() => setSelectedFilter(filter)}
                        >
                            <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={goToPrevMonth} style={styles.monthArrow}>
                        <Ionicons name="chevron-back" size={20} color={DarkTheme.textPrimary} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>{MONTHS[currentMonthIndex]} {currentYear}</Text>
                    <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
                        <Ionicons name="chevron-forward" size={20} color={DarkTheme.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Stat Cards */}
                <View style={styles.statsRow}>
                    <StatCard label="Spending" amount="₹2,670" type="spending" />
                    <StatCard label="Income" amount="₹10,000" type="income" />
                </View>

                {/* Balance */}
                <View style={styles.balancePill}>
                    <Text style={styles.balanceText}>Balance: ₹7,330</Text>
                </View>

                {/* Budget Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Budget</Text>
                    <View style={styles.card}>
                        <Text style={styles.budgetTitle}>No Budget for This Month?</Text>
                        <Text style={styles.budgetDesc}>
                            Setting a budget for your spending is a crucial step in achieving your financial goals.
                        </Text>
                        <TouchableOpacity style={styles.budgetButton}>
                            <Text style={styles.budgetButtonText}>Set Up Budget</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Categories Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <View style={styles.card}>
                        <Text style={styles.cardSubtitle}>Category-wise spending</Text>
                        <DonutChart data={CHART_DATA} size={220} strokeWidth={38} />
                        {CATEGORY_DATA.map((cat, index) => (
                            <View key={index} style={styles.categoryItem}>
                                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '22' }]}>
                                    <Ionicons name={cat.icon} size={18} color={cat.color} />
                                </View>
                                <Text style={styles.categoryName}>{cat.name}</Text>
                                <View style={styles.categoryRight}>
                                    <Text style={styles.categoryAmount}>₹{cat.amount.toLocaleString()}</Text>
                                    <Text style={[
                                        styles.categoryChange,
                                        { color: cat.changeType === 'up' ? DarkTheme.income : DarkTheme.spending }
                                    ]}>
                                        {cat.change}
                                    </Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Stats</Text>
                    <View style={styles.card}>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Number of transactions</Text>
                            <Text style={styles.statValue}>{STATS.totalTransactions}</Text>
                        </View>
                        <Text style={styles.statSubHeader}>Average spending</Text>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabelIndented}>Per day</Text>
                            <Text style={styles.statValue}>{STATS.avgSpendingPerDay}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabelIndented}>Per transaction</Text>
                            <Text style={styles.statValue}>{STATS.avgSpendingPerTx}</Text>
                        </View>
                        <Text style={styles.statSubHeader}>Average income</Text>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabelIndented}>Per day</Text>
                            <Text style={styles.statValue}>{STATS.avgIncomePerDay}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabelIndented}>Per transaction</Text>
                            <Text style={styles.statValue}>{STATS.avgIncomePerTx}</Text>
                        </View>
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DarkTheme.bg,
    },
    // Sticky Header
    stickyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: DarkTheme.bg,
        borderBottomWidth: 2,
        borderBottomColor: DarkTheme.neoBorder,
        zIndex: 10,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    downloadBtn: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
    },
    // Time Filter
    filterRow: {
        flexDirection: 'row',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.sm,
        padding: 3,
        marginBottom: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    filterChip: {
        flex: 1,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm - 2,
        alignItems: 'center',
    },
    filterChipActive: {
        backgroundColor: DarkTheme.brandYellow,
    },
    filterText: {
        fontSize: FontSize.sm,
        color: DarkTheme.textMuted,
        fontWeight: '700',
    },
    filterTextActive: {
        color: DarkTheme.brandBlack,
        fontWeight: '800',
    },
    // Month Selector
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    monthArrow: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    monthText: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: DarkTheme.textPrimary,
    },
    // Stats Row
    statsRow: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
    },
    // Balance pill
    balancePill: {
        alignSelf: 'center',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.sm,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.xxl,
    },
    balanceText: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        fontWeight: '600',
    },
    // Sections
    sectionContainer: {
        marginBottom: Spacing.xxl,
    },
    sectionTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.brandYellow,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Generic Card
    card: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.xl,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    cardSubtitle: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    // Budget
    budgetTitle: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: Spacing.sm,
    },
    budgetDesc: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    budgetButton: {
        alignSelf: 'flex-start',
        borderWidth: 2,
        borderColor: DarkTheme.brandYellow,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
    },
    budgetButtonText: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.brandYellow,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Categories
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        borderTopWidth: 1,
        borderTopColor: DarkTheme.separator,
    },
    categoryIcon: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    categoryName: {
        flex: 1,
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '600',
    },
    categoryRight: {
        alignItems: 'flex-end',
    },
    categoryAmount: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: DarkTheme.textPrimary,
    },
    categoryChange: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        marginTop: 2,
    },
    // Stats
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
    },
    statLabel: {
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '600',
    },
    statLabelIndented: {
        fontSize: FontSize.md,
        color: DarkTheme.textSecondary,
        paddingLeft: Spacing.lg,
    },
    statSubHeader: {
        fontSize: FontSize.sm,
        color: DarkTheme.brandYellow,
        fontWeight: '800',
        marginTop: Spacing.md,
        paddingBottom: Spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    statValue: {
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '700',
    },
});
