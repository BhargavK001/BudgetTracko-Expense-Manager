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
    StatusBar,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';

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
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Recurring Bills</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Stats Summary */}
                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.statsContainer}>
                    <View style={styles.statsIcon}>
                        <Ionicons name="calendar-clear-outline" size={24} color="#F59E0B" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.statsLabel}>Total Monthly Estimate</Text>
                        <Text style={styles.statsValue}>₹{totalMonthly.toLocaleString(undefined, { minimumFractionDigits: 0 })}</Text>
                    </View>
                </Animated.View>

                {/* List Header */}
                <Animated.View entering={FadeInDown.delay(150).duration(400)} style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Your Subscriptions</Text>
                    <TouchableOpacity style={styles.addInlineButton} onPress={() => handleOpenModal()} activeOpacity={0.8}>
                        <Ionicons name="add" size={16} color="#FFFFFF" />
                        <Text style={styles.addInlineText}>Add New</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Bills List */}
                <View style={styles.grid}>
                    {sortedBills.map((bill, index) => (
                        <Animated.View
                            key={bill.id}
                            layout={Layout.springify()}
                        >
                            <Animated.View
                                entering={FadeInDown.delay(200 + index * 50).duration(400).springify()}
                                style={styles.billCard}
                            >
                                <View style={styles.billHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.billTitleRow}>
                                            <Text style={styles.billName}>{bill.name}</Text>
                                            {bill.autoPay && (
                                                <View style={styles.autoPayIcon}>
                                                    <Ionicons name="flash" size={12} color="#F59E0B" />
                                                </View>
                                            )}
                                        </View>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{bill.category}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity onPress={() => handleOpenModal(bill)} style={styles.iconButton} activeOpacity={0.7}>
                                            <Ionicons name="pencil-outline" size={16} color="#8E8E93" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(bill.id)} style={[styles.iconButton, { marginLeft: 8, backgroundColor: 'rgba(244,63,94,0.05)' }]} activeOpacity={0.7}>
                                            <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.billDetails}>
                                    <View style={styles.detailItem}>
                                        <View style={[styles.detailIcon, { backgroundColor: 'rgba(45,202,114,0.1)' }]}>
                                            <Ionicons name="cash-outline" size={16} color="#2DCA72" />
                                        </View>
                                        <View>
                                            <Text style={styles.detailValue}>₹{bill.amount.toLocaleString()}</Text>
                                            <Text style={styles.detailLabel}>{bill.frequency === 'monthly' ? 'Monthly' : 'Yearly'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <View style={[styles.detailIcon, { backgroundColor: 'rgba(56,189,248,0.1)' }]}>
                                            <Ionicons name="calendar-outline" size={16} color="#38BDF8" />
                                        </View>
                                        <View>
                                            <Text style={styles.detailValue}>Day {bill.dueDate}</Text>
                                            <Text style={styles.detailLabel}>Due Date</Text>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        </Animated.View>
                    ))}

                    <Animated.View entering={FadeInDown.delay(200 + sortedBills.length * 50).duration(400).springify()}>
                        <TouchableOpacity style={styles.emptyCard} onPress={() => handleOpenModal()} activeOpacity={0.7}>
                            <Ionicons name="add-circle-outline" size={32} color="#C7C7CC" />
                            <Text style={styles.emptyCardText}>Add New Bill / Subscription</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>

                {sortedBills.length === 0 && (
                    <Animated.View entering={FadeIn.delay(300)} style={styles.emptyState}>
                        <Ionicons name="receipt-outline" size={64} color="#E5E5EA" />
                        <Text style={styles.emptyTitle}>No recurring bills</Text>
                        <Text style={styles.emptyDesc}>Add your rent, subscriptions or utilities here to track them easily.</Text>
                    </Animated.View>
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
                                <Ionicons name="close-circle" size={28} color="#C7C7CC" />
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
                                                activeOpacity={0.8}
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
                                    placeholderTextColor="#C7C7CC"
                                    value={formData.name}
                                    onChangeText={(val) => setFormData({ ...formData, name: val })}
                                />
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                                    <Text style={styles.label}>Amount (₹)</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0"
                                        placeholderTextColor="#C7C7CC"
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
                                        placeholderTextColor="#C7C7CC"
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
                                    placeholderTextColor="#C7C7CC"
                                    value={formData.category}
                                    onChangeText={(val) => setFormData({ ...formData, category: val })}
                                />
                            </View>

                            <View style={styles.switchGroup}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.switchLabel}>Auto-Pay</Text>
                                    <Text style={styles.switchSubLabel}>Mark if this is automatically deducted</Text>
                                </View>
                                <Switch
                                    value={formData.autoPay}
                                    onValueChange={(val) => setFormData({ ...formData, autoPay: val })}
                                    trackColor={{ false: '#E5E5EA', true: '#6366F1' }}
                                    thumbColor="#fff"
                                    ios_backgroundColor="#E5E5EA"
                                />
                            </View>

                            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        marginBottom: 32,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
        gap: 16,
    },
    statsIcon: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: 'rgba(245,158,11,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(245,158,11,0.2)',
    },
    statsLabel: {
        fontSize: 11,
        fontWeight: '800',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 2,
    },
    statsValue: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
    },
    addInlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#6366F1',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    addInlineText: {
        fontSize: 11,
        fontWeight: '800',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    grid: {
        gap: 16,
    },
    billCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
    },
    billHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    billTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
        gap: 6,
    },
    billName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
    },
    autoPayIcon: {
        backgroundColor: 'rgba(245,158,11,0.1)',
        padding: 4,
        borderRadius: 8,
    },
    categoryBadge: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
    },
    categoryText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#8E8E93',
        textTransform: 'uppercase',
    },
    actionButtons: {
        flexDirection: 'row',
    },
    iconButton: {
        padding: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 10,
    },
    billDetails: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#F2F2F7',
        paddingTop: 16,
        gap: 24,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    detailIcon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailValue: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111',
        lineHeight: 18,
    },
    detailLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: '#8E8E93',
        textTransform: 'uppercase',
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
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#111',
    },
    emptyDesc: {
        fontSize: 14,
        color: '#8E8E93',
        textAlign: 'center',
        maxWidth: '80%',
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
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111',
        textTransform: 'uppercase',
    },
    modalForm: {
        padding: 24,
    },
    formSection: {
        marginBottom: 24,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 11,
        fontWeight: '800',
        color: '#8E8E93',
        textTransform: 'uppercase',
        marginBottom: 8,
        letterSpacing: 1,
    },
    presetScroll: {
        marginHorizontal: -24,
        paddingHorizontal: 24,
    },
    presetChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: '#F5F5F5',
        marginRight: 10,
    },
    presetChipText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#111',
    },
    input: {
        backgroundColor: '#F5F5F5',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 16,
        padding: 16,
        color: '#111',
        fontSize: 16,
        fontWeight: '700',
    },
    row: {
        flexDirection: 'row',
    },
    switchGroup: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
    },
    switchLabel: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111',
    },
    switchSubLabel: {
        fontSize: 11,
        color: '#8E8E93',
        marginTop: 2,
    },
    saveButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '900',
        color: '#FFFFFF',
    },
});
