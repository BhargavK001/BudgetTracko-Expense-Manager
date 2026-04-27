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
    const { budgets, addBudget, updateBudget, deleteBudget, getCategoryBreakdown, isLoading, refreshBudgets } = useTransactions();
    const { formatCurrency, triggerHaptic } = useSettings();

    const [activePeriod, setActivePeriod] = useState('monthly');
    const [tabWidth, setTabWidth] = useState(0);
    const slideAnim = useRef(new RNAnimated.Value(0)).current;

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

    const activeMonth = new Date().getMonth();
    const activeYear = new Date().getFullYear();

    const categoryBreakdown = useMemo(() =>
        getCategoryBreakdown(activeMonth, activeYear),
        [getCategoryBreakdown, activeMonth, activeYear]);

    const filteredBudgets = useMemo(() => {
        return budgets.filter(b => b.period === activePeriod).map(b => {
            const actualSpent = categoryBreakdown.find(c => c.name === b.category)?.amount || 0;
            return {
                ...b,
                spent: actualSpent,
                percent: b.amount > 0 ? (actualSpent / b.amount) * 100 : 0
            };
        });
    }, [budgets, activePeriod, categoryBreakdown]);

    const totalBudget = filteredBudgets.reduce((a, b) => a + b.amount, 0);
    const totalSpent = filteredBudgets.reduce((a, b) => a + (b.spent || 0), 0);
    const totalPercent = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

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

        try {
            if (editingBudget) {
                await updateBudget(editingBudget.id, {
                    category: formCategory as any,
                    amount: Number(formAmount),
                    period: activePeriod as any
                });
            } else {
                await addBudget({
                    category: formCategory as any,
                    amount: Number(formAmount),
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
                    style={[styles.periodContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]} 
                    onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / PERIODS.length)}
                >
                    {tabWidth > 0 && (
                        <RNAnimated.View style={[
                            styles.activeTabIndicator,
                            { 
                                width: tabWidth - 8, 
                                transform: [{ translateX: slideAnim }],
                                backgroundColor: tokens.purple.stroke || '#6366F1',
                                shadowColor: tokens.purple.stroke || '#6366F1'
                            }
                        ]} />
                    )}
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p.key}
                            style={styles.periodButton}
                            onPress={() => { triggerHaptic(); setActivePeriod(p.key); }}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={p.icon as any}
                                size={14}
                                color={activePeriod === p.key ? '#fff' : tokens.textMuted}
                            />
                            <Text style={[
                                styles.periodLabel,
                                { color: activePeriod === p.key ? '#fff' : tokens.textMuted },
                                activePeriod === p.key && styles.periodLabelActive
                            ]}>{p.label}</Text>
                        </TouchableOpacity>
                    ))}
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
                    <View style={[styles.progressBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    flex: totalPercent / 100,
                                    backgroundColor: getProgressColor(totalPercent)
                                }
                            ]}
                        />
                        <View style={{ flex: Math.max((100 - totalPercent) / 100, 0) }} />
                    </View>
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
                                    <View style={[styles.budgetIconContainer, { backgroundColor: (CATEGORY_COLORS[budget.category as Category] || '#795548') + (isDarkMode ? '25' : '15') }]}>
                                        <Ionicons name={(CATEGORY_ICONS[budget.category as Category] || 'ellipsis-horizontal-circle-outline') as any} size={20} color={CATEGORY_COLORS[budget.category as Category] || '#795548'} />
                                    </View>
                                    <View style={styles.budgetInfo}>
                                        <Text style={[styles.budgetCategory, { color: tokens.textPrimary }]}>{budget.category}</Text>
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
                                <View style={[styles.miniProgressBarBg, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                                    <View
                                        style={[
                                            styles.miniProgressBarFill,
                                            {
                                                flex: Math.min(budget.percent, 100) / 100,
                                                backgroundColor: getProgressColor(budget.percent)
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

            {/* Modal Form */}
            <Modal
                visible={showForm}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowForm(false)}
            >
                <View style={styles.modalOverlay}>
                    <Animated.View entering={FadeInDown.duration(300).springify()} style={[styles.modalContent, { backgroundColor: tokens.bgPrimary }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: tokens.textPrimary }]}>{editingBudget ? 'Edit Budget' : 'Add Budget'}</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                <Ionicons name="close-circle" size={28} color={tokens.textMuted} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={[styles.formGroup, { marginTop: 8 }]}>
                                <Text style={[styles.label, { color: tokens.textMuted }]}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryChip,
                                                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' },
                                                formCategory === cat && [styles.categoryChipActive, { backgroundColor: tokens.purple.stroke || '#6366F1' }]
                                            ]}
                                            onPress={() => { triggerHaptic(); setFormCategory(cat); }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[
                                                styles.categoryChipText,
                                                { color: tokens.textPrimary },
                                                formCategory === cat && styles.categoryChipTextActive
                                            ]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={[styles.label, { color: tokens.textMuted }]}>Amount ({formatCurrency(0).charAt(0)})</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5', color: tokens.textPrimary }]}
                                    placeholder="e.g. 5000"
                                    placeholderTextColor={tokens.textMuted}
                                    keyboardType="numeric"
                                    value={formAmount}
                                    onChangeText={setFormAmount}
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.saveButton, { backgroundColor: tokens.purple.stroke || '#6366F1', shadowColor: tokens.purple.stroke || '#6366F1' }]} 
                                onPress={handleSave} 
                                activeOpacity={0.8}
                            >
                                <Text style={styles.saveButtonText}>Save Budget</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </View>
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
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    periodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    activeTabIndicator: {
        position: 'absolute',
        height: '100%',
        top: 4,
        left: 4,
        borderRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    periodLabel: {
        fontSize: 12,
        fontWeight: '700',
    },
    periodLabelActive: {
        color: '#fff',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 24,
        paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '900',
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
    categoryScroll: {
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        marginRight: 10,
    },
    categoryChipActive: {
        // backgroundColor set dynamically
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '700',
    },
    categoryChipTextActive: {
        color: '#fff',
    },
    input: {
        borderRadius: 16,
        padding: 18,
        fontSize: 18,
        fontWeight: '800',
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
});
