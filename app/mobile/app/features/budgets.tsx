import React, { useState, useMemo, useCallback } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactions, EXPENSE_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, Category } from '@/context/TransactionContext';
import { useSettings } from '@/context/SettingsContext';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

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

    if (isLoading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top }]}>
                <StatusBar barStyle="dark-content" />
                <Animated.View entering={FadeIn.delay(50)} style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                        <Ionicons name="arrow-back" size={20} color="#111" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Budgets</Text>
                    <View style={{ width: 40 }} />
                </Animated.View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={{ marginTop: 12, color: '#8E8E93', fontSize: 13, fontWeight: '600' }}>Loading budgets…</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <Animated.View entering={FadeIn.delay(50)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Budgets</Text>
                <TouchableOpacity onPress={openAddForm} style={styles.addButton} activeOpacity={0.7}>
                    <Ionicons name="add" size={24} color="#6366F1" />
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
                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.periodContainer}>
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p.key}
                            style={[
                                styles.periodButton,
                                activePeriod === p.key && styles.periodButtonActive
                            ]}
                            onPress={() => { triggerHaptic(); setActivePeriod(p.key); }}
                            activeOpacity={0.8}
                        >
                            <Ionicons
                                name={p.icon as any}
                                size={14}
                                color={activePeriod === p.key ? '#fff' : '#8E8E93'}
                            />
                            <Text style={[
                                styles.periodLabel,
                                activePeriod === p.key && styles.periodLabelActive
                            ]}>{p.label}</Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>

                {/* Overview Card */}
                <Animated.View entering={FadeInDown.delay(150).duration(400).springify()} style={styles.overviewCard}>
                    <View style={styles.overviewHeader}>
                        <View>
                            <Text style={styles.overviewLabel}>Total {activePeriod} Budget</Text>
                            <Text style={styles.overviewValue}>
                                {formatCurrency(totalSpent)} <Text style={styles.overviewTotal}>/ {formatCurrency(totalBudget)}</Text>
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
                    <View style={styles.progressBarBg}>
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
                                style={styles.budgetCard}
                            >
                                <View style={styles.budgetHeader}>
                                    <View style={[styles.budgetIconContainer, { backgroundColor: (CATEGORY_COLORS[budget.category as Category] || '#795548') + '15' }]}>
                                        <Ionicons name={(CATEGORY_ICONS[budget.category as Category] || 'ellipsis-horizontal-circle-outline') as any} size={20} color={CATEGORY_COLORS[budget.category as Category] || '#795548'} />
                                    </View>
                                    <View style={styles.budgetInfo}>
                                        <Text style={styles.budgetCategory}>{budget.category}</Text>
                                        <View style={styles.row}>
                                            <Text style={styles.budgetUsed}>{formatCurrency(budget.spent)}</Text>
                                            <Text style={styles.budgetLimit}> / {formatCurrency(budget.amount)}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => {
                                                triggerHaptic();
                                                setEditingBudget(budget);
                                                setFormCategory(budget.category);
                                                setFormAmount(budget.amount.toString());
                                                setShowForm(true);
                                            }}
                                        >
                                            <Ionicons name="pencil-outline" size={16} color="#8E8E93" />
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={[styles.actionButton, { marginLeft: 8, backgroundColor: 'rgba(244,63,94,0.05)' }]}
                                            onPress={() => handleDelete(budget.id)}
                                        >
                                            <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {/* Mini Progress Bar (flex-based) */}
                                <View style={styles.miniProgressBarBg}>
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
                                        { color: budget.percent > 100 ? '#F43F5E' : '#8E8E93' }
                                    ]}>
                                        {budget.percent > 100 ? 'Over Budget!' : `${(100 - budget.percent).toFixed(0)}% remaining`}
                                    </Text>
                                </View>
                            </Animated.View>
                        </Animated.View>
                    ))}

                    <Animated.View entering={FadeInDown.delay(200 + filteredBudgets.length * 50).duration(400).springify()}>
                        <TouchableOpacity style={styles.emptyCard} onPress={openAddForm} activeOpacity={0.7}>
                            <Ionicons name="add-circle-outline" size={32} color="#C7C7CC" />
                            <Text style={styles.emptyCardText}>Add New Budget</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {filteredBudgets.length === 0 && (
                    <Animated.View entering={FadeIn.delay(300)} style={styles.emptyState}>
                        <Ionicons name="pie-chart-outline" size={64} color="#E5E5EA" />
                        <Text style={styles.emptyStateTitle}>No budgets yet</Text>
                        <Text style={styles.emptyStateDesc}>Set your first budget to start tracking your spending.</Text>
                    </Animated.View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modal Form */}
            <Modal
                visible={showForm}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowForm(false)}
            >
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <View style={styles.modalOverlay}>
                        <Animated.View entering={FadeInDown.duration(300).springify()} style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{editingBudget ? 'Edit Budget' : 'Add Budget'}</Text>
                                <TouchableOpacity onPress={() => setShowForm(false)}>
                                    <Ionicons name="close-circle" size={28} color="#C7C7CC" />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Category</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                                    {EXPENSE_CATEGORIES.map(cat => (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryChip,
                                                formCategory === cat && styles.categoryChipActive
                                            ]}
                                            onPress={() => { triggerHaptic(); setFormCategory(cat); }}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[
                                                styles.categoryChipText,
                                                formCategory === cat && styles.categoryChipTextActive
                                            ]}>{cat}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Amount ({formatCurrency(0).charAt(0)})</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. 5000"
                                    placeholderTextColor="#C7C7CC"
                                    keyboardType="numeric"
                                    value={formAmount}
                                    onChangeText={setFormAmount}
                                />
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
                                <Text style={styles.saveButtonText}>Save Budget</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    addButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(99,102,241,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    periodContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 4,
        marginBottom: 24,
    },
    periodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        gap: 6,
        borderRadius: 12,
    },
    periodButtonActive: {
        backgroundColor: '#6366F1',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    periodLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#8E8E93',
    },
    periodLabelActive: {
        color: '#FFFFFF',
    },
    overviewCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
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
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    overviewValue: {
        fontSize: 28,
        fontWeight: '900',
        color: '#111',
    },
    overviewTotal: {
        fontSize: 16,
        color: '#8E8E93',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 14,
        backgroundColor: '#F5F5F5',
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
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
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
        backgroundColor: '#F5F5F5',
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
        color: '#111',
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    budgetUsed: {
        fontSize: 14,
        fontWeight: '700',
        color: '#111',
    },
    budgetLimit: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '500',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: '#F5F5F5',
    },
    miniProgressBarBg: {
        height: 8,
        backgroundColor: '#F5F5F5',
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
    },
    remainingText: {
        fontSize: 11,
        fontWeight: '700',
    },
    emptyCard: {
        height: 110,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        borderStyle: 'dashed',
        backgroundColor: '#FAFAFA',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyCardText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#8E8E93',
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
        color: '#111',
    },
    emptyStateDesc: {
        fontSize: 14,
        color: '#8E8E93',
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
        backgroundColor: '#fff',
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
        color: '#111',
    },
    formGroup: {
        marginBottom: 24,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: '#8E8E93',
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
        backgroundColor: '#F5F5F5',
        marginRight: 10,
    },
    categoryChipActive: {
        backgroundColor: '#6366F1',
    },
    categoryChipText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3A3A3C',
    },
    categoryChipTextActive: {
        color: '#FFFFFF',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        padding: 18,
        color: '#111',
        fontSize: 18,
        fontWeight: '800',
    },
    saveButton: {
        backgroundColor: '#6366F1',
        borderRadius: 16,
        paddingVertical: 18,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
});
