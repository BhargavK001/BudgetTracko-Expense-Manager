import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';
import {
    TransactionType,
    Category,
    EXPENSE_CATEGORIES,
    INCOME_CATEGORIES,
    CATEGORY_ICONS,
    CATEGORY_COLORS,
    useTransactions,
} from '@/context/TransactionContext';

const ACCOUNTS = ['Cash', 'Bank Account', 'Slice'];

interface AddTransactionModalProps {
    visible: boolean;
    onClose: () => void;
}

export default function AddTransactionModal({ visible, onClose }: AddTransactionModalProps) {
    const { addTransaction } = useTransactions();

    const [type, setType] = useState<TransactionType>('expense');
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<Category | null>(null);
    const [account, setAccount] = useState<string>('Cash');
    const [isSaving, setIsSaving] = useState(false);

    const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

    const reset = () => {
        setType('expense');
        setTitle('');
        setAmount('');
        setCategory(null);
        setAccount('Cash');
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Missing Title', 'Please enter a title for this transaction.');
            return;
        }
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
            Alert.alert('Invalid Amount', 'Please enter a valid amount greater than 0.');
            return;
        }
        if (!category) {
            Alert.alert('Missing Category', 'Please select a category.');
            return;
        }

        setIsSaving(true);
        try {
            await addTransaction({
                title: title.trim(),
                amount: numAmount,
                type,
                category,
                date: new Date().toISOString(),
                account,
            });
            reset();
            onClose();
        } catch (e) {
            Alert.alert('Error', 'Failed to save transaction. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    {/* ─── Header ─── */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Add Transaction</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Ionicons name="close" size={22} color={DarkTheme.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.scrollContent}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* ─── Type Toggle ─── */}
                        <View style={styles.typeRow}>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'expense' && styles.typeBtnActiveExpense]}
                                onPress={() => { setType('expense'); setCategory(null); }}
                            >
                                <Ionicons
                                    name="arrow-down-circle"
                                    size={18}
                                    color={type === 'expense' ? '#FFFFFF' : DarkTheme.textMuted}
                                />
                                <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
                                    Expense
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
                                onPress={() => { setType('income'); setCategory(null); }}
                            >
                                <Ionicons
                                    name="arrow-up-circle"
                                    size={18}
                                    color={type === 'income' ? '#FFFFFF' : DarkTheme.textMuted}
                                />
                                <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
                                    Income
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* ─── Amount ─── */}
                        <View style={styles.amountContainer}>
                            <Text style={styles.currencySymbol}>₹</Text>
                            <TextInput
                                style={styles.amountInput}
                                placeholder="0"
                                placeholderTextColor={DarkTheme.textMuted}
                                value={amount}
                                onChangeText={setAmount}
                                keyboardType="numeric"
                                returnKeyType="done"
                            />
                        </View>

                        {/* ─── Title ─── */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>TITLE</Text>
                            <View style={styles.inputRow}>
                                <Ionicons name="pencil-outline" size={18} color={DarkTheme.textMuted} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="e.g. Coffee, Salary..."
                                    placeholderTextColor={DarkTheme.textMuted}
                                    value={title}
                                    onChangeText={setTitle}
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        {/* ─── Category ─── */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>CATEGORY</Text>
                            <View style={styles.categoryGrid}>
                                {categories.map((cat) => {
                                    const isSelected = category === cat;
                                    const color = CATEGORY_COLORS[cat];
                                    const icon = CATEGORY_ICONS[cat] as any;
                                    return (
                                        <TouchableOpacity
                                            key={cat}
                                            style={[
                                                styles.categoryChip,
                                                isSelected && { borderColor: color, backgroundColor: color + '22' },
                                            ]}
                                            onPress={() => setCategory(cat)}
                                        >
                                            <Ionicons name={icon} size={16} color={isSelected ? color : DarkTheme.textMuted} />
                                            <Text
                                                style={[styles.categoryChipText, isSelected && { color }]}
                                                numberOfLines={1}
                                            >
                                                {cat}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* ─── Account ─── */}
                        <View style={styles.fieldGroup}>
                            <Text style={styles.fieldLabel}>ACCOUNT</Text>
                            <View style={styles.accountRow}>
                                {ACCOUNTS.map((acc) => {
                                    const isSelected = account === acc;
                                    return (
                                        <TouchableOpacity
                                            key={acc}
                                            style={[styles.accountChip, isSelected && styles.accountChipActive]}
                                            onPress={() => setAccount(acc)}
                                        >
                                            <Text style={[styles.accountChipText, isSelected && styles.accountChipTextActive]}>
                                                {acc}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>
                    </ScrollView>

                    {/* ─── Save Button ─── */}
                    <TouchableOpacity
                        style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
                        onPress={handleSave}
                        activeOpacity={0.8}
                        disabled={isSaving}
                    >
                        <Text style={styles.saveBtnText}>{isSaving ? 'Saving...' : 'Save Transaction'}</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: DarkTheme.bg,
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        maxHeight: '92%',
        borderTopWidth: 2,
        borderLeftWidth: 2,
        borderRightWidth: 2,
        borderColor: DarkTheme.neoBorder,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 1.5,
        borderBottomColor: DarkTheme.neoBorder,
    },
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    closeBtn: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        paddingHorizontal: Spacing.xl,
        paddingTop: Spacing.xl,
        paddingBottom: Spacing.md,
    },
    // ─── Type Toggle ───
    typeRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    typeBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    typeBtnActiveExpense: {
        backgroundColor: DarkTheme.spending,
        borderColor: DarkTheme.spending,
    },
    typeBtnActiveIncome: {
        backgroundColor: DarkTheme.income,
        borderColor: DarkTheme.income,
    },
    typeBtnText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: DarkTheme.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    typeBtnTextActive: {
        color: '#FFFFFF',
    },
    // ─── Amount ───
    amountContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.xxl,
        paddingVertical: Spacing.lg,
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    currencySymbol: {
        fontSize: 36,
        fontWeight: '900',
        color: DarkTheme.brandYellow,
        marginRight: Spacing.xs,
    },
    amountInput: {
        fontSize: 36,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        minWidth: 100,
        textAlign: 'center',
    },
    // ─── Fields ───
    fieldGroup: {
        marginBottom: Spacing.xl,
    },
    fieldLabel: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: DarkTheme.textSecondary,
        letterSpacing: 1,
        marginBottom: Spacing.sm,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.sm,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    inputIcon: {
        marginRight: Spacing.sm,
    },
    textInput: {
        flex: 1,
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '600',
    },
    // ─── Category ───
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    categoryChipText: {
        fontSize: FontSize.xs,
        fontWeight: '700',
        color: DarkTheme.textMuted,
    },
    // ─── Account ───
    accountRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
    },
    accountChip: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    accountChipActive: {
        backgroundColor: DarkTheme.brandYellow,
        borderColor: DarkTheme.brandYellow,
    },
    accountChipText: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: DarkTheme.textMuted,
    },
    accountChipTextActive: {
        color: DarkTheme.brandBlack,
        fontWeight: '800',
    },
    // ─── Save ───
    saveBtn: {
        marginHorizontal: Spacing.xl,
        marginBottom: Spacing.xxl,
        marginTop: Spacing.sm,
        backgroundColor: DarkTheme.brandYellow,
        borderRadius: BorderRadius.sm,
        paddingVertical: Spacing.lg,
        alignItems: 'center',
        borderWidth: 2.5,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadowSm,
    },
    saveBtnDisabled: {
        opacity: 0.6,
    },
    saveBtnText: {
        fontSize: FontSize.md,
        fontWeight: '900',
        color: DarkTheme.brandBlack,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
});
