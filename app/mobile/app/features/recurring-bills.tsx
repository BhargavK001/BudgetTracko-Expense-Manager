import React, { useState, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Modal,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeOut, Layout } from 'react-native-reanimated';
import {
    DarkTheme,
    Spacing,
    FontSize,
    BorderRadius,
    NeoShadowSm,
} from '@/constants/Theme';

const PRESETS = [
    { name: 'Rent', category: 'Housing', amount: 15000 },
    { name: 'Netflix', category: 'Entertainment', amount: 649 },
    { name: 'Prime Video', category: 'Entertainment', amount: 299 },
    { name: 'Mess', category: 'Food', amount: 3000 },
];

export default function RecurringBillsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<any>(null);

    // Mock Data
    const [bills, setBills] = useState([
        { id: '1', name: 'Rent', category: 'Housing', amount: 15000, dueDate: 1, frequency: 'monthly', autoPay: true },
        { id: '2', name: 'Netflix', category: 'Entertainment', amount: 649, dueDate: 15, frequency: 'monthly', autoPay: false },
    ]);

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        dueDate: '1',
        category: 'Bills',
        frequency: 'monthly',
        autoPay: false
    });

    const sortedBills = useMemo(() => {
        return [...bills].sort((a, b) => a.dueDate - b.dueDate);
    }, [bills]);

    const totalMonthly = useMemo(() => {
        return bills.reduce((acc, curr) => {
            return acc + (curr.frequency === 'yearly' ? curr.amount / 12 : curr.amount);
        }, 0);
    }, [bills]);

    const handleOpenModal = (bill: any = null) => {
        if (bill) {
            setEditingBill(bill);
            setFormData({
                name: bill.name,
                amount: bill.amount.toString(),
                dueDate: bill.dueDate.toString(),
                category: bill.category,
                frequency: bill.frequency,
                autoPay: bill.autoPay
            });
        } else {
            setEditingBill(null);
            setFormData({
                name: '',
                amount: '',
                dueDate: '1',
                category: 'Bills',
                frequency: 'monthly',
                autoPay: false
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (!formData.name || !formData.amount) return;

        const newBill = {
            id: editingBill ? editingBill.id : Date.now().toString(),
            name: formData.name,
            amount: Number(formData.amount),
            dueDate: Number(formData.dueDate),
            category: formData.category,
            frequency: formData.frequency,
            autoPay: formData.autoPay
        };

        if (editingBill) {
            setBills(prev => prev.map(b => b.id === editingBill.id ? newBill : b));
        } else {
            setBills(prev => [...prev, newBill]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (id: string) => {
        setBills(prev => prev.filter(b => b.id !== id));
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recurring Bills</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Stats Summary */}
                <View style={styles.statsContainer}>
                    <View style={styles.statsIcon}>
                        <Ionicons name="calendar-clear-outline" size={24} color={DarkTheme.brandYellow} />
                    </View>
                    <View>
                        <Text style={styles.statsLabel}>Total Monthly Estimate</Text>
                        <Text style={styles.statsValue}>₹{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 0 })}</Text>
                    </View>
                </View>

                {/* List Header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Subscriptions</Text>
                    <TouchableOpacity style={styles.addInlineButton} onPress={() => handleOpenModal()}>
                        <Ionicons name="add" size={20} color={DarkTheme.brandBlack} />
                        <Text style={styles.addInlineText}>Add New</Text>
                    </TouchableOpacity>
                </View>

                {/* Bills List */}
                {sortedBills.map((bill, index) => (
                    <Animated.View
                        key={bill.id}
                        entering={FadeInDown.delay(index * 50)}
                        layout={Layout.springify()}
                        style={styles.billCard}
                    >
                        <View style={styles.billHeader}>
                            <View>
                                <Text style={styles.billName}>{bill.name}</Text>
                                <View style={styles.categoryBadge}>
                                    <Text style={styles.categoryText}>{bill.category}</Text>
                                </View>
                            </View>
                            <View style={styles.actionButtons}>
                                <TouchableOpacity onPress={() => handleOpenModal(bill)} style={styles.iconButton}>
                                    <Ionicons name="pencil-outline" size={16} color={DarkTheme.textSecondary} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(bill.id)} style={[styles.iconButton, { marginLeft: 10 }]}>
                                    <Ionicons name="trash-outline" size={16} color={DarkTheme.spending} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.billDetails}>
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIcon, { backgroundColor: DarkTheme.income + '22' }]}>
                                    <Ionicons name="cash-outline" size={16} color={DarkTheme.income} />
                                </View>
                                <View>
                                    <Text style={styles.detailValue}>₹{bill.amount.toLocaleString()}</Text>
                                    <Text style={styles.detailLabel}>{bill.frequency === 'monthly' ? 'Monthly' : 'Yearly'}</Text>
                                </View>
                            </View>
                            <View style={styles.detailItem}>
                                <View style={[styles.detailIcon, { backgroundColor: '#2196F322' }]}>
                                    <Ionicons name="calendar-outline" size={16} color="#2196F3" />
                                </View>
                                <View>
                                    <Text style={styles.detailValue}>Day {bill.dueDate}</Text>
                                    <Text style={styles.detailLabel}>Due Date</Text>
                                </View>
                            </View>
                        </View>

                        {bill.autoPay && (
                            <View style={styles.autoPayBanner}>
                                <Ionicons name="flash" size={12} color={DarkTheme.brandBlack} />
                                <Text style={styles.autoPayText}>Auto-pay Enabled</Text>
                            </View>
                        )}
                    </Animated.View>
                ))}

                {sortedBills.length === 0 && (
                    <View style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color={DarkTheme.textMuted} />
                        <Text style={styles.emptyTitle}>No recurring bills</Text>
                        <Text style={styles.emptyDesc}>Add your rent, subscriptions or utilities here to track them easily.</Text>
                    </View>
                )}

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Modal Form */}
            <Modal
                visible={isModalOpen}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setIsModalOpen(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingBill ? 'Edit Bill' : 'New Bill'}</Text>
                            <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                                <Ionicons name="close" size={24} color={DarkTheme.textPrimary} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalForm} showsVerticalScrollIndicator={false}>

                            {!editingBill && (
                                <View style={styles.formSection}>
                                    <Text style={styles.label}>Quick Add</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetScroll}>
                                        {PRESETS.map(p => (
                                            <TouchableOpacity
                                                key={p.name}
                                                style={styles.presetChip}
                                                onPress={() => setFormData({
                                                    ...formData,
                                                    name: p.name,
                                                    category: p.category,
                                                    amount: p.amount.toString()
                                                })}
                                            >
                                                <Text style={styles.presetChipText}>{p.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            )}

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Bill Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="e.g. Netflix"
                                    placeholderTextColor={DarkTheme.textMuted}
                                    value={formData.name}
                                    onChangeText={(val) => setFormData({ ...formData, name: val })}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                                    <Text style={styles.label}>Amount (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor={DarkTheme.textMuted}
                                        keyboardType="numeric"
                                        value={formData.amount}
                                        onChangeText={(val) => setFormData({ ...formData, amount: val })}
                                    />
                                </View>
                                <View style={[styles.formGroup, { flex: 1 }]}>
                                    <Text style={styles.label}>Due Date (1-31)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="1"
                                        placeholderTextColor={DarkTheme.textMuted}
                                        keyboardType="numeric"
                                        maxLength={2}
                                        value={formData.dueDate}
                                        onChangeText={(val) => setFormData({ ...formData, dueDate: val })}
                                    />
                                </View>
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Category</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Category"
                                    placeholderTextColor={DarkTheme.textMuted}
                                    value={formData.category}
                                    onChangeText={(val) => setFormData({ ...formData, category: val })}
                                />
                            </View>

                            <View style={styles.switchGroup}>
                                <View>
                                    <Text style={styles.switchLabel}>Auto-Pay</Text>
                                    <Text style={styles.switchSubLabel}>Mark if this is automatically deducted</Text>
                                </View>
                                <Switch
                                    value={formData.autoPay}
                                    onValueChange={(val) => setFormData({ ...formData, autoPay: val })}
                                    trackColor={{ false: '#333', true: DarkTheme.brandYellow + '88' }}
                                    thumbColor={formData.autoPay ? DarkTheme.brandYellow : '#666'}
                                />
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                                <Text style={styles.saveButtonText}>{editingBill ? 'Update Bill' : 'Save Bill'}</Text>
                            </TouchableOpacity>

                            <View style={{ height: 40 }} />
                        </ScrollView>
                    </View>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.lg,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 2,
        borderColor: DarkTheme.brandYellow + '44',
        gap: Spacing.md,
    },
    statsIcon: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.brandYellow + '22',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: DarkTheme.brandYellow + '44',
    },
    statsLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    statsValue: {
        fontSize: FontSize.xl,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    addInlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DarkTheme.brandYellow,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: BorderRadius.sm,
        borderWidth: 1.5,
        borderColor: DarkTheme.brandBlack,
        gap: 4,
    },
    addInlineText: {
        fontSize: 10,
        fontWeight: '900',
        color: DarkTheme.brandBlack,
        textTransform: 'uppercase',
    },
    billCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 2,
        borderColor: DarkTheme.neoBorder,
    },
    billHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    billName: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: 4,
    },
    categoryBadge: {
        backgroundColor: DarkTheme.bg,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
        textTransform: 'uppercase',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 8,
        backgroundColor: DarkTheme.bg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
    },
    billDetails: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: DarkTheme.separator,
        paddingTop: Spacing.md,
        gap: Spacing.xl,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    detailIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailValue: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        lineHeight: 18,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: DarkTheme.textMuted,
        textTransform: 'uppercase',
    },
    autoPayBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DarkTheme.brandYellow,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: Spacing.md,
        gap: 4,
        alignSelf: 'flex-start',
    },
    autoPayText: {
        fontSize: 10,
        fontWeight: '900',
        color: DarkTheme.brandBlack,
        textTransform: 'uppercase',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 12,
    },
    emptyTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    emptyDesc: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        textAlign: 'center',
        maxWidth: '80%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: DarkTheme.bg,
        borderTopLeftRadius: BorderRadius.lg,
        borderTopRightRadius: BorderRadius.lg,
        maxHeight: '85%',
        borderTopWidth: 3,
        borderTopColor: DarkTheme.brandYellow,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: DarkTheme.separator,
    },
    modalTitle: {
        fontSize: FontSize.xl,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        textTransform: 'uppercase',
    },
    modalForm: {
        padding: Spacing.xl,
    },
    formSection: {
        marginBottom: Spacing.xl,
    },
    formGroup: {
        marginBottom: Spacing.lg,
    },
    label: {
        fontSize: 12,
        fontWeight: '800',
        color: DarkTheme.textSecondary,
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    presetScroll: {
        marginHorizontal: -Spacing.xl,
        paddingHorizontal: Spacing.xl,
    },
    presetChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
        marginRight: 8,
    },
    presetChipText: {
        fontSize: 12,
        fontWeight: '700',
        color: DarkTheme.textPrimary,
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
    row: {
        flexDirection: 'row',
    },
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: DarkTheme.cardBg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
        marginBottom: Spacing.xl,
    },
    switchLabel: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    switchSubLabel: {
        fontSize: 10,
        color: DarkTheme.textMuted,
        marginTop: 2,
    },
    saveButton: {
        backgroundColor: DarkTheme.brandYellow,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.sm,
        alignItems: 'center',
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
