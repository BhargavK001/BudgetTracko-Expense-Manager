import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useDebts, Debt } from '../../../context/DebtContext';
import { useSettings } from '../../../context/SettingsContext';

export default function DebtsDashboard() {
    const router = useRouter();
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
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Debts</Text>
                <TouchableOpacity style={styles.helpButton}>
                    <Ionicons name="help-circle-outline" size={24} color="#8E8E93" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Tabs */}
                <View 
                    style={styles.tabsContainer}
                    onLayout={(e) => setTabWidth(e.nativeEvent.layout.width / 3)}
                >
                    {tabWidth > 0 && (
                        <Animated.View style={[
                            styles.activeTabIndicator,
                            { width: tabWidth - 8, transform: [{ translateX: slideAnim }] }
                        ]} />
                    )}
                    {(['all', 'lend', 'borrow'] as const).map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={styles.tab}
                            onPress={() => {
                                setFilter(tab);
                                triggerHaptic();
                            }}
                        >
                            <Text style={[styles.tabText, filter === tab && styles.activeTabText]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Payable</Text>
                        <Text style={[styles.summaryValue, { color: '#FF453A' }]}>
                            {formatCurrency(totalPayable)}
                        </Text>
                    </View>
                    <View style={styles.summaryCard}>
                        <Text style={styles.summaryLabel}>Receivable</Text>
                        <Text style={[styles.summaryValue, { color: '#34C759' }]}>
                            {formatCurrency(totalReceivable)}
                        </Text>
                    </View>
                </View>

                {/* Debt List */}
                <View style={styles.listContainer}>
                    {filteredDebts.length === 0 ? (
                        <Text style={styles.emptyText}>No active debts found.</Text>
                    ) : (
                        filteredDebts.map((debt: Debt) => (
                            <TouchableOpacity
                                key={debt.id}
                                style={styles.debtCard}
                                onPress={() => { /* Could open bottom sheet for actions like Settle */ }}
                            >
                                <View style={[styles.debtIconContainer, { backgroundColor: debt.type === 'lend' ? '#1a2e25' : '#2e1a1e' }]}>
                                    <Ionicons 
                                        name={debt.type === 'lend' ? 'arrow-up-circle' : 'arrow-down-circle'} 
                                        size={28} 
                                        color={debt.type === 'lend' ? '#34C759' : '#FF453A'} 
                                    />
                                </View>
                                <View style={styles.debtInfo}>
                                    <Text style={styles.debtName}>{debt.personName}</Text>
                                    <Text style={styles.debtDue}>{calculateDaysLeft(debt.dueDate)}</Text>
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
            <TouchableOpacity style={styles.fab} onPress={() => router.push('/features/debts/add' as any)}>
                <Ionicons name="add" size={32} color="#fff" />
            </TouchableOpacity>
        </SafeAreaView>
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
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111',
    },
    helpButton: {
        padding: 5,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    tabsContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        padding: 4,
        marginBottom: 20,
        position: 'relative',
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
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
        backgroundColor: '#111',
        borderRadius: 16,
    },
    tabText: {
        color: '#8E8E93',
        fontWeight: '600',
    },
    activeTabText: {
        color: '#fff',
    },
    summaryContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 10,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    summaryLabel: {
        color: '#8E8E93',
        fontSize: 14,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContainer: {
        gap: 12,
    },
    emptyText: {
        color: '#8E8E93',
        textAlign: 'center',
        marginTop: 40,
        fontSize: 16,
    },
    debtCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    debtIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    debtInfo: {
        flex: 1,
    },
    debtName: {
        color: '#111',
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    debtDue: {
        color: '#8E8E93',
        fontSize: 12,
    },
    debtAmountContainer: {
        alignItems: 'flex-end',
    },
    debtOweLabel: {
        fontSize: 12,
        marginBottom: 4,
    },
    debtAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
    },
});
