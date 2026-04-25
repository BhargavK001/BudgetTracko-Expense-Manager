import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, InteractionManager, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';
import StatCard from '@/components/StatCard';
import DonutChart from '@/components/DonutChart';
import { useTransactions, Category, CATEGORY_COLORS, CATEGORY_ICONS, mapCategoryIcon } from '@/context/TransactionContext';
import Svg, { Rect, G, Text as SvgText } from 'react-native-svg';
import DateTimePicker from '@react-native-community/datetimepicker';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const { width } = Dimensions.get('window');

import { useSettings } from '@/context/SettingsContext';
import * as Haptics from 'expo-haptics';

type TimeFilter = 'Week' | 'Month' | 'Year' | 'Custom';

const SimpleBarChart = React.memo(({ data, height = 150 }: { data: { label: string, value: number }[], height?: number }) => {
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
});

// ── Transaction Row (Dark Theme) ──────────────────────────────────
const TransactionRow = React.memo(({ tx, index, formatCurrency }: { tx: any; index: number; formatCurrency: (amount: number) => string }) => {
    const rawIcon = CATEGORY_ICONS[tx.category as Category] || 'receipt-outline';
    const iconName = rawIcon ? mapCategoryIcon(rawIcon) : 'receipt-outline';
    const iconColor = CATEGORY_COLORS[tx.category as Category] || '#111';

    return (
        <Animated.View entering={FadeInDown.delay(100 + index * 50).duration(400)}>
            <TouchableOpacity style={styles.txRow} activeOpacity={0.7} onPress={() => { }}>
                <View style={[styles.txIconWrap, { backgroundColor: iconColor + '20' }]}>
                    <Ionicons name={iconName as any} size={20} color={iconColor} />
                </View>
                <View style={styles.txMid}>
                    <Text style={styles.txTitle} numberOfLines={1}>{tx.title}</Text>
                    <View style={styles.txMeta}>
                        <Text style={styles.txCat}>{tx.category || 'General'}</Text>
                        <Text style={styles.txDot}>·</Text>
                        <Text style={styles.txDate}>{new Date(tx.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</Text>
                    </View>
                </View>
                <Text style={[styles.txAmt, { color: tx.type === 'income' ? DarkTheme.income : DarkTheme.textPrimary }]}>
                    {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
});

export default function AnalysisScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { transactions } = useTransactions();
    const { formatCurrency } = useSettings();

    // Defer heavy UI rendering until navigation completes
    const [isReady, setIsReady] = useState(false);
    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            setIsReady(true);
        });
    }, []);

    const [selectedFilter, setSelectedFilter] = useState<TimeFilter>('Month');
    const now = new Date();
    const [currentMonthIndex, setCurrentMonthIndex] = useState(now.getMonth());
    const [currentYear, setCurrentYear] = useState(now.getFullYear());

    // Custom Date State
    const [customStart, setCustomStart] = useState<Date>(new Date(now.getFullYear(), now.getMonth(), 1));
    const [customEnd, setCustomEnd] = useState<Date>(now);
    const [showPicker, setShowPicker] = useState<'start' | 'end' | null>(null);

    // Sliding Animation State for Tabs (0: Week, 1: Month, 2: Year, 3: Custom)
    const tabPosition = useSharedValue(1); // Default to 'Month' index
    const animatedSliderStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withSpring(tabPosition.value * ((width - Spacing.lg * 2 - 8) / 4), { damping: 15, stiffness: 120 }) }]
    }));

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
            // Find current week (Monday-Sunday)
            const today = new Date();
            const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; // 0 is Monday, 6 is Sunday
            start = new Date(today);
            start.setDate(today.getDate() - dayOfWeek);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        } else if (selectedFilter === 'Custom') {
            start = new Date(customStart);
            start.setHours(0, 0, 0, 0);
            end = new Date(customEnd);
            end.setHours(23, 59, 59, 999);
        }
        return { start, end };
    }, [selectedFilter, currentMonthIndex, currentYear, customStart, customEnd]);

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

    // Filtered & Sorted Transactions for Recent List
    const sortedFilteredTransactions = useMemo(() => {
        return [...filteredTxs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [filteredTxs]);

    const categoryData = useMemo(() => {
        const expenses = filteredTxs.filter(t => t.type === 'expense');
        const map = new Map<Category, number>();
        expenses.forEach((t) => {
            const cat = t.category as Category;
            map.set(cat, (map.get(cat) || 0) + t.amount);
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
        const expenses = filteredTxs.filter(t => t.type === 'expense');

        if (selectedFilter === 'Week') {
            const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => ({ label: d, value: 0 }));
            expenses.forEach(t => {
                const day = new Date(t.date).getDay();
                const idx = day === 0 ? 6 : day - 1; // Map Sunday (0) to index 6
                days[idx].value += t.amount;
            });
            return days;
        } else if (selectedFilter === 'Month') {
            const weeks = [
                { label: 'W1', value: 0 },
                { label: 'W2', value: 0 },
                { label: 'W3', value: 0 },
                { label: 'W4', value: 0 },
            ];
            expenses.forEach(t => {
                const day = new Date(t.date).getDate();
                if (day <= 7) weeks[0].value += t.amount;
                else if (day <= 14) weeks[1].value += t.amount;
                else if (day <= 21) weeks[2].value += t.amount;
                else weeks[3].value += t.amount;
            });
            return weeks;
        } else if (selectedFilter === 'Year') {
            const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map(m => ({ label: m, value: 0 }));
            expenses.forEach(t => {
                const mIdx = new Date(t.date).getMonth();
                months[mIdx].value += t.amount;
            });
            return months;
        } else if (selectedFilter === 'Custom') {
            // Group dynamically depending on length of custom date range
            const diffDays = Math.ceil(Math.abs(dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays <= 14) {
                // Return daily points up to 14 days
                const pts: any[] = [];
                for (let i = 0; i <= diffDays; i++) {
                    const d = new Date(dateRange.start);
                    d.setDate(d.getDate() + i);
                    pts.push({ label: d.getDate().toString(), value: 0, _dateDate: d.getDate() });
                }
                expenses.forEach(t => {
                    const tDate = new Date(t.date).getDate();
                    const bin = pts.find(p => p._dateDate === tDate);
                    if (bin) bin.value += t.amount;
                });
                return pts;
            } else if (diffDays <= 90) {
                // Return Weekly buckets
                let w = 1;
                const pts: any[] = [];
                for (let i = 0; i < diffDays; i += 7) {
                    pts.push({ label: `W${w++}`, value: 0, _startDayOffset: i });
                }
                expenses.forEach(t => {
                    const offset = Math.floor(Math.abs(new Date(t.date).getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
                    const binIdx = Math.floor(offset / 7);
                    if (pts[binIdx]) pts[binIdx].value += t.amount;
                });
                return pts;
            } else {
                // Return Monthly buckets
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => ({ label: m, value: 0, _mIdx: i }));
                expenses.forEach(t => {
                    const mIdx = new Date(t.date).getMonth();
                    const bin = months.find(m => m._mIdx === mIdx);
                    if (bin) bin.value += t.amount;
                });
                // Filter out months with zero values that fall completely outside the range to save horizontal space, optionally
                return months.filter(m => {
                    const isWithinStart = (dateRange.start.getFullYear() < dateRange.end.getFullYear() || m._mIdx >= dateRange.start.getMonth());
                    const isWithinEnd = (dateRange.start.getFullYear() < dateRange.end.getFullYear() || m._mIdx <= dateRange.end.getMonth());
                    return isWithinStart && isWithinEnd;
                });
            }
        }
        return [];
    }, [filteredTxs, selectedFilter, dateRange]);

    const totalTransactions = filteredTxs.length;
    const diffTime = Math.abs(dateRange.end.getTime() - dateRange.start.getTime());
    const daysInRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

    const avgSpendingPerDay = totalTransactions > 0 ? monthlyExpense / daysInRange : 0;
    const expenseTxCount = filteredTxs.filter((t) => t.type === 'expense').length;
    const avgSpendingPerTx = expenseTxCount > 0 ? monthlyExpense / expenseTxCount : 0;
    const incomeTxCount = filteredTxs.filter((t) => t.type === 'income').length;
    const avgIncomePerDay = monthlyIncome / daysInRange;
    const avgIncomePerTx = incomeTxCount > 0 ? monthlyIncome / incomeTxCount : 0;

    if (!isReady) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={DarkTheme.brandYellow} />
            </View>
        );
    }

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
                <View style={styles.filterRowContainer}>
                    <View style={styles.filterRow}>
                        <Animated.View style={[styles.filterSlider, animatedSliderStyle]} />
                        {(['Week', 'Month', 'Year', 'Custom'] as TimeFilter[]).map((filter, index) => (
                            <TouchableOpacity
                                key={filter}
                                style={styles.filterChip}
                                onPress={() => {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                    tabPosition.value = index;
                                    setSelectedFilter(filter);
                                }}
                            >
                                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                                    {filter}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {selectedFilter === 'Custom' && (
                    <View style={styles.customDateContainer}>
                        <TouchableOpacity style={styles.datePickerButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPicker('start'); }}>
                            <Ionicons name="calendar-outline" size={16} color={DarkTheme.textMuted} />
                            <Text style={styles.datePickerText}>{customStart.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <Text style={styles.datePickerTo}>to</Text>
                        <TouchableOpacity style={styles.datePickerButton} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowPicker('end'); }}>
                            <Ionicons name="calendar-outline" size={16} color={DarkTheme.textMuted} />
                            <Text style={styles.datePickerText}>{customEnd.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {showPicker && (
                    <DateTimePicker
                        value={showPicker === 'start' ? customStart : customEnd}
                        mode="date"
                        display="default"
                        maximumDate={now}
                        onChange={(event, selectedDate) => {
                            setShowPicker(null);
                            if (selectedDate) {
                                if (showPicker === 'start') {
                                    setCustomStart(selectedDate);
                                    if (selectedDate > customEnd) setCustomEnd(selectedDate); // Sync
                                } else {
                                    setCustomEnd(selectedDate);
                                    if (selectedDate < customStart) setCustomStart(selectedDate); // Sync
                                }
                            }
                        }}
                    />
                )}

                <View style={[styles.summaryCard, selectedFilter === 'Custom' && { marginTop: 0 }]}>
                    <View style={styles.summaryHeader}>
                        <View>
                            <Text style={styles.summaryPeriod}>
                                {selectedFilter === 'Year' ? currentYear :
                                    selectedFilter === 'Custom' ? 'Custom Range' :
                                        selectedFilter === 'Week' ? 'This Week' :
                                            `${MONTHS[currentMonthIndex]} ${currentYear}`}
                            </Text>
                            <Text style={styles.summaryBalanceLabel}>Total Balance</Text>
                        </View>
                        <View style={styles.navButtons}>
                            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goToPrevMonth(); }} style={styles.navButton} disabled={selectedFilter === 'Custom' || selectedFilter === 'Week'}>
                                <Ionicons name="chevron-back" size={18} color={selectedFilter === 'Custom' || selectedFilter === 'Week' ? DarkTheme.textMuted + '50' : DarkTheme.textPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goToNextMonth(); }} style={styles.navButton} disabled={selectedFilter === 'Custom' || selectedFilter === 'Week'}>
                                <Ionicons name="chevron-forward" size={18} color={selectedFilter === 'Custom' || selectedFilter === 'Week' ? DarkTheme.textMuted + '50' : DarkTheme.textPrimary} />
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

                {/* ═══ Recent Transactions ═══ */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Recent Transactions</Text>
                    <View style={styles.card}>
                        {sortedFilteredTransactions.length === 0 ? (
                            <View style={styles.emptyCategory}>
                                <Ionicons name="receipt-outline" size={32} color={DarkTheme.textMuted} />
                                <Text style={styles.emptyCategoryText}>No transactions found</Text>
                            </View>
                        ) : (
                            <View>
                                {sortedFilteredTransactions.slice(0, 5).map((tx, i) => (
                                    <TransactionRow key={tx.id || tx._id || i} tx={tx} index={i} formatCurrency={formatCurrency} />
                                ))}
                                {sortedFilteredTransactions.length > 5 && (
                                    <TouchableOpacity
                                        style={styles.showAllBtn}
                                        onPress={() => router.push('/features/transactions')}
                                    >
                                        <Text style={styles.showAllTxt}>View all transactions in this view</Text>
                                        <Ionicons name="arrow-forward" size={14} color={DarkTheme.brandYellow} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        )}
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
    filterRowContainer: {
        marginBottom: Spacing.xl,
    },
    filterRow: {
        flexDirection: 'row',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: 4,
        borderWidth: 1,
        borderColor: DarkTheme.border,
        position: 'relative',
    },
    filterSlider: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        width: (width - Spacing.lg * 2 - 8) / 4,
        backgroundColor: DarkTheme.accent,
        borderRadius: BorderRadius.sm,
    },
    filterChip: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
        zIndex: 2,
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
    customDateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginBottom: Spacing.xl,
        marginTop: -8,
    },
    datePickerButton: {
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    datePickerText: {
        color: DarkTheme.textPrimary,
        fontSize: 12,
        fontWeight: '600',
    },
    datePickerTo: {
        color: DarkTheme.textMuted,
        fontSize: 12,
        fontWeight: '600',
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

    // Transaction Row (Dark Theme)
    txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: DarkTheme.separator },
    txIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    txMid: { flex: 1 },
    txTitle: { fontSize: FontSize.md, fontWeight: '700', color: DarkTheme.textPrimary, marginBottom: 4 },
    txMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    txCat: { fontSize: FontSize.xs, color: DarkTheme.textMuted, fontWeight: '600' },
    txDot: { fontSize: FontSize.xs, color: DarkTheme.textMuted },
    txDate: { fontSize: 11, color: DarkTheme.textMuted, fontWeight: '500' },
    txAmt: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
    showAllBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 18, borderTopWidth: 1, borderTopColor: DarkTheme.separator, marginTop: 4 },
    showAllTxt: { fontSize: 13, fontWeight: '700', color: DarkTheme.brandYellow },
});
