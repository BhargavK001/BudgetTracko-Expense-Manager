import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Modal, Switch, StatusBar, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { useThemeStyles } from '@/components/more/DesignSystem';
import api from '@/services/api';
import { scheduleRecurringBillReminder, cancelNotification } from '@/services/notificationService';
import { useSettings } from '@/context/SettingsContext';

const PRESETS = [
    { name: 'Rent', category: 'Housing', amount: 15000 },
    { name: 'Netflix', category: 'Entertainment', amount: 649 },
    { name: 'Prime Video', category: 'Entertainment', amount: 299 },
    { name: 'Mess', category: 'Food', amount: 3000 },
];

type Bill = {
    _id: string;
    name: string;
    category: string;
    amount: number;
    dueDate: number;
    frequency: string;
    autoPay: boolean;
    status?: 'active' | 'inactive';
};

function RecurringBillsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { isDarkMode, tokens } = useThemeStyles();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const { formatCurrency, triggerHaptic } = useSettings();

    const [formData, setFormData] = useState({
        name: '', amount: '', dueDate: '1',
        category: 'Bills', frequency: 'monthly', autoPay: false,
    });

    const fetchBills = useCallback(async () => {
        try {
            const res = await api.get('/api/recurring');
            const raw = res.data;
            const list = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.bills) ? raw.bills : [];
            setBills(list);
        } catch (e) {
            console.log('Failed to fetch recurring bills:', e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchBills(); }, [fetchBills]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try { await fetchBills(); } catch {}
        setRefreshing(false);
    }, [fetchBills]);

    const sortedBills = useMemo(() => {
        if (!Array.isArray(bills)) return [];
        let filtered = bills;
        if (filter !== 'all') filtered = bills.filter(b => (b.status || 'active') === filter);
        return [...filtered].sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
    }, [bills, filter]);

    const totalMonthly = useMemo(() => {
        if (!Array.isArray(bills)) return 0;
        return bills.reduce((acc, b) => acc + (b.frequency === 'yearly' ? b.amount / 12 : b.amount), 0);
    }, [bills]);

    const handleOpenModal = (bill: Bill | null = null) => {
        triggerHaptic();
        if (bill) {
            setEditingBill(bill);
            setFormData({
                name: bill.name, amount: bill.amount.toString(),
                dueDate: bill.dueDate.toString(), category: bill.category,
                frequency: bill.frequency, autoPay: bill.autoPay,
            });
        } else {
            setEditingBill(null);
            setFormData({ name: '', amount: '', dueDate: '1', category: 'Bills', frequency: 'monthly', autoPay: false });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        triggerHaptic();
        if (!formData.name || !formData.amount) {
            Alert.alert('Required', 'Please fill name and amount.');
            return;
        }
        setSaving(true);

        const payload = {
            name: formData.name,
            amount: Number(formData.amount),
            dueDate: Number(formData.dueDate),
            category: formData.category,
            frequency: formData.frequency,
            autoPay: formData.autoPay,
        };

        try {
            if (editingBill) {
                await api.put(`/api/recurring/${editingBill._id}`, payload);
            } else {
                await api.post('/api/recurring', payload);
            }

            const today = new Date();
            let nextDue = new Date(today.getFullYear(), today.getMonth(), payload.dueDate);
            if (nextDue < today) {
                nextDue.setMonth(nextDue.getMonth() + 1);
            }

            scheduleRecurringBillReminder(payload.name, payload.amount, nextDue, formatCurrency(0).charAt(0));

            setIsModalOpen(false);
            await fetchBills();
        } catch (e: any) {
            Alert.alert('Error', e.response?.data?.error || e.response?.data?.message || 'Failed to save bill.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (bill: Bill) => {
        triggerHaptic();
        Alert.alert('Delete Bill', `Are you sure you want to delete "${bill.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    triggerHaptic();
                    try {
                        await api.delete(`/api/recurring/${bill._id}`);
                        await fetchBills();
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.error || e.response?.data?.message || 'Failed to delete bill.');
                    }
                },
            },
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: insets.top, backgroundColor: tokens.bgPrimary }]}>
                <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]}>
                        <Ionicons name="chevron-back" size={20} color={tokens.textPrimary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Recurring Bills</Text>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={tokens.purple.stroke || "#6366F1"} />
                    <Text style={{ marginTop: 12, color: tokens.textMuted, fontSize: 13, fontWeight: '600' }}>Syncing bills…</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: tokens.bgPrimary }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]} 
                    activeOpacity={0.7}
                >
                    <Ionicons name="chevron-back" size={20} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Recurring Bills</Text>
                <TouchableOpacity 
                    onPress={() => handleOpenModal()} 
                    style={[styles.addButton, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]} 
                    activeOpacity={0.7}
                >
                    <Ionicons name="add" size={24} color={tokens.purple.stroke || "#6366F1"} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tokens.purple.stroke || "#6366F1"} />
                }
            >
                {/* Stats */}
                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()} style={styles.statsContainer}>
                    <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.05)', borderColor: tokens.borderDefault }]}>
                        <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Total Monthly</Text>
                        <Text style={[styles.statValue, { color: tokens.purple.stroke || '#6366F1' }]}>{formatCurrency(Math.round(totalMonthly))}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(244,63,94,0.1)' : 'rgba(244,63,94,0.05)', borderColor: tokens.borderDefault }]}>
                        <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Active Bills</Text>
                        <Text style={[styles.statValue, { color: '#F43F5E' }]}>{bills.length}</Text>
                    </View>
                </Animated.View>

                {/* Filters */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={{ gap: 8 }}>
                    {['all', 'active', 'inactive'].map(f => (
                        <TouchableOpacity
                            key={f}
                            style={[
                                styles.filterChip,
                                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' },
                                filter === f && { backgroundColor: tokens.purple.stroke || '#6366F1' }
                            ]}
                            onPress={() => { triggerHaptic(); setFilter(f as any); }}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: tokens.textMuted },
                                filter === f && { color: '#fff' }
                            ]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Bills List */}
                <View style={styles.grid}>
                    {sortedBills.map((bill, index) => (
                        <Animated.View key={bill._id} layout={Layout.springify()}>
                            <Animated.View
                                entering={FadeInDown.delay(200 + index * 50).duration(400).springify()}
                                style={[styles.billCard, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}
                            >
                                <View style={styles.billHeader}>
                                    <View style={{ flex: 1 }}>
                                        <View style={styles.billTitleRow}>
                                            <Text style={[styles.billName, { color: tokens.textPrimary }]}>{bill.name}</Text>
                                            {bill.autoPay && (
                                                <Ionicons name="flash" size={14} color="#F59E0B" />
                                            )}
                                        </View>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{bill.category}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity onPress={() => handleOpenModal(bill)} style={[styles.iconButton, { backgroundColor: tokens.bgTertiary }]} activeOpacity={0.7}>
                                            <Ionicons name="pencil-outline" size={16} color={tokens.textMuted} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(bill)} style={[styles.iconButton, { marginLeft: 8, backgroundColor: 'rgba(244,63,94,0.1)' }]} activeOpacity={0.7}>
                                            <Ionicons name="trash-outline" size={16} color="#F43F5E" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.billDetails}>
                                    <View style={styles.detailItem}>
                                        <View style={[styles.detailIcon, { backgroundColor: isDarkMode ? 'rgba(45,202,114,0.15)' : 'rgba(45,202,114,0.1)' }]}>
                                            <Ionicons name="cash-outline" size={16} color="#2DCA72" />
                                        </View>
                                        <View>
                                            <Text style={[styles.detailValue, { color: tokens.textPrimary }]}>{formatCurrency(bill.amount)}</Text>
                                            <Text style={styles.detailLabel}>{bill.frequency === 'monthly' ? 'Monthly' : 'Yearly'}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.detailItem}>
                                        <View style={[styles.detailIcon, { backgroundColor: isDarkMode ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.1)' }]}>
                                            <Ionicons name="calendar-outline" size={16} color="#38BDF8" />
                                        </View>
                                        <View>
                                            <Text style={[styles.detailValue, { color: tokens.textPrimary }]}>Day {bill.dueDate}</Text>
                                            <Text style={styles.detailLabel}>Due Date</Text>
                                        </View>
                                    </View>
                                </View>
                            </Animated.View>
                        </Animated.View>
                    ))}

                    {sortedBills.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={64} color={tokens.borderDefault} />
                            <Text style={[styles.emptyTitle, { color: tokens.textPrimary }]}>No recurring bills</Text>
                            <Text style={[styles.emptyDesc, { color: tokens.textMuted }]}>Add your subscriptions or utilities here to track them easily.</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            <Modal visible={isModalOpen} animationType="slide" transparent onRequestClose={() => setIsModalOpen(false)}>
                <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: tokens.bgPrimary }]}>
                            <View style={[styles.modalHeader, { borderBottomColor: tokens.borderDefault }]}>
                                <Text style={[styles.modalTitle, { color: tokens.textPrimary }]}>{editingBill ? 'Edit Bill' : 'New Bill'}</Text>
                                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                                    <Ionicons name="close-circle" size={28} color={tokens.textMuted} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {!editingBill && (
                                    <View style={styles.formSection}>
                                        <Text style={[styles.label, { color: tokens.textMuted }]}>Quick Add</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                            {PRESETS.map(p => (
                                                <TouchableOpacity
                                                    key={p.name} style={[styles.presetChip, { backgroundColor: tokens.bgSecondary }]}
                                                    onPress={() => { triggerHaptic(); setFormData({ ...formData, name: p.name, category: p.category, amount: p.amount.toString() }); }}
                                                >
                                                    <Text style={[styles.presetChipText, { color: tokens.textPrimary }]}>{p.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <View style={styles.formSection}>
                                    <Text style={[styles.label, { color: tokens.textMuted }]}>Name</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: tokens.bgSecondary, color: tokens.textPrimary }]}
                                        placeholder="e.g. Netflix"
                                        placeholderTextColor={tokens.textMuted}
                                        value={formData.name}
                                        onChangeText={text => setFormData({ ...formData, name: text })}
                                    />
                                </View>

                                <View style={styles.formGrid}>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: tokens.textMuted }]}>Amount</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: tokens.bgSecondary, color: tokens.textPrimary }]}
                                            placeholder="0.00"
                                            placeholderTextColor={tokens.textMuted}
                                            keyboardType="numeric"
                                            value={formData.amount}
                                            onChangeText={text => setFormData({ ...formData, amount: text })}
                                        />
                                    </View>
                                    <View style={[styles.formSection, { flex: 1, marginLeft: 16 }]}>
                                        <Text style={[styles.label, { color: tokens.textMuted }]}>Due Day</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: tokens.bgSecondary, color: tokens.textPrimary }]}
                                            placeholder="1-31"
                                            placeholderTextColor={tokens.textMuted}
                                            keyboardType="numeric"
                                            maxLength={2}
                                            value={formData.dueDate}
                                            onChangeText={text => setFormData({ ...formData, dueDate: text })}
                                        />
                                    </View>
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={[styles.label, { color: tokens.textMuted }]}>Frequency</Text>
                                    <View style={[styles.frequencyContainer, { backgroundColor: tokens.bgSecondary }]}>
                                        {(['monthly', 'yearly'] as const).map(f => (
                                            <TouchableOpacity
                                                key={f}
                                                style={[
                                                    styles.frequencyOption,
                                                    formData.frequency === f && { backgroundColor: tokens.purple.stroke || '#6366F1' }
                                                ]}
                                                onPress={() => { triggerHaptic(); setFormData({ ...formData, frequency: f }); }}
                                            >
                                                <Text style={[
                                                    styles.frequencyText,
                                                    { color: tokens.textMuted },
                                                    formData.frequency === f && { color: '#fff' }
                                                ]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={[styles.switchGroup, { backgroundColor: tokens.bgSecondary }]}>
                                    <View>
                                        <Text style={[styles.switchLabel, { color: tokens.textPrimary }]}>Auto-Pay</Text>
                                        <Text style={[styles.switchSubLabel, { color: tokens.textMuted }]}>Mark as automated</Text>
                                    </View>
                                    <Switch 
                                        value={formData.autoPay} 
                                        onValueChange={v => { triggerHaptic(); setFormData({ ...formData, autoPay: v }); }}
                                        trackColor={{ false: isDarkMode ? '#333' : '#E5E5EA', true: tokens.purple.stroke || '#6366F1' }}
                                    />
                                </View>

                                <TouchableOpacity 
                                    style={[styles.saveButton, { backgroundColor: tokens.purple.stroke || '#6366F1' }]} 
                                    onPress={handleSave} 
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{editingBill ? 'Update Bill' : 'Save Bill'}</Text>}
                                </TouchableOpacity>
                                <View style={{ height: 40 }} />
                            </ScrollView>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
    backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    addButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1, paddingHorizontal: 20 },
    scrollContent: { paddingBottom: 24 },
    statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 24 },
    statCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1 },
    statLabel: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    statValue: { fontSize: 18, fontWeight: '900' },
    filterScroll: { marginBottom: 20, marginHorizontal: -20, paddingHorizontal: 20 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    filterText: { fontSize: 13, fontWeight: '700' },
    grid: { gap: 16 },
    billCard: { borderRadius: 20, padding: 20, borderWidth: 1 },
    billHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
    billTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    billName: { fontSize: 16, fontWeight: '800' },
    categoryBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: 'rgba(99,102,241,0.05)' },
    categoryText: { fontSize: 10, fontWeight: '700', color: '#6366F1', textTransform: 'uppercase' },
    actionButtons: { flexDirection: 'row' },
    iconButton: { padding: 8, borderRadius: 10 },
    billDetails: { flexDirection: 'row', gap: 24 },
    detailItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    detailIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    detailValue: { fontSize: 14, fontWeight: '700' },
    detailLabel: { fontSize: 11, fontWeight: '600' },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '800' },
    emptyDesc: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, marginBottom: 20, borderBottomWidth: 1 },
    modalTitle: { fontSize: 20, fontWeight: '900' },
    formSection: { marginBottom: 20 },
    formGrid: { flexDirection: 'row' },
    label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    input: { borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '700' },
    presetChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    presetChipText: { fontSize: 13, fontWeight: '700' },
    frequencyContainer: { flexDirection: 'row', padding: 4, borderRadius: 14 },
    frequencyOption: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 11 },
    frequencyText: { fontSize: 13, fontWeight: '700' },
    switchGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 24 },
    switchLabel: { fontSize: 15, fontWeight: '800' },
    switchSubLabel: { fontSize: 11, marginTop: 2 },
    saveButton: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});

export default RecurringBillsScreen;
