import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    TextInput, Modal, Switch, StatusBar, Alert, ActivityIndicator,
    KeyboardAvoidingView, Platform, RefreshControl, Animated as RNAnimated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { useThemeStyles } from '@/components/more/DesignSystem';
import * as localDB from '@/services/localDB';
import { performDeltaSync } from '@/services/syncEngine';
import { scheduleRecurringBillReminder } from '@/services/notificationService';
import { useSettings } from '@/context/SettingsContext';
import { useAccounts } from '@/context/AccountContext';
import { ACCOUNT_TYPE_META } from '@/components/AccountCard';
import * as Haptics from 'expo-haptics';

const PRESETS = [
    { name: 'Rent', category: 'Housing', amount: 15000 },
    { name: 'Netflix', category: 'Entertainment', amount: 649 },
    { name: 'Prime Video', category: 'Entertainment', amount: 299 },
    { name: 'Mess', category: 'Food', amount: 3000 },
];

type Bill = {
    _id: string;
    id?: string;
    name: string;
    category: string;
    amount: number;
    dueDate: number;
    frequency: string;
    autoPay: boolean;
    accountId?: string;
    status?: 'active' | 'inactive';
};

function RecurringBillsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { isDarkMode, tokens } = useThemeStyles();
    const { accounts } = useAccounts();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBill, setEditingBill] = useState<Bill | null>(null);
    const [bills, setBills] = useState<Bill[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const { formatCurrency } = useSettings();

    const [formData, setFormData] = useState({
        name: '', amount: '', dueDate: '1',
        category: 'Bills', frequency: 'monthly', autoPay: false, accountId: '',
    });

    const [tabWidth, setTabWidth] = useState(0);
    const slideAnim = useRef(new RNAnimated.Value(0)).current;

    useEffect(() => {
        const index = formData.frequency === 'monthly' ? 0 : 1;
        if (tabWidth > 0) {
            RNAnimated.spring(slideAnim, {
                toValue: index * tabWidth,
                useNativeDriver: true,
                bounciness: 4,
                speed: 12
            }).start();
        }
    }, [formData.frequency, tabWidth]);

    const refreshBills = useCallback(() => {
        setBills(localDB.getRecurringBills());
    }, []);

    const fetchBills = useCallback(async () => {
        try {
            refreshBills();
            performDeltaSync().then(() => refreshBills()).catch(() => { });
        } catch (e) {
            console.log('Failed to fetch recurring bills:', e);
        } finally {
            setLoading(false);
        }
    }, [refreshBills]);

    useEffect(() => { fetchBills(); }, [fetchBills]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await performDeltaSync();
            refreshBills();
        } catch { }
        setRefreshing(false);
    }, [refreshBills]);

    const sortedBills = useMemo(() => {
        if (!Array.isArray(bills)) return [];
        let filtered = bills;
        if (filter !== 'all') filtered = bills.filter(b => (b.status || 'active') === filter);
        return [...filtered].sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));
    }, [bills, filter]);

    const totalMonthly = useMemo(() => {
        if (!Array.isArray(bills)) return 0;
        return bills.filter(b => (b.status || 'active') === 'active').reduce((acc, b) => acc + (b.frequency === 'yearly' ? b.amount / 12 : b.amount), 0);
    }, [bills]);

    const handleOpenModal = (bill: Bill | null = null) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (bill) {
            setEditingBill(bill);
            setFormData({
                name: bill.name, amount: bill.amount.toString(),
                dueDate: bill.dueDate.toString(), category: bill.category,
                frequency: bill.frequency, autoPay: bill.autoPay, accountId: bill.accountId || '',
            });
        } else {
            setEditingBill(null);
            setFormData({ name: '', amount: '', dueDate: '1', category: 'Bills', frequency: 'monthly', autoPay: false, accountId: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        if (!formData.name || !formData.amount) {
            Alert.alert('Required', 'Please fill name and amount.');
            return;
        }
        setSaving(true);

        const id = editingBill?._id || editingBill?.id || Date.now().toString();
        const now = new Date().toISOString();
        const payload: Bill = {
            _id: id,
            name: formData.name,
            amount: Number(formData.amount),
            dueDate: Number(formData.dueDate),
            category: formData.category,
            frequency: formData.frequency,
            autoPay: formData.autoPay,
            accountId: formData.accountId,
            status: editingBill?.status || 'active',
        };

        try {
            localDB.upsertRecurringBill(payload);
            localDB.addToSyncQueue({
                id,
                entityType: 'recurring-bill',
                action: editingBill ? 'update' : 'create',
                data: payload,
                clientUpdatedAt: now
            });

            const today = new Date();
            let nextDue = new Date(today.getFullYear(), today.getMonth(), payload.dueDate);
            if (nextDue < today) {
                nextDue.setMonth(nextDue.getMonth() + 1);
            }

            scheduleRecurringBillReminder(payload.name, payload.amount, nextDue, formatCurrency(0).charAt(0));

            setIsModalOpen(false);
            refreshBills();
            performDeltaSync().catch(() => { });
        } catch (e: any) {
            Alert.alert('Error', 'Failed to save bill locally. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = (bill: Bill) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert('Delete Bill', `Are you sure you want to delete "${bill.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete', style: 'destructive',
                onPress: async () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    try {
                        const id = bill._id || (bill as any).id;
                        localDB.removeRecurringBill(id);
                        localDB.addToSyncQueue({
                            id,
                            entityType: 'recurring-bill',
                            action: 'delete',
                            data: { id },
                            clientUpdatedAt: new Date().toISOString()
                        });
                        refreshBills();
                        performDeltaSync().catch(() => { });
                    } catch (e: any) {
                        Alert.alert('Error', 'Failed to delete bill.');
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
                    <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
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
                    style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}
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
                        <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Monthly Est.</Text>
                        <Text style={[styles.statValue, { color: tokens.purple.stroke || '#6366F1' }]}>{formatCurrency(Math.round(totalMonthly))}</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: isDarkMode ? 'rgba(45,202,114,0.1)' : 'rgba(45,202,114,0.05)', borderColor: tokens.borderDefault }]}>
                        <Text style={[styles.statLabel, { color: tokens.textMuted }]}>Active</Text>
                        <Text style={[styles.statValue, { color: '#2DCA72' }]}>{bills.filter(b => (b.status || 'active') === 'active').length}</Text>
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
                                filter === f && { backgroundColor: tokens.textPrimary }
                            ]}
                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilter(f as any); }}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: tokens.textMuted },
                                filter === f && { color: tokens.bgPrimary }
                            ]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Bills List */}
                <View style={styles.grid}>
                    {sortedBills.map((bill, index) => {
                        const acc = accounts.find(a => a._id === bill.accountId || a.id === bill.accountId);
                        const AccIcon = acc ? (ACCOUNT_TYPE_META[acc.type]?.Icon || ACCOUNT_TYPE_META['bank'].Icon) : null;
                        const isInactive = bill.status === 'inactive';

                        return (
                            <Animated.View key={bill._id} layout={Layout.springify()}>
                                <Animated.View
                                    entering={FadeInDown.delay(200 + index * 50).duration(400).springify()}
                                    style={[styles.billCard, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderDefault, opacity: isInactive ? 0.6 : 1 }]}
                                >
                                    <View style={styles.billHeader}>
                                        <View style={styles.billIconContainer}>
                                            <View style={[styles.billMainIcon, { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' }]}>
                                                <Ionicons name="receipt" size={24} color={tokens.purple.stroke || "#6366F1"} />
                                            </View>
                                            {acc && AccIcon && (
                                                <View style={[styles.accountBadge, { backgroundColor: acc.color, borderColor: tokens.cardSurface }]}>
                                                    <AccIcon size={10} color="#FFF" />
                                                </View>
                                            )}
                                        </View>
                                        <View style={{ flex: 1, marginLeft: 16 }}>
                                            <Text style={[styles.billName, { color: tokens.textPrimary }]}>{bill.name}</Text>
                                            <Text style={[styles.categoryText, { color: tokens.textMuted }]}>{bill.category} • {bill.frequency === 'monthly' ? 'Monthly' : 'Yearly'}</Text>
                                        </View>
                                        <Text style={[styles.billAmount, { color: tokens.textPrimary }]}>{formatCurrency(bill.amount)}</Text>
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: tokens.borderSubtle }]} />

                                    <View style={styles.billFooter}>
                                        <View style={styles.footerItem}>
                                            <Ionicons name="calendar-outline" size={14} color={tokens.textMuted} />
                                            <Text style={[styles.footerText, { color: tokens.textMuted }]}>Due day {bill.dueDate}</Text>
                                        </View>
                                        {bill.autoPay && (
                                            <View style={styles.footerItem}>
                                                <Ionicons name="flash" size={14} color="#F59E0B" />
                                                <Text style={[styles.footerText, { color: '#F59E0B' }]}>Auto-pay</Text>
                                            </View>
                                        )}
                                        <View style={{ flex: 1 }} />
                                        <TouchableOpacity onPress={() => handleOpenModal(bill)} style={styles.actionIcon} activeOpacity={0.7}>
                                            <Ionicons name="pencil" size={18} color={tokens.textMuted} />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => handleDelete(bill)} style={[styles.actionIcon, { marginLeft: 8 }]} activeOpacity={0.7}>
                                            <Ionicons name="trash" size={18} color="#F43F5E" />
                                        </TouchableOpacity>
                                    </View>

                                </Animated.View>
                            </Animated.View>
                        )
                    })}

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
                            <View style={styles.modalHandleContainer}>
                                <View style={[styles.modalHandle, { backgroundColor: tokens.borderSubtle }]} />
                            </View>
                            <View style={[styles.modalHeader, { borderBottomColor: tokens.borderSubtle }]}>
                                <Text style={[styles.modalTitle, { color: tokens.textPrimary }]}>{editingBill ? 'Edit Bill' : 'New Bill'}</Text>
                                <TouchableOpacity onPress={() => setIsModalOpen(false)} style={[styles.closeModalBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                                    <Ionicons name="close" size={20} color={tokens.textPrimary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                {!editingBill && (
                                    <View style={styles.formSection}>
                                        <Text style={[styles.label, { color: tokens.textMuted }]}>Quick Add</Text>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                                            {PRESETS.map(p => (
                                                <TouchableOpacity
                                                    key={p.name} style={[styles.presetChip, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}
                                                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormData({ ...formData, name: p.name, category: p.category, amount: p.amount.toString() }); }}
                                                >
                                                    <Text style={[styles.presetChipText, { color: tokens.textPrimary }]}>{p.name}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                <View style={styles.formSection}>
                                    <Text style={[styles.label, { color: tokens.textMuted }]}>Bill Name</Text>
                                    <TextInput
                                        style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F9F9F9', color: tokens.textPrimary, borderColor: tokens.borderDefault }]}
                                        placeholder="e.g. Netflix, Rent"
                                        placeholderTextColor={tokens.textMuted}
                                        value={formData.name}
                                        onChangeText={text => setFormData({ ...formData, name: text })}
                                    />
                                </View>

                                <View style={styles.formGrid}>
                                    <View style={[styles.formSection, { flex: 1 }]}>
                                        <Text style={[styles.label, { color: tokens.textMuted }]}>Amount ({formatCurrency(0).charAt(0)})</Text>
                                        <TextInput
                                            style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F9F9F9', color: tokens.textPrimary, borderColor: tokens.borderDefault }]}
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
                                            style={[styles.input, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F9F9F9', color: tokens.textPrimary, borderColor: tokens.borderDefault }]}
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
                                    <View
                                        style={[styles.frequencyContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F9F9F9', borderWidth: 1, borderColor: tokens.borderDefault, borderRadius: 16, padding: 4 }]}
                                        onLayout={(e) => setTabWidth((e.nativeEvent.layout.width - 8) / 2)}
                                    >
                                        {tabWidth > 0 && (
                                            <RNAnimated.View style={[
                                                {
                                                    position: 'absolute',
                                                    top: 4, bottom: 4, left: 4,
                                                    width: tabWidth,
                                                    transform: [{ translateX: slideAnim }],
                                                    backgroundColor: tokens.textPrimary,
                                                    borderRadius: 12,
                                                }
                                            ]} />
                                        )}
                                        {(['monthly', 'yearly'] as const).map(f => (
                                            <TouchableOpacity
                                                key={f}
                                                style={[styles.frequencyOption, { zIndex: 2 }]}
                                                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormData({ ...formData, frequency: f }); }}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={[
                                                    styles.frequencyText,
                                                    { color: formData.frequency === f ? tokens.bgPrimary : tokens.textMuted, fontWeight: formData.frequency === f ? '700' : '600' }
                                                ]}>{f.charAt(0).toUpperCase() + f.slice(1)}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>

                                <View style={styles.formSection}>
                                    <Text style={[styles.label, { color: tokens.textMuted }]}>Account to charge from</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }}>
                                        <TouchableOpacity
                                            style={[
                                                styles.accountChip,
                                                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F9F9F9', borderColor: tokens.borderDefault },
                                                !formData.accountId && { borderColor: tokens.textPrimary, backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5E5' }
                                            ]}
                                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormData({ ...formData, accountId: '' }); }}
                                        >
                                            <View style={[styles.accountChipIcon, { backgroundColor: tokens.borderSubtle }]}>
                                                <Ionicons name="help" size={14} color={tokens.textMuted} />
                                            </View>
                                            <Text style={[styles.accountChipText, { color: tokens.textPrimary }]}>None</Text>
                                        </TouchableOpacity>

                                        {accounts.map(acc => {
                                            const isSelected = formData.accountId === (acc._id || acc.id);
                                            const AccIcon = ACCOUNT_TYPE_META[acc.type]?.Icon || ACCOUNT_TYPE_META['bank'].Icon;
                                            return (
                                                <TouchableOpacity
                                                    key={acc._id || acc.id}
                                                    style={[
                                                        styles.accountChip,
                                                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F9F9F9', borderColor: tokens.borderDefault },
                                                        isSelected && { borderColor: acc.color, backgroundColor: acc.color + '15' }
                                                    ]}
                                                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormData({ ...formData, accountId: acc._id || acc.id || '' }); }}
                                                >
                                                    <View style={[styles.accountChipIcon, { backgroundColor: acc.color + '20' }]}>
                                                        <AccIcon size={14} color={acc.color} />
                                                    </View>
                                                    <Text style={[styles.accountChipText, { color: tokens.textPrimary }]} numberOfLines={1}>{acc.name}</Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>

                                <View style={[styles.switchGroup, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F9F9F9', borderColor: tokens.borderDefault }]}>
                                    <View>
                                        <Text style={[styles.switchLabel, { color: tokens.textPrimary }]}>Auto-Pay</Text>
                                        <Text style={[styles.switchSubLabel, { color: tokens.textMuted }]}>Mark as automated payment</Text>
                                    </View>
                                    <Switch
                                        value={formData.autoPay}
                                        onValueChange={v => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFormData({ ...formData, autoPay: v }); }}
                                        trackColor={{ false: isDarkMode ? '#333' : '#E5E5EA', true: tokens.purple.stroke || '#6366F1' }}
                                    />
                                </View>

                                <TouchableOpacity
                                    style={[styles.saveButton, { backgroundColor: tokens.textPrimary }]}
                                    onPress={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? <ActivityIndicator color={tokens.bgPrimary} /> : <Text style={[styles.saveButtonText, { color: tokens.bgPrimary }]}>{editingBill ? 'Update Bill' : 'Save Bill'}</Text>}
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
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 16 },
    backButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    addButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    scrollView: { flex: 1, paddingHorizontal: 20 },
    scrollContent: { paddingBottom: 24 },
    statsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, padding: 16, borderRadius: 20, borderWidth: 1 },
    statLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
    statValue: { fontSize: 20, fontWeight: '900' },
    filterScroll: { marginBottom: 20, marginHorizontal: -20, paddingHorizontal: 20 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    filterText: { fontSize: 13, fontWeight: '700' },
    grid: { gap: 16 },
    billCard: { borderRadius: 24, padding: 20, borderWidth: 1 },
    billHeader: { flexDirection: 'row', alignItems: 'center' },
    billIconContainer: { position: 'relative' },
    billMainIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    accountBadge: { position: 'absolute', bottom: -4, right: -4, width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    billName: { fontSize: 16, fontWeight: '800', marginBottom: 2 },
    categoryText: { fontSize: 12, fontWeight: '600' },
    billAmount: { fontSize: 18, fontWeight: '800' },
    divider: { height: 1, marginVertical: 16, opacity: 0.5 },
    billFooter: { flexDirection: 'row', alignItems: 'center' },
    footerItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16, gap: 4 },
    footerText: { fontSize: 12, fontWeight: '600' },
    actionIcon: { padding: 8 },
    emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '800' },
    emptyDesc: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, paddingBottom: Platform.OS === 'ios' ? 40 : 24, maxHeight: '90%' },
    modalHandleContainer: { alignItems: 'center', marginBottom: 20 },
    modalHandle: { width: 40, height: 4, borderRadius: 2 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 20, marginBottom: 20, borderBottomWidth: 1 },
    modalTitle: { fontSize: 22, fontWeight: '800' },
    closeModalBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    formSection: { marginBottom: 20 },
    formGrid: { flexDirection: 'row' },
    label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
    input: { borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '600', borderWidth: 1 },
    presetChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
    presetChipText: { fontSize: 13, fontWeight: '700' },
    frequencyContainer: { flexDirection: 'row' },
    frequencyOption: { flex: 1, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
    frequencyText: { fontSize: 14 },
    accountChip: { flexDirection: 'row', alignItems: 'center', padding: 8, paddingRight: 16, borderRadius: 16, borderWidth: 1, minWidth: 100 },
    accountChipIcon: { width: 28, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
    accountChipText: { fontSize: 13, fontWeight: '600' },
    switchGroup: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1 },
    switchLabel: { fontSize: 15, fontWeight: '800' },
    switchSubLabel: { fontSize: 11, marginTop: 2 },
    saveButton: { height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
    saveButtonText: { fontSize: 16, fontWeight: '800' },
});

export default RecurringBillsScreen;
