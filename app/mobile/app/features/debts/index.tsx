import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDebts, Debt } from '../../../context/DebtContext';
import { useSettings } from '../../../context/SettingsContext';
import { useThemeStyles } from '@/components/more/DesignSystem';

export default function DebtsDashboard() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { isDarkMode, tokens } = useThemeStyles();
    const { debts, markAsSettled, deleteDebt } = useDebts();
    const { triggerHaptic } = useSettings();
    const [filter, setFilter] = useState<'all' | 'lend' | 'borrow'>('all');

    const [tabWidth, setTabWidth] = useState(0);
    const slideAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const index = ['all', 'lend', 'borrow'].indexOf(filter);
        if (tabWidth > 0) {
            Animated.spring(slideAnim, {
                toValue: index * tabWidth,
                useNativeDriver: true,
                bounciness: 4,
                speed: 12
            }).start();
        }
    }, [filter, tabWidth]);

    const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

    const totalPayable = debts.filter((d: Debt) => d.type === 'borrow' && d.status === 'active').reduce((sum: number, d: Debt) => sum + Number(d.amount), 0);
    const totalReceivable = debts.filter((d: Debt) => d.type === 'lend' && d.status === 'active').reduce((sum: number, d: Debt) => sum + Number(d.amount), 0);

    const filteredDebts = debts.filter((d: Debt) => (filter === 'all' || d.type === filter) && d.status === 'active');

    const calculateDaysLeft = (dueDateString: string | null) => {
        if (!dueDateString) return 'No due date';
        const due = new Date(dueDateString);
        const now = new Date();
        const diffTime = due.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
        if (diffDays === 0) return 'Due Today!';
        return `Due in ${diffDays} days`;
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, backgroundColor: tokens.bgPrimary }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: tokens.bgSecondary }]}>
                    <Ionicons name="chevron-back" size={22} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Debts</Text>
                <TouchableOpacity style={[styles.helpButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F7' }]}>
                    <Ionicons name="help-circle-outline" size={24} color={tokens.textMuted} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Tabs */}
                <View 
                    style={[styles.tabsContainer, { backgroundColor: tokens.bgSecondary, borderWidth: 1, borderColor: tokens.borderDefault, borderRadius: 24 }]}
                    onLayout={(e) => setTabWidth((e.nativeEvent.layout.width - 8) / 3)}
                >
                    {tabWidth > 0 && (
                        <Animated.View style={[
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
                    {(['all', 'lend', 'borrow'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, { zIndex: 2 }]}
                            onPress={() => {
                                setFilter(tab);
                                triggerHaptic();
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={[
                                styles.tabText, 
                                { 
                                    color: filter === tab ? tokens.textPrimary : tokens.textMuted,
                                    fontWeight: filter === tab ? '700' : '600'
                                }
                            ]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                        <Text style={[styles.summaryLabel, { color: tokens.textMuted }]}>Payable</Text>
                        <Text style={[styles.summaryValue, { color: '#FF453A' }]}>
                            {formatCurrency(totalPayable)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}>
                        <Text style={[styles.summaryLabel, { color: tokens.textMuted }]}>Receivable</Text>
                        <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                            {formatCurrency(totalReceivable)}
                        </Text>
                    </View>
                </View>

                {/* Debt List */}
                <View style={styles.listContainer}>
                    {filteredDebts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="wallet-outline" size={64} color={tokens.borderDefault} />
                            <Text style={[styles.emptyText, { color: tokens.textMuted }]}>No active debts found.</Text>
                        </View>
                    ) : (
                        filteredDebts.map((debt: Debt) => (
                            <TouchableOpacity
                                key={debt.id}
                                style={[styles.debtCard, { backgroundColor: tokens.bgSecondary, borderColor: tokens.borderDefault }]}
                                onPress={() => { /* Could open bottom sheet for actions like Settle */ }}
                            >
                                <View style={[styles.debtIconContainer, { backgroundColor: debt.type === 'lend' ? (isDarkMode ? 'rgba(52,199,89,0.1)' : '#E8F5E9') : (isDarkMode ? 'rgba(255,69,58,0.1)' : '#FFEBEE') }]}>
                                    <Ionicons 
                                        name={debt.type === 'lend' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                                        size={28} 
                                        color={debt.type === 'lend' ? '#34C759' : '#FF453A'} 
                                    />
                                </View>
                                <View style={styles.debtInfo}>
                                    <Text style={[styles.debtName, { color: tokens.textPrimary }]}>{debt.personName}</Text>
                                    <Text style={[styles.debtDue, { color: tokens.textMuted }]}>{calculateDaysLeft(debt.dueDate)}</Text>
                                </View>
                                <View style={styles.debtAmountContainer}>
                                    <Text style={[styles.debtOweLabel, { color: debt.type === 'lend' ? '#34C759' : '#FF453A' }]}>
                                        {debt.type === 'lend' ? 'owes you' : 'you owe'}
                                    </Text>
                                    <Text style={[styles.debtAmount, { color: debt.type === 'lend' ? '#34C759' : '#FF453A' }]}>
                                        {formatCurrency(debt.amount)}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity 
                style={[styles.fab, { backgroundColor: tokens.purple.stroke || '#6366F1' }]} 
                onPress={() => router.push('/features/debts/add' as any)}
                activeOpacity={0.9}
            >
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
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
        paddingVertical: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    helpButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 120,
    },
    tabsContainer: {
        flexDirection: 'row',
        borderRadius: 20,
        padding: 4,
        marginBottom: 24,
        position: 'relative',
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
        zIndex: 1,
    },
    activeTabIndicator: {
        position: 'absolute',
        top: 4,
        bottom: 4,
        left: 4,
        borderRadius: 16,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '700',
    },
    activeTabText: {
        fontWeight: '800',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    summaryLabel: {
        fontSize: 12,
        fontWeight: '700',
        marginBottom: 6,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: '900',
    },
    listContainer: {
        gap: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 16,
    },
    emptyText: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    debtCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    debtIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    debtInfo: {
        flex: 1,
    },
    debtName: {
        fontSize: 16,
        fontWeight: '800',
        marginBottom: 4,
    },
    debtDue: {
        fontSize: 12,
        fontWeight: '600',
    },
    debtAmountContainer: {
        alignItems: 'flex-end',
    },
    debtOweLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    debtAmount: {
        fontSize: 18,
        fontWeight: '900',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 24,
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
});
