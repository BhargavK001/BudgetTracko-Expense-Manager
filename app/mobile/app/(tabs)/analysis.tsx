import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';
import StatCard from '@/components/StatCard';
import DonutChart from '@/components/DonutChart';
import { useTransactions, Category, CATEGORY_COLORS, CATEGORY_ICONS } from '@/context/TransactionContext';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatCurrency(n: number): string {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

type TimeFilter = 'Week' | 'Month' | 'Year';

export default function AnalysisScreen() {
    const insets = useSafeAreaInsets();
    const { transactions } = useTransactions();

    const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('Month');
    const now = new Date();
    const [currentMonthIndex, setCurrentMonthIndex] = useState(now.getMonth());
    const [currentYear, setCurrentYear] = useState(now.getFullYear());

    const goToPrevMonth = () => {
        if (currentMonthIndex === 0) {
            setCurrentMonthIndex(11);
            setCurrentYear((y) => y - 1);
        } else {
            setCurrentMonthIndex((prev) => prev - 1);
        }
    };

    const goToNextMonth = () => {
        if (currentMonthIndex === 11) {
            setCurrentMonthIndex(0);
            setCurrentYear((y) => y + 1);
        } else {
            setCurrentMonthIndex((prev) => prev + 1);
        }
    };

    // Calculate Date Range based on filter
    const dateRange = useMemo(() => {
        let start = new Date(currentYear, currentMonthIndex, 1);
        let end = new Date(currentYear, currentMonthIndex + 1, 0, 23, 59, 59, 999);

        if (selectedFilter === 'Year') {
            start = new Date(currentYear, 0, 1);
            end = new Date(currentYear, 11, 31, 23, 59, 59, 999);
        } else if (selectedFilter === 'Week') {
            const today = new Date();
            // If viewing current month/year, show last 7 days from today
            if (currentMonthIndex === today.getMonth() && currentYear === today.getFullYear()) {
                end = new Date(today);
                end.setHours(23, 59, 59, 999);
                start = new Date(end);
                start.setDate(end.getDate() - 7);
                start.setHours(0, 0, 0, 0);
            } else {
                // Else show first 7 days of that month
                start = new Date(currentYear, currentMonthIndex, 1);
                end = new Date(currentYear, currentMonthIndex, 7, 23, 59, 59, 999);
            }
        }
        return { start, end };
    }, [selectedFilter, currentMonthIndex, currentYear]);

    // Local filtered transactions
    const filteredTxs = useMemo(() => {
        const { start, end } = dateRange;
        return transactions.filter((t) => {
            const d = new Date(t.date);
            return d >= start && d <= end;
        });
    }, [transactions, dateRange]);

    const monthlyIncome = useMemo(() =>
        filteredTxs.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
        [filteredTxs]);

    const monthlyExpense = useMemo(() =>
        filteredTxs.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
        [filteredTxs]);

    const monthlyBalance = monthlyIncome - monthlyExpense;

    const categoryData = useMemo(() => {
        const expenses = filteredTxs.filter(t => t.type === 'expense');
        const map = new Map<Category, number>();
        expenses.forEach((t) => {
            map.set(t.category, (map.get(t.category) || 0) + t.amount);
        });
        return Array.from(map.entries())
            .map(([name, amount]) => ({
                name,
                amount,
                color: CATEGORY_COLORS[name] || '#795548',
                icon: CATEGORY_ICONS[name] || 'ellipsis-horizontal-circle-outline',
            }))
            .sort((a, b) => b.amount - a.amount);
    }, [filteredTxs]);

    const chartData = useMemo(() => categoryData.map((c) => ({ value: c.amount, color: c.color, label: c.name })), [categoryData]);

    const totalTransactions = filteredTxs.length;
    const diffTime = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
    const daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const avgSpendingPerDay = totalTransactions > 0 ? monthlyExpense / daysInRange : 0;
    const expenseTxCount = filteredTxs.filter((t) => t.type === 'expense').length;
    const avgSpendingPerTx = expenseTxCount > 0 ? monthlyExpense / expenseTxCount : 0;
    const incomeTxCount = filteredTxs.filter((t) => t.type === 'income').length;
    const avgIncomePerDay = monthlyIncome / daysInRange;
    const avgIncomePerTx = incomeTxCount > 0 ? monthlyIncome / incomeTxCount : 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Sticky Header ─── */}
            <View style={styles.stickyHeader}>
                <Text style={styles.title}>Analysis</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Time Filter */}
                <View style={styles.filterRow}>
                    {(['Week', 'Month', 'Year'] as TimeFilter[]).map((filter) => (
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
                    <Text style={styles.monthText}>
                        {selectedFilter === 'Year'
                            ? currentYear
                            : selectedFilter === 'Week'
                                ? `${MONTHS[currentMonthIndex]} (Week)`
                                : `${MONTHS[currentMonthIndex]} ${currentYear}`
                        }
                    </Text>
                    <TouchableOpacity onPress={goToNextMonth} style={styles.monthArrow}>
                        <Ionicons name="chevron-forward" size={20} color={DarkTheme.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Stat Cards */}
                <View style={styles.statsRow}>
                    <StatCard label="Spending" amount={formatCurrency(monthlyExpense)} type="spending" />
                    <StatCard label="Income" amount={formatCurrency(monthlyIncome)} type="income" />
                </View>

                {/* Balance */}
                <View style={styles.balancePill}>
                    <Text style={styles.balanceText}>Balance: {formatCurrency(monthlyBalance)}</Text>
                </View>

                {/* Categories Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Categories</Text>
                    <View style={styles.card}>
                        {categoryData.length === 0 ? (
                            <View style={styles.emptyCategory}>
                                <Ionicons name="pie-chart-outline" size={40} color={DarkTheme.textMuted} />
                                <Text style={styles.emptyCategoryText}>No spending data for this selection</Text>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.cardSubtitle}>Category-wise spending</Text>
                                <DonutChart data={chartData} size={220} strokeWidth={38} />
                                {categoryData.map((cat, index) => (
                                    <View key={index} style={styles.categoryItem}>
                                        <View style={[styles.categoryIcon, { backgroundColor: cat.color + '22' }]}>
                                            <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                                        </View>
                                        <Text style={styles.categoryName}>{cat.name}</Text>
                                        <View style={styles.categoryRight}>
                                            <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </View>
                </View>

                {/* Stats Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Stats</Text>
                    <View style={styles.card}>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Number of transactions</Text>
                            <Text style={styles.statValue}>{totalTransactions}</Text>
                        </View>
                        <Text style={styles.statSubHeader}>Average spending</Text>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabelIndented}>Per day</Text>
                            <Text style={styles.statValue}>{formatCurrency(Math.round(avgSpendingPerDay))}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabelIndented}>Per transaction</Text>
                            <Text style={styles.statValue}>{formatCurrency(Math.round(avgSpendingPerTx))}</Text>
                        </View>
                        <Text style={styles.statSubHeader}>Average income</Text>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabelIndented}>Per day</Text>
                            <Text style={styles.statValue}>{formatCurrency(Math.round(avgIncomePerDay))}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabelIndented}>Per transaction</Text>
                            <Text style={styles.statValue}>{formatCurrency(Math.round(avgIncomePerTx))}</Text>
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
    // Empty category
    emptyCategory: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        gap: Spacing.sm,
    },
    emptyCategoryText: {
        fontSize: FontSize.sm,
        color: DarkTheme.textMuted,
        fontWeight: '600',
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
