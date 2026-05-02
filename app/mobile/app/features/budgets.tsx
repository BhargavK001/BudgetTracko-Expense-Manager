import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Platform,
    StatusBar,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    RefreshControl,
    Animated as RNAnimated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions, EXPENSE_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, Category } from '@/context/TransactionContext';
import { useSettings } from '@/context/SettingsContext';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { useThemeStyles } from '@/components/more/DesignSystem';

const PERIODS = [
    { key: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar' },
    { key: 'yearly', label: 'Yearly', icon: 'calendar-number-outline' },
];

export default function BudgetsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { budgets, addBudget, updateBudget, deleteBudget, getCategoryBreakdown, getTransactionsForRange, categories, isLoading, refreshBudgets } = useTransactions();
    const { formatCurrency, triggerHaptic } = useSettings();

    const [activePeriod, setActivePeriod] = useState('monthly');
    const [tabWidth, setTabWidth] = useState(0);
    const slideAnim = useRef(new RNAnimated.Value(0)).current;

    // #3 Time Travel: navigate months
    const now = new Date();
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [viewYear, setViewYear] = useState(now.getFullYear());

    const goToPrev = () => {
        triggerHaptic();
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const goToNext = () => {
        triggerHaptic();
        const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
        if (isCurrentMonth) return;
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };
    const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    useEffect(() => {
        const index = PERIODS.findIndex(p => p.key === activePeriod);
        if (tabWidth > 0 && index !== -1) {
            RNAnimated.spring(slideAnim, {
                toValue: index * tabWidth,
                useNativeDriver: true,
                bounciness: 4,
                speed: 12
            }).start();
        }
    }, [activePeriod, tabWidth]);

    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState<any>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Form State
    const [formCategory, setFormCategory] = useState('');
    const [formAmount, setFormAmount] = useState('');

    // #2 Custom Categories: merge built-in + user custom + categories from actual transactions
    const allCategories = useMemo(() => {
        const builtIn = [...EXPENSE_CATEGORIES] as string[];
        // Add custom categories from the Categories page
        const custom = categories
            .filter(c => c.type === 'expense' || c.type === 'both')
            .map(c => c.name)
            .filter(n => !builtIn.includes(n));
        // Also add any categories that appear in the user's actual transactions but aren't in the list
        const breakdown = getCategoryBreakdown(viewMonth, viewYear);
        const fromTxns = breakdown.map(b => b.name).filter(n => !builtIn.includes(n) && !custom.includes(n));
        return [...builtIn, ...custom, ...fromTxns];
    }, [categories, getCategoryBreakdown, viewMonth, viewYear]);

    // Total budget allocation info
    const TOTAL_BUDGET_KEY = '__TOTAL__';
    const subCategoryBudgetSum = useMemo(() => {
        return budgets
            .filter(b => b.period === activePeriod && b.category !== TOTAL_BUDGET_KEY)
            .reduce((sum, b) => sum + b.amount, 0);
    }, [budgets, activePeriod]);

    // #1 Period-aware spending calculation
    const getSpentForCategory = useMemo(() => {
        if (activePeriod === 'monthly') {
            const breakdown = getCategoryBreakdown(viewMonth, viewYear);
            return (cat: string) => breakdown.find(c => c.name === cat)?.amount || 0;
        }
        // Weekly: get current week's transactions
        if (activePeriod === 'weekly') {
            const dayOfMonth = new Date(viewYear, viewMonth, 15);
            const dayOfWeek = dayOfMonth.getDay();
            const weekStart = new Date(dayOfMonth);
            weekStart.setDate(weekStart.getDate() - dayOfWeek);
            weekStart.setHours(0, 0, 0, 0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            const weekTxns = getTransactionsForRange(weekStart, weekEnd).filter(t => t.type === 'expense');
            return (cat: string) => weekTxns.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
        }
        // Yearly
        const yearStart = new Date(viewYear, 0, 1);
        const yearEnd = new Date(viewYear, 11, 31, 23, 59, 59, 999);
        const yearTxns = getTransactionsForRange(yearStart, yearEnd).filter(t => t.type === 'expense');
        return (cat: string) => yearTxns.filter(t => t.category === cat).reduce((s, t) => s + t.amount, 0);
    }, [activePeriod, viewMonth, viewYear, getCategoryBreakdown, getTransactionsForRange]);

    // #5 Smart Sorting: highest usage % first
    const filteredBudgets = useMemo(() => {
        return budgets.filter(b => b.period === activePeriod).map(b => {
            // For Total Budget, spent = sum of ALL expenses in the period
            if (b.category === TOTAL_BUDGET_KEY) {
                const allSpent = subCategoryBudgetSum > 0
                    ? budgets.filter(sb => sb.period === activePeriod && sb.category !== TOTAL_BUDGET_KEY)
                        .reduce((s, sb) => s + (getSpentForCategory(sb.category)), 0)
                    : 0;
                // Use total of all category spending from breakdown
                const breakdown = getCategoryBreakdown(viewMonth, viewYear);
                const totalAllSpent = breakdown.reduce((s, c) => s + c.amount, 0);
                return {
                    ...b,
                    spent: totalAllSpent,
                    percent: b.amount > 0 ? (totalAllSpent / b.amount) * 100 : 0
                };
            }
            const actualSpent = getSpentForCategory(b.category);
            return {
                ...b,
                spent: actualSpent,
                percent: b.amount > 0 ? (actualSpent / b.amount) * 100 : 0
            };
        }).sort((a, b) => {
            // Total budget always on top
            if (a.category === TOTAL_BUDGET_KEY) return -1;
            if (b.category === TOTAL_BUDGET_KEY) return 1;
            return b.percent - a.percent;
        });
    }, [budgets, activePeriod, getSpentForCategory, subCategoryBudgetSum, getCategoryBreakdown, viewMonth, viewYear]);

    // Use Total Budget if set, otherwise sum of sub-categories
    const totalBudgetEntry = filteredBudgets.find(b => b.category === TOTAL_BUDGET_KEY);
    const totalBudget = totalBudgetEntry ? totalBudgetEntry.amount : filteredBudgets.reduce((a, b) => a + b.amount, 0);
    const totalSpent = totalBudgetEntry ? totalBudgetEntry.spent : filteredBudgets.reduce((a, b) => a + (b.spent || 0), 0);
    const totalPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    // Remaining unallocated from total budget
    const remainingToAllocate = useMemo(() => {
        if (!totalBudgetEntry) return 0;
        return totalBudgetEntry.amount - subCategoryBudgetSum;
    }, [totalBudgetEntry, subCategoryBudgetSum]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try { await refreshBudgets(); } catch {}
        setRefreshing(false);
    }, [refreshBudgets]);

    const openAddForm = () => {
        triggerHaptic();
        setEditingBudget(null);
        setFormCategory('');
        setFormAmount('');
        setShowForm(true);
    };

    const handleSave = async () => {
        triggerHaptic();
        if (!formCategory || !formAmount) return;
        const amount = Number(formAmount);
        if (isNaN(amount) || amount <= 0) {
            Alert.alert('Invalid', 'Please enter a valid amount.');
            return;
        }

        // Envelope validation: sub-category can't exceed remaining
        if (formCategory !== TOTAL_BUDGET_KEY && totalBudgetEntry) {
            const currentAlloc = editingBudget && editingBudget.category !== TOTAL_BUDGET_KEY
                ? editingBudget.amount : 0;
            const newTotal = subCategoryBudgetSum - currentAlloc + amount;
            if (newTotal > totalBudgetEntry.amount) {
                Alert.alert(
                    'Over Budget',
                    `This allocation of ${formatCurrency(amount)} would exceed your total budget of ${formatCurrency(totalBudgetEntry.amount)}.\n\nRemaining: ${formatCurrency(totalBudgetEntry.amount - subCategoryBudgetSum + currentAlloc)}`,
                );
                return;
            }
        }

        // Validate total budget isn't less than already allocated
        if (formCategory === TOTAL_BUDGET_KEY && amount < subCategoryBudgetSum) {
            Alert.alert(
                'Cannot Reduce',
                `You already have ${formatCurrency(subCategoryBudgetSum)} allocated to categories. Total budget must be at least that amount.`,
            );
            return;
        }

        try {
            if (editingBudget) {
                await updateBudget(editingBudget.id, {
                    category: formCategory as any,
                    amount,
                    period: activePeriod as any
                });
            } else {
                await addBudget({
                    category: formCategory as any,
                    amount,
                    period: activePeriod as any
                });
            }
            setShowForm(false);
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.error || e.response?.data?.message || 'Failed to save budget.');
        }
    };

    const handleDelete = (id: string) => {
        triggerHaptic();
        Alert.alert('Delete Budget', 'Are you sure you want to delete this budget?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    triggerHaptic();
                    try {
                        await deleteBudget(id);
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.error || e.response?.data?.message || 'Failed to delete budget.');
                    }
                }
            }
        ]);
    };

    const getProgressColor = (percent: number) => {
        if (percent > 90) return '#F43F5E';
        if (percent > 70) return '#F59E0B';
        return '#2DCA72';
    };

    const { isDarkMode, tokens } = useThemeStyles();

    if (isLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, backgroundColor: tokens.bgPrimary }]}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
                <Animated.View entering={FadeIn.delay(50)} style={styles.header}>
                    <TouchableOpacity 
                        onPress={() => router.back()} 
                        style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]} 
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={20} color={tokens.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Budgets</Text>
                    <View style={{ width: 40 }} />
                </Animated.View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={tokens.purple.stroke || "#6366F1"} />
                    <Text style={{ marginTop: 12, color: tokens.textMuted, fontSize: 13, fontWeight: '600' }}>Loading budgets…</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: tokens.bgPrimary }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header */}
            <Animated.View entering={FadeIn.delay(50)} style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]} 
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-back" size={20} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Budgets</Text>
                <TouchableOpacity 
                    onPress={openAddForm} 
                    style={[styles.addButton, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]} 
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={24} color={tokens.purple.stroke || "#6366F1"} />
                </TouchableOpacity>
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" colors={['#6366F1']} />
                }
            >
                {/* Period Selector */}
                <Animated.View 
                    entering={FadeInDown.delay(100).duration(400).springify()} 
                    style={[styles.periodContainer, { backgroundColor: tokens.bgSecondary, borderRadius: 24, padding: 4, borderWidth: 1, borderColor: tokens.borderDefault }]} 
                    onLayout={(e) => setTabWidth((e.nativeEvent.layout.width - 8) / PERIODS.length)}
                >
                    {tabWidth > 0 && (
                        <RNAnimated.View style={[
                            styles.activeTabIndicator,
                            { 
                                width: tabWidth, 
                                transform: [{ translateX: slideAnim }],
                                backgroundColor: tokens.pillSurface,
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 2,
                                borderRadius: 20,
                                top: 4,
                                bottom: 4,
                                left: 4
                            }
                        ]} />
                    )}
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p.key}
                            style={[styles.periodButton, { zIndex: 2 }]}
                            onPress={() => { triggerHaptic(); setActivePeriod(p.key); }}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={p.icon as any}
                                size={14}
                                color={activePeriod === p.key ? tokens.textPrimary : tokens.textMuted}
                            />
                            <Text style={[
                                styles.periodLabel,
                                { 
                                    color: activePeriod === p.key ? tokens.textPrimary : tokens.textMuted,
                                    fontWeight: activePeriod === p.key ? '700' : '600'
                                }
                            ]}>{p.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* #3 Time Travel: Month Navigator */}
                <Animated.View entering={FadeInDown.delay(120).duration(400).springify()} style={[styles.monthNav, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                    <TouchableOpacity onPress={goToPrev} style={styles.monthNavBtn} activeOpacity={0.7}>
                        <Ionicons name="chevron-back" size={20} color={tokens.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.monthNavText, { color: tokens.textPrimary }]}>
                        {MONTH_NAMES[viewMonth]} {viewYear}
                    </Text>
                    <TouchableOpacity onPress={goToNext} style={[styles.monthNavBtn, isCurrentMonth && { opacity: 0.3 }]} activeOpacity={0.7} disabled={isCurrentMonth}>
                        <Ionicons name="chevron-forward" size={20} color={tokens.textPrimary} />
                    </TouchableOpacity>
                </Animated.View>

                {/* Overview Card */}
                <Animated.View entering={FadeInDown.delay(150).duration(400).springify()} style={[styles.overviewCard, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                    <View style={styles.overviewHeader}>
                        <View>
                            <Text style={[styles.overviewLabel, { color: tokens.textMuted }]}>Total {activePeriod} Budget</Text>
                            <Text style={[styles.overviewValue, { color: tokens.textPrimary }]}>
                                {formatCurrency(totalSpent)} <Text style={[styles.overviewTotal, { color: tokens.textMuted }]}>/ {formatCurrency(totalBudget)}</Text>
                            </Text>
                        </View>
                        <View style={[
                            styles.badge,
                            { backgroundColor: totalPercent > 90 ? 'rgba(244,63,94,0.1)' : 'rgba(45,202,114,0.1)' }
                        ]}>
                            <Text style={[
                                styles.badgeText,
                                { color: totalPercent > 90 ? '#F43F5E' : '#2DCA72' }
                            ]}>{totalPercent.toFixed(0)}% Used</Text>
                        </View>
                    </View>
                    {/* Progress Bar (flex-based) */}
                    <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E8E8EE' }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    flex: Math.max(totalPercent / 100, 0.01),
                                    backgroundColor: getProgressColor(totalPercent),
                                    shadowColor: getProgressColor(totalPercent),
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.4,
                                    shadowRadius: 4,
                                }
                            ]}
                        />
                        <View style={{ flex: Math.max((100 - totalPercent) / 100, 0) }} />
                    </View>
                    {/* #4 Left to Spend */}
                    {totalBudget > 0 && (
                        <View style={styles.leftToSpendRow}>
                            <View style={[styles.leftDot, { backgroundColor: totalSpent >= totalBudget ? '#F43F5E' : '#2DCA72' }]} />
                            <Text style={[styles.leftToSpendText, { color: tokens.textMuted }]}>
                                {totalSpent >= totalBudget
                                    ? `Over budget by ${formatCurrency(Math.round(totalSpent - totalBudget))}`
                                    : `${formatCurrency(Math.round(totalBudget - totalSpent))} left to spend`}
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Budget List */}
                <View style={styles.grid}>
                    {filteredBudgets.map((budget, index) => (
                        <Animated.View
                            key={budget.id}
                            layout={Layout.springify()}
                        >
                            <Animated.View
                                entering={FadeInDown.delay(200 + index * 50).duration(400).springify()}
                                style={[styles.budgetCard, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}
                            >
                                <View style={styles.budgetHeader}>
                                    <View style={[styles.budgetIconContainer, { backgroundColor: budget.category === TOTAL_BUDGET_KEY ? (isDarkMode ? 'rgba(109,16,223,0.2)' : 'rgba(109,16,223,0.1)') : (CATEGORY_COLORS[budget.category as Category] || '#795548') + (isDarkMode ? '25' : '15') }]}>
                                        <Ionicons
                                            name={budget.category === TOTAL_BUDGET_KEY ? 'wallet-outline' : ((CATEGORY_ICONS[budget.category as Category] || 'ellipsis-horizontal-circle-outline') as any)}
                                            size={20}
                                            color={budget.category === TOTAL_BUDGET_KEY ? '#6d10dfff' : (CATEGORY_COLORS[budget.category as Category] || '#795548')}
                                        />
                                    </View>
                                    <View style={styles.budgetInfo}>
                                        <Text style={[styles.budgetCategory, { color: tokens.textPrimary }]}>{budget.category === TOTAL_BUDGET_KEY ? 'Total Budget' : budget.category}</Text>
                                        <View style={styles.row}>
                                            <Text style={[styles.budgetUsed, { color: tokens.textPrimary }]}>{formatCurrency(budget.spent)}</Text>
                                            <Text style={[styles.budgetLimit, { color: tokens.textMuted }]}> / {formatCurrency(budget.amount)}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}
                                            onPress={() => {
                                                triggerHaptic();
                                                setEditingBudget(budget);
                                                setFormCategory(budget.category);
                                                setFormAmount(budget.amount.toString());
                                                setShowForm(true);
                                            }}
                                        >
                                            <Ionicons name="pencil-outline" size={16} color={tokens.textMuted} />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { backgroundColor: 'rgba(244,63,94,0.1)' }]}
                                            onPress={() => handleDelete(budget.id)}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Mini Progress Bar (flex-based) */}
                                <View style={[styles.miniProgressBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E8E8EE' }]}>
                                    <View
                                        style={[
                                            styles.miniProgressBarFill,
                                            {
                                                flex: Math.max(Math.min(budget.percent, 100) / 100, 0.01),
                                                backgroundColor: getProgressColor(budget.percent),
                                                shadowColor: getProgressColor(budget.percent),
                                                shadowOffset: { width: 0, height: 0 },
                                                shadowOpacity: 0.3,
                                                shadowRadius: 3,
                                            }
                                        ]}
                                    />
                                    <View style={{ flex: Math.max((100 - Math.min(budget.percent, 100)) / 100, 0) }} />
                                </View>

                                <View style={styles.budgetFooter}>
                                    <Text style={[
                                        styles.remainingText,
                                        { color: budget.percent > 100 ? '#F43F5E' : tokens.textMuted }
                                    ]}>
                                        {budget.percent > 100 ? 'Over Budget!' : `${(100 - budget.percent).toFixed(0)}% remaining`}
                                    </Text>
                                </View>
                            </Animated.View>
                        </Animated.View>
                    ))}

                    <Animated.View entering={FadeInDown.delay(200 + filteredBudgets.length * 50).duration(400).springify()}>
                        <TouchableOpacity 
                            style={[styles.emptyCard, { borderColor: isDarkMode ? tokens.borderDefault : '#E2E8F0', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.02)' : '#FAFAFA' }]} 
                            onPress={openAddForm} 
                            activeOpacity={0.7}
                        >
                            <Ionicons name="add-circle-outline" size={32} color={tokens.textMuted} />
                            <Text style={[styles.emptyCardText, { color: tokens.textMuted }]}>Add New Budget</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {filteredBudgets.length === 0 && (
                    <Animated.View entering={FadeIn.delay(300)} style={styles.emptyState}>
                        <Ionicons name="pie-chart-outline" size={64} color={isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA'} />
                        <Text style={[styles.emptyStateTitle, { color: tokens.textPrimary }]}>No budgets yet</Text>
                        <Text style={[styles.emptyStateDesc, { color: tokens.textMuted }]}>Set your first budget to start tracking your spending.</Text>
                    </Animated.View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modal Form — Full Page */}
            <Modal
                visible={showForm}
                animationType="slide"
                transparent={false}
                onRequestClose={() => setShowForm(false)}
            >
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={[styles.modalFull, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
                        {/* Modal Header */}
                        <View style={styles.modalHeader}>
                            <TouchableOpacity onPress={() => setShowForm(false)} style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]}>
                                <Ionicons name="chevron-back" size={20} color={tokens.textPrimary} />
                            </TouchableOpacity>
                            <Text style={[styles.modalTitle, { color: tokens.textPrimary }]}>{editingBudget ? 'Edit Budget' : 'Add Budget'}</Text>
                            <View style={{ width: 40 }} />
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
                            {/* STEP 1 */}
                            <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>Step 1 — Set Total Budget</Text>
                            <Text style={[styles.sectionDesc, { color: tokens.textMuted }]}>Your overall {activePeriod} spending limit. Categories are allocated from this pool.</Text>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() => { triggerHaptic(); setFormCategory(TOTAL_BUDGET_KEY); }}
                                style={[styles.totalBudgetCard, { backgroundColor: formCategory === TOTAL_BUDGET_KEY ? (isDarkMode ? 'rgba(109,16,223,0.15)' : 'rgba(109,16,223,0.08)') : tokens.bgSecondary, borderColor: formCategory === TOTAL_BUDGET_KEY ? '#6d10dfff' : tokens.borderDefault }]}
                            >
                                <View style={[styles.totalBudgetIcon, { backgroundColor: isDarkMode ? 'rgba(109,16,223,0.25)' : 'rgba(109,16,223,0.12)' }]}>
                                    <Ionicons name="wallet" size={24} color="#6d10dfff" />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.totalBudgetTitle, { color: tokens.textPrimary }]}>Total Budget</Text>
                                    {totalBudgetEntry ? (
                                        <Text style={[styles.totalBudgetDesc, { color: '#2DCA72', fontWeight: '700' }]}>{formatCurrency(totalBudgetEntry.amount)} set</Text>
                                    ) : (
                                        <Text style={[styles.totalBudgetDesc, { color: tokens.textMuted }]}>Tap to set your limit</Text>
                                    )}
                                </View>
                                <View style={[styles.radioOuter, { borderColor: formCategory === TOTAL_BUDGET_KEY ? '#6d10dfff' : tokens.textMuted }]}>
                                    {formCategory === TOTAL_BUDGET_KEY && <View style={[styles.radioInner, { backgroundColor: '#6d10dfff' }]} />}
                                </View>
                            </TouchableOpacity>

                            {/* STEP 2 */}
                            <View style={[styles.divider, { backgroundColor: tokens.borderDefault }]} />
                            <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>Step 2 — Allocate to Categories</Text>

                            {totalBudgetEntry ? (
                                <>
                                    <View style={[styles.envelopeBar, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                                        <View style={styles.envelopeBarHeader}>
                                            <Text style={[styles.envelopeBarLabel, { color: tokens.textMuted }]}>Allocated</Text>
                                            <Text style={[styles.envelopeBarValue, { color: tokens.textPrimary }]}>{formatCurrency(subCategoryBudgetSum)} <Text style={{ color: tokens.textMuted, fontWeight: '500' }}>/ {formatCurrency(totalBudgetEntry.amount)}</Text></Text>
                                        </View>
                                        <View style={[styles.envelopeTrack, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#E8E8EE' }]}>
                                            <View style={[styles.envelopeFill, { flex: Math.max(subCategoryBudgetSum / totalBudgetEntry.amount, 0.01), backgroundColor: subCategoryBudgetSum >= totalBudgetEntry.amount ? '#F43F5E' : '#6d10dfff' }]} />
                                            <View style={{ flex: Math.max((totalBudgetEntry.amount - subCategoryBudgetSum) / totalBudgetEntry.amount, 0) }} />
                                        </View>
                                        <Text style={[styles.envelopeRemaining, { color: remainingToAllocate > 0 ? '#2DCA72' : '#F43F5E' }]}>{remainingToAllocate > 0 ? `${formatCurrency(remainingToAllocate)} remaining to allocate` : 'Fully allocated'}</Text>
                                    </View>
                                    <Text style={[styles.sectionDesc, { color: tokens.textMuted, marginBottom: 12 }]}>Choose a category to allocate a portion.</Text>
                                </>
                            ) : (
                                <View style={[styles.noTotalHint, { backgroundColor: isDarkMode ? 'rgba(244,63,94,0.08)' : 'rgba(244,63,94,0.05)', borderColor: isDarkMode ? 'rgba(244,63,94,0.2)' : 'rgba(244,63,94,0.15)' }]}>
                                    <Ionicons name="arrow-up-circle-outline" size={18} color="#F43F5E" />
                                    <Text style={[styles.noTotalHintText, { color: tokens.textMuted }]}>Set a Total Budget first to enable category allocation</Text>
                                </View>
                            )}

                            <View style={[styles.categoryGrid, { opacity: totalBudgetEntry ? 1 : 0.4, marginBottom: 20 }]}>
                                {allCategories.map(cat => {
                                    const icon = CATEGORY_ICONS[cat as Category] || 'ellipsis-horizontal-circle-outline';
                                    const color = CATEGORY_COLORS[cat as Category] || '#795548';
                                    const isActive = formCategory === cat;
                                    const existing = budgets.find(b => b.category === cat && b.period === activePeriod);
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[styles.categoryGridItem, { backgroundColor: isActive ? color + (isDarkMode ? '25' : '15') : tokens.bgSecondary, borderColor: isActive ? color : tokens.borderDefault }]}
                                            onPress={() => {
                                                if (!totalBudgetEntry) { Alert.alert('Set Total Budget', 'Please set your total budget first before allocating to categories.'); return; }
                                                triggerHaptic(); setFormCategory(cat);
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.categoryGridIcon, { backgroundColor: color + (isDarkMode ? '20' : '12') }]}>
                                                <Ionicons name={icon as any} size={20} color={color} />
                                            </View>
                                            <Text style={[styles.categoryGridText, { color: isActive ? tokens.textPrimary : tokens.textMuted }]} numberOfLines={1}>{cat}</Text>
                                            {existing && <Text style={[styles.categoryExisting, { color }]}>{formatCurrency(existing.amount)}</Text>}
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* Amount Input */}
                            <View style={[styles.divider, { backgroundColor: tokens.borderDefault }]} />
                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: tokens.textMuted }]}>{formCategory === TOTAL_BUDGET_KEY ? 'Total Budget Amount' : 'Allocation Amount'}</Text>
                                {formCategory && formCategory !== TOTAL_BUDGET_KEY && totalBudgetEntry && (
                                    <Text style={[styles.amountHint, { color: '#2DCA72' }]}>Max: {formatCurrency(remainingToAllocate + (editingBudget?.category === formCategory ? editingBudget.amount : 0))}</Text>
                                )}
                                <View style={[styles.amountInputContainer, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                                    <Text style={[styles.amountCurrency, { color: tokens.textMuted }]}>{formatCurrency(0).charAt(0)}</Text>
                                    <TextInput
                                        style={[styles.amountInput, { color: tokens.textPrimary }]}
                                        placeholder="0"
                                        placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.15)' : '#CCC'}
                                        keyboardType="numeric"
                                        value={formAmount}
                                        onChangeText={setFormAmount}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: '#6d10dfff', shadowColor: '#600ac9ff', opacity: (!formCategory || !formAmount) ? 0.5 : 1 }]}
                                onPress={handleSave}
                                activeOpacity={0.8}
                                disabled={!formCategory || !formAmount}
                            >
                                <Text style={styles.saveButtonText}>{editingBudget ? 'Update' : formCategory === TOTAL_BUDGET_KEY ? 'Set Total Budget' : 'Allocate Budget'}</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    periodContainer: {
        flexDirection: 'row',
        marginBottom: 24,
    },
    periodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
    },
    activeTabIndicator: {
        position: 'absolute',
    },
    periodLabel: {
        fontSize: 13,
    },
    periodLabelActive: {
    },
    monthNav: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 8,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    monthNavBtn: {
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthNavText: {
        fontSize: 16,
        fontWeight: '800',
    },
    leftToSpendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 14,
        gap: 8,
    },
    leftDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    leftToSpendText: {
        fontSize: 13,
        fontWeight: '700',
    },
    overviewCard: {
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 2,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    overviewLabel: {
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    overviewValue: {
        fontSize: 28,
        fontWeight: '900',
    },
    overviewTotal: {
        fontSize: 16,
    },
    badge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 14,
        borderRadius: 8,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 8,
    },
    grid: {
        gap: 16,
    },
    budgetCard: {
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    budgetIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    budgetInfo: {
        flex: 1,
    },
    budgetCategory: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'baseline',
    },
    budgetUsed: {
        fontSize: 14,
        fontWeight: '700',
    },
    budgetLimit: {
        fontSize: 13,
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 10,
    },
    miniProgressBarBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
        flexDirection: 'row',
    },
    miniProgressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    remainingText: {
        fontSize: 12,
        fontWeight: '700',
    },
    emptyCard: {
        height: 110,
        borderRadius: 20,
        borderWidth: 2,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyCardText: {
        fontSize: 13,
        fontWeight: '700',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyStateTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    emptyStateDesc: {
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: 40,
        lineHeight: 20,
    },
    modalFull: {
        flex: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '800',
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 1,
    },
    totalBudgetCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        gap: 14,
    },
    totalBudgetIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    totalBudgetTitle: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 2,
    },
    totalBudgetDesc: {
        fontSize: 12,
        fontWeight: '500',
        lineHeight: 16,
    },
    radioOuter: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    divider: {
        height: 1,
        marginBottom: 20,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    categoryGridItem: {
        width: '30%',
        flexGrow: 1,
        minWidth: 100,
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        borderRadius: 16,
        borderWidth: 1,
        gap: 8,
    },
    categoryGridIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    categoryGridText: {
        fontSize: 11,
        fontWeight: '700',
        textAlign: 'center',
    },
    amountInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        paddingHorizontal: 20,
        height: 64,
    },
    amountCurrency: {
        fontSize: 24,
        fontWeight: '900',
        marginRight: 8,
    },
    amountInput: {
        flex: 1,
        fontSize: 28,
        fontWeight: '900',
    },
    allocationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginTop: 12,
    },
    allocationText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
    },
    saveButton: {
        height: 60,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '800',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '900',
        marginBottom: 6,
    },
    sectionDesc: {
        fontSize: 13,
        fontWeight: '500',
        lineHeight: 18,
        marginBottom: 16,
    },
    envelopeBar: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        marginBottom: 16,
    },
    envelopeBarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    envelopeBarLabel: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    envelopeBarValue: {
        fontSize: 14,
        fontWeight: '800',
    },
    envelopeTrack: {
        height: 10,
        borderRadius: 5,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    envelopeFill: {
        height: '100%',
        borderRadius: 5,
    },
    envelopeRemaining: {
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
    },
    noTotalHint: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        marginBottom: 16,
    },
    noTotalHintText: {
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
        lineHeight: 18,
    },
    categoryExisting: {
        fontSize: 11,
        fontWeight: '800',
    },
    amountHint: {
        fontSize: 13,
        fontWeight: '700',
        marginBottom: 8,
    },
});
