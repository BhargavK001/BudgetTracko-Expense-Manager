import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';
import StatCard from '@/components/StatCard';
import DonutChart from '@/components/DonutChart';
import { useTransactions, Category, CATEGORY_COLORS, CATEGORY_ICONS } from '@/context/TransactionContext';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatCurrency(n: number): string {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const SimpleBarChart = ({ data, height = 150 }: { data: { label: string, value: number }[], height?: number }) => {
    const max = Math.max(...data.map(d => d.value), 1000);
    const chartHeight = height - 40;
    const barWidth = 40;
    const gap = 20;
    const totalWidth = data.length * (barWidth + gap) - gap;

    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 20 }}>
            <Svg width={totalWidth + 40} height={height}>
                <G x={20}>
                    {data.map((d, i) => {
                        const barHeight = (d.value / max) * chartHeight;
                        return (
                            <G key={i} x={i * (barWidth + gap)}>
                                <Rect
                                    y={chartHeight - barHeight}
                                    width={barWidth}
                                    height={barHeight}
                                    fill={DarkTheme.brandYellow}
                                    rx={4}
                                />
                                <SvgText
                                    x={barWidth / 2}
                                    y={height - 10}
                                    fill={DarkTheme.textSecondary}
                                    fontSize="10"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                >
                                    {d.label}
                                </SvgText>
                                <SvgText
                                    x={barWidth / 2}
                                    y={chartHeight - barHeight - 5}
                                    fill={DarkTheme.textPrimary}
                                    fontSize="8"
                                    fontWeight="900"
                                    textAnchor="middle"
                                >
                                    {d.value > 1000 ? `${(d.value / 1000).toFixed(1)}k` : d.value}
                                </SvgText>
                            </G>
                        );
                    })}
                </G>
            </Svg>
        </ScrollView>
    );
};

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
            if (currentMonthIndex === today.getMonth() && currentYear === today.getFullYear()) {
                end = new Date(today);
                end.setHours(23, 59, 59, 999);
                start = new Date(end);
                start.setDate(end.getDate() - 7);
                start.setHours(0, 0, 0, 0);
            } else {
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

    const trendData = useMemo(() => {
        if (selectedFilter === 'Month') {
            const weeks = [
                { label: 'W1', value: 0 },
                { label: 'W2', value: 0 },
                { label: 'W3', value: 0 },
                { label: 'W4', value: 0 },
            ];
            filteredTxs.filter(t => t.type === 'expense').forEach(t => {
                const day = new Date(t.date).getDate();
                if (day <= 7) weeks[0].value += t.amount;
                else if (day <= 14) weeks[1].value += t.amount;
                else if (day <= 21) weeks[2].value += t.amount;
                else weeks[3].value += t.amount;
            });
            return weeks;
        } else if (selectedFilter === 'Year') {
            const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map(m => ({ label: m, value: 0 }));
            filteredTxs.filter(t => t.type === 'expense').forEach(t => {
                const mIdx = new Date(t.date).getMonth();
                months[mIdx].value += t.amount;
            });
            return months;
        }
        return [];
    }, [filteredTxs, selectedFilter]);

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
            <View style={styles.stickyHeader}>
                <Text style={styles.title}>Analysis</Text>
                <TouchableOpacity style={styles.exportButton}>
                    <Ionicons name="download-outline" size={20} color={DarkTheme.brandYellow} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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

                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <View>
                            <Text style={styles.summaryPeriod}>
                                {selectedFilter === 'Year' ? currentYear : `${MONTHS[currentMonthIndex]} ${currentYear}`}
                            </Text>
                            <Text style={styles.summaryBalanceLabel}>Total Balance</Text>
                        </View>
                        <View style={styles.navButtons}>
                            <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
                                <Ionicons name="chevron-back" size={18} color={DarkTheme.textPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
                                <Ionicons name="chevron-forward" size={18} color={DarkTheme.textPrimary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={[styles.summaryBalance, { color: monthlyBalance >= 0 ? DarkTheme.income : DarkTheme.spending }]}>
                        {monthlyBalance >= 0 ? '+' : ''}{formatCurrency(monthlyBalance)}
                    </Text>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryStats}>
                        <View>
                            <Text style={styles.statMiniLabel}>Income</Text>
                            <Text style={[styles.statMiniValue, { color: DarkTheme.income }]}>{formatCurrency(monthlyIncome)}</Text>
                        </View>
                        <View>
                            <Text style={styles.statMiniLabel}>Expense</Text>
                            <Text style={[styles.statMiniValue, { color: DarkTheme.spending }]}>{formatCurrency(monthlyExpense)}</Text>
                        </View>
                    </View>
                </View>

                {trendData.length > 0 && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Spending Trends</Text>
                        <View style={styles.card}>
                            <Text style={styles.cardSubtitle}>Expense over time</Text>
                            <SimpleBarChart data={trendData} />
                        </View>
                    </View>
                )}

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Expense Categories</Text>
                    <View style={styles.card}>
                        {categoryData.length === 0 ? (
                            <View style={styles.emptyCategory}>
                                <Ionicons name="pie-chart-outline" size={40} color={DarkTheme.textMuted} />
                                <Text style={styles.emptyCategoryText}>No spending data for this selection</Text>
                            </View>
                        ) : (
                            <>
                                <View style={styles.donutContainer}>
                                    <DonutChart data={chartData} size={200} strokeWidth={35} />
                                </View>
                                <View style={styles.categoryList}>
                                    {categoryData.map((cat, index) => (
                                        <View key={index} style={styles.categoryItem}>
                                            <View style={[styles.categoryIcon, { backgroundColor: cat.color + '22' }]}>
                                                <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.categoryName}>{cat.name}</Text>
                                                <View style={styles.progressBg}>
                                                    <View style={[styles.progressFill, { width: `${(cat.amount / Math.max(monthlyExpense, 1)) * 100}%`, backgroundColor: cat.color }]} />
                                                </View>
                                            </View>
                                            <View style={styles.categoryRight}>
                                                <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
                                                <Text style={styles.categoryPercent}>{((cat.amount / Math.max(monthlyExpense, 1)) * 100).toFixed(0)}%</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Financial Insights</Text>
                    <View style={styles.statsGrid}>
                        <View style={styles.insightBox}>
                            <Text style={styles.insightLabel}>Daily Avg</Text>
                            <Text style={styles.insightValue}>{formatCurrency(Math.round(avgSpendingPerDay))}</Text>
                        </View>
                        <View style={styles.insightBox}>
                            <Text style={styles.insightLabel}>Per Transaction</Text>
                            <Text style={styles.insightValue}>{formatCurrency(Math.round(avgSpendingPerTx))}</Text>
                        </View>
                        <View style={styles.insightBox}>
                            <Text style={styles.insightLabel}>Income Avg</Text>
                            <Text style={styles.insightValue}>{formatCurrency(Math.round(avgIncomePerDay))}</Text>
                        </View>
                        <View style={styles.insightBox}>
                            <Text style={styles.insightLabel}>Tx Count</Text>
                            <Text style={styles.insightValue}>{totalTransactions}</Text>
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
    stickyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: DarkTheme.bg,
        borderBottomWidth: 1,
        borderBottomColor: DarkTheme.border,
        zIndex: 10,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    exportButton: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(99,102,241,0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99,102,241,0.3)',
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
    filterRow: {
        flexDirection: 'row',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: 4,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: DarkTheme.border,
    },
    filterChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
    },
    filterChipActive: {
        backgroundColor: DarkTheme.accent,
    },
    filterText: {
        fontSize: FontSize.xs,
        color: DarkTheme.textMuted,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    filterTextActive: {
        color: '#FFFFFF',
        fontWeight: '800',
    },
    summaryCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xl,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: DarkTheme.border,
    },
    summaryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    summaryPeriod: {
        fontSize: 10,
        fontWeight: '800',
        color: DarkTheme.brandYellow,
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 4,
    },
    summaryBalanceLabel: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
    },
    navButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    navButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: DarkTheme.bg,
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    summaryBalance: {
        fontSize: 32,
        fontWeight: '900',
        marginVertical: 4,
    },
    summaryDivider: {
        height: 1,
        backgroundColor: DarkTheme.separator,
        marginVertical: Spacing.lg,
    },
    summaryStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    statMiniLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.textMuted,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    statMiniValue: {
        fontSize: FontSize.md,
        fontWeight: '800',
    },
    sectionContainer: {
        marginBottom: Spacing.xxl,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    card: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
    },
    cardSubtitle: {
        fontSize: 10,
        color: DarkTheme.textMuted,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
        letterSpacing: 0.5,
    },
    donutContainer: {
        alignItems: 'center',
        marginVertical: Spacing.md,
    },
    categoryList: {
        marginTop: Spacing.lg,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        gap: 12,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryName: {
        fontSize: FontSize.sm,
        color: DarkTheme.textPrimary,
        fontWeight: '800',
        marginBottom: 6,
    },
    progressBg: {
        height: 6,
        backgroundColor: DarkTheme.bg,
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    categoryRight: {
        alignItems: 'flex-end',
        minWidth: 70,
    },
    categoryAmount: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    categoryPercent: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.textMuted,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    insightBox: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
    },
    insightLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.textMuted,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    insightValue: {
        fontSize: FontSize.md,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
    },
    emptyCategory: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
        gap: 12,
    },
    emptyCategoryText: {
        fontSize: FontSize.sm,
        color: DarkTheme.textMuted,
        fontWeight: '700',
    },
});
