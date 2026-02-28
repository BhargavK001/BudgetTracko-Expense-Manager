import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import {
    DarkTheme,
    Spacing,
    FontSize,
    BorderRadius,
    NeoShadowSm,
} from '@/constants/Theme';
import { useTransactions, EXPENSE_CATEGORIES, CATEGORY_ICONS, CATEGORY_COLORS, Category } from '@/context/TransactionContext';

const PERIODS = [

    { key: 'weekly', label: 'Weekly', icon: 'calendar-outline' },
    { key: 'monthly', label: 'Monthly', icon: 'calendar' },
    { key: 'yearly', label: 'Yearly', icon: 'calendar-number-outline' },
];

export default function BudgetsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { getCategoryBreakdown } = useTransactions();

    const [activePeriod, setActivePeriod] = useState('monthly');
    const [showForm, setShowForm] = useState(false);
    const [editingBudget, setEditingBudget] = useState<any>(null);

    // Form State
    const [formCategory, setFormCategory] = useState('');
    const [formAmount, setFormAmount] = useState('');

    // Mock Budgets (Local only for now)
    const [budgets, setBudgets] = useState([
        { id: '1', category: 'Food and Dining', amount: 5000, period: 'monthly' },
        { id: '2', category: 'Transport', amount: 2000, period: 'monthly' },
        { id: '3', category: 'Shopping', amount: 3000, period: 'monthly' },
    ]);

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

    const openAddForm = () => {
        setEditingBudget(null);
        setFormCategory('');
        setFormAmount('');
        setShowForm(true);
    };

    const handleSave = () => {
        if (!formCategory || !formAmount) return;

        if (editingBudget) {
            setBudgets(prev => prev.map(b => b.id === editingBudget.id ? {
                ...b,
                category: formCategory as any,
                amount: Number(formAmount)
            } : b));
        } else {
            setBudgets(prev => [...prev, {
                id: Date.now().toString(),
                category: formCategory as any,
                amount: Number(formAmount),
                period: activePeriod
            }]);
        }
        setShowForm(false);
    };

    const handleDelete = (id: string) => {
        setBudgets(prev => prev.filter(b => b.id !== id));
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Budgets</Text>
                <TouchableOpacity onPress={openAddForm} style={styles.addButton}>
                    <Ionicons name="add" size={24} color={DarkTheme.brandYellow} />
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Period Selector */}
                <View style={styles.periodContainer}>
                    {PERIODS.map(p => (
                        <TouchableOpacity
                            key={p.key}
                            style={[
                                styles.periodButton,
                                activePeriod === p.key && styles.periodButtonActive
                            ]}
                            onPress={() => setActivePeriod(p.key)}
                        >
                            <Ionicons
                                name={p.icon as any}
                                size={16}
                                color={activePeriod === p.key ? DarkTheme.brandBlack : DarkTheme.textSecondary}
                            />
                            <Text style={[
                                styles.periodLabel,
                                activePeriod === p.key && styles.periodLabelActive
                            ]}>{p.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Overview Card */}
                <Animated.View entering={FadeInDown.delay(100)} style={styles.overviewCard}>
                    <View style={styles.overviewHeader}>
                        <View>
                            <Text style={styles.overviewLabel}>Total {activePeriod} Budget</Text>
                            <Text style={styles.overviewValue}>
                                ₹{totalSpent.toLocaleString()} <Text style={styles.overviewTotal}>/ ₹{totalBudget.toLocaleString()}</Text>
                            </Text>
                        </View>
                        <View style={[
                            styles.badge,
                            { backgroundColor: totalPercent > 90 ? DarkTheme.spending + '22' : DarkTheme.income + '22' }
                        ]}>
                            <Text style={[
                                styles.badgeText,
                                { color: totalPercent > 90 ? DarkTheme.spending : DarkTheme.income }
                            ]}>{totalPercent.toFixed(0)}% Used</Text>
                        </View>
                    </View>
                    <View style={styles.progressBarBg}>
                        <Animated.View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${totalPercent}%`,
                                    backgroundColor: totalPercent > 90 ? DarkTheme.spending : totalPercent > 70 ? DarkTheme.brandYellow : DarkTheme.income
                                }
                            ]}
                        />
                    </View>
                </Animated.View>

                {/* Budget List */}
                <View style={styles.grid}>
                    {filteredBudgets.map((budget, index) => (
                        <Animated.View
                            key={budget.id}
                            entering={FadeInDown.delay(200 + index * 50)}
                            layout={Layout.springify()}
                            style={styles.budgetCard}
                        >
                            <View style={styles.budgetHeader}>
                                <View style={styles.budgetIconContainer}>
                                    <Ionicons name={CATEGORY_ICONS[budget.category as Category] as any} size={20} color={CATEGORY_COLORS[budget.category as Category]} />
                                </View>
                                <View style={styles.budgetInfo}>
                                    <Text style={styles.budgetCategory}>{budget.category}</Text>
                                    <View style={styles.row}>
                                        <Text style={styles.budgetUsed}>₹{budget.spent.toLocaleString()}</Text>
                                        <Text style={styles.budgetLimit}> / ₹{budget.amount.toLocaleString()}</Text>
                                    </View>
                                </View>

                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => {
                                            setEditingBudget(budget);
                                            setFormCategory(budget.category);
                                            setFormAmount(budget.amount.toString());
                                            setShowForm(true);
                                        }}
                                    >
                                        <Ionicons name="pencil-outline" size={16} color={DarkTheme.textSecondary} />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.actionButton, { marginLeft: 8 }]}
                                        onPress={() => handleDelete(budget.id)}
                                    >
                                        <Ionicons name="trash-outline" size={16} color={DarkTheme.spending} />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.miniProgressBarBg}>
                                <View
                                    style={[
                                        styles.miniProgressBarFill,
                                        {
                                            width: `${Math.min(budget.percent, 100)}%`,
                                            backgroundColor: budget.percent > 90 ? DarkTheme.spending : budget.percent > 70 ? DarkTheme.brandYellow : DarkTheme.income
                                        }
                                    ]}
                                />
                            </View>

                            <View style={styles.budgetFooter}>
                                <Text style={[
                                    styles.remainingText,
                                    { color: budget.percent > 100 ? DarkTheme.spending : DarkTheme.textMuted }
                                ]}>
                                    {budget.percent > 100 ? 'Over Budget!' : `${(100 - budget.percent).toFixed(0)}% remaining`}
                                </Text>
                            </View>
                        </Animated.View>
                    ))}

                    <TouchableOpacity style={styles.emptyCard} onPress={openAddForm}>
                        <Ionicons name="add" size={32} color={DarkTheme.textMuted} />
                        <Text style={styles.emptyCardText}>Add Budget</Text>
                    </TouchableOpacity>
                </View>

                {filteredBudgets.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="pie-chart-outline" size={48} color={DarkTheme.textMuted} />
                        <Text style={styles.emptyStateTitle}>No budgets yet</Text>
                        <Text style={styles.emptyStateDesc}>Set your first budget to start tracking.</Text>
                    </View>
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
                <View style={styles.modalOverlay}>
                    <Animated.View entering={FadeInDown} style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingBudget ? 'Edit Budget' : 'Add Budget'}</Text>
                            <TouchableOpacity onPress={() => setShowForm(false)}>
                                <Ionicons name="close" size={24} color={DarkTheme.textPrimary} />
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
                                        onPress={() => setFormCategory(cat)}
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
                            <Text style={styles.label}>Amount (₹)</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="5000"
                                placeholderTextColor={DarkTheme.textMuted}
                                keyboardType="numeric"
                                value={formAmount}
                                onChangeText={setFormAmount}
                            />
                        </View>

                        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                            <Text style={styles.saveButtonText}>Save Budget</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
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
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: DarkTheme.neoBorder,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        textTransform: 'uppercase',
    },
    addButton: {
        padding: 5,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    periodContainer: {
        flexDirection: 'row',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: 4,
        marginBottom: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    periodButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        gap: 6,
        borderRadius: BorderRadius.sm,
    },
    periodButtonActive: {
        backgroundColor: DarkTheme.brandYellow,
        borderWidth: 1.5,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadowSm,
    },
    periodLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
        textTransform: 'uppercase',
    },
    periodLabelActive: {
        color: DarkTheme.brandBlack,
    },
    overviewCard: {
        backgroundColor: DarkTheme.brandBlack,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        ...NeoShadowSm,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.md,
    },
    overviewLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: '#666',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    overviewValue: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: '#FFF',
    },
    overviewTotal: {
        fontSize: FontSize.sm,
        color: '#444',
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '800',
    },
    progressBarBg: {
        height: 12,
        backgroundColor: '#111',
        borderRadius: 6,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#222',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 6,
    },
    grid: {
        gap: Spacing.md,
    },
    budgetCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    budgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    budgetIconContainer: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.bg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
    },
    budgetInfo: {
        flex: 1,
    },
    budgetCategory: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: 2,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    budgetUsed: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: DarkTheme.textPrimary,
    },
    budgetLimit: {
        fontSize: FontSize.xs,
        color: DarkTheme.textSecondary,
    },
    actionButtons: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 6,
        borderRadius: 6,
        backgroundColor: DarkTheme.bg,
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
    },
    miniProgressBarBg: {
        height: 6,
        backgroundColor: DarkTheme.bg,
        borderRadius: 3,
        overflow: 'hidden',
        marginBottom: Spacing.sm,
    },
    miniProgressBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    remainingText: {
        fontSize: 10,
        fontWeight: '700',
    },
    emptyCard: {
        height: 100,
        borderRadius: BorderRadius.md,
        borderWidth: 2,
        borderColor: DarkTheme.neoBorder,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    emptyCardText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: DarkTheme.textMuted,
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
        gap: 8,
    },
    emptyStateTitle: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    emptyStateDesc: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: DarkTheme.bg,
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
        padding: Spacing.xl,
        borderTopWidth: 2,
        borderTopColor: DarkTheme.brandYellow,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        textTransform: 'uppercase',
    },
    formGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    categoryScroll: {
        marginHorizontal: -Spacing.xl,
        paddingHorizontal: Spacing.xl,
    },
    categoryChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
        marginRight: 8,
    },
    categoryChipActive: {
        backgroundColor: DarkTheme.brandYellow,
        borderColor: DarkTheme.brandBlack,
    },
    categoryChipText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
    },
    categoryChipTextActive: {
        color: DarkTheme.brandBlack,
    },
    input: {
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 2,
        borderColor: DarkTheme.neoBorder,
        borderRadius: BorderRadius.sm,
        padding: Spacing.md,
        color: DarkTheme.textPrimary,
        fontSize: FontSize.md,
        fontWeight: '700',
    },
    saveButton: {
        backgroundColor: DarkTheme.brandYellow,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        marginTop: Spacing.md,
        borderWidth: 2,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadowSm,
    },
    saveButtonText: {
        fontSize: FontSize.md,
        fontWeight: '900',
        color: DarkTheme.brandBlack,
        textTransform: 'uppercase',
    },
});
