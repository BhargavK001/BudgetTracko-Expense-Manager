import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';
import AccountCard, { BalanceOverviewCard } from '@/components/AccountCard';
import { useTransactions } from '@/context/TransactionContext';

function formatCurrency(n: number): string {
    return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export default function AccountsScreen() {
    const insets = useSafeAreaInsets();
    const [showBalance, setShowBalance] = useState(false);
    const { transactions, getBalance } = useTransactions();

    const balance = useMemo(() => getBalance(), [getBalance]);

    // Compute per-account balances
    const accountBalances = useMemo(() => {
        const map = new Map<string, number>();
        transactions.forEach((tx) => {
            const current = map.get(tx.account) || 0;
            map.set(tx.account, current + (tx.type === 'income' ? tx.amount : -tx.amount));
        });
        return map;
    }, [transactions]);

    const cashBalance = accountBalances.get('Cash') || 0;
    const bankBalance = accountBalances.get('Bank Account') || 0;
    const sliceBalance = accountBalances.get('Slice') || 0;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Sticky Header ─── */}
            <View style={styles.stickyHeader}>
                <View style={styles.titleRow}>
                    <Text style={styles.title}>All Accounts</Text>
                    <Ionicons name="information-circle-outline" size={18} color={DarkTheme.textMuted} />
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Balance Toggle */}
                <View style={styles.balanceToggle}>
                    <Text style={styles.balanceNote}>Transactions based balance, actual may vary.</Text>
                    <TouchableOpacity
                        style={styles.toggleContainer}
                        onPress={() => setShowBalance(!showBalance)}
                    >
                        <Text style={styles.toggleLabel}>Show balance</Text>
                        <View style={[styles.toggle, showBalance && styles.toggleActive]}>
                            <View style={[styles.toggleDot, showBalance && styles.toggleDotActive]} />
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Overview Cards */}
                <View style={styles.overviewRow}>
                    <BalanceOverviewCard label="Available Balance" masked={!showBalance} amount={formatCurrency(balance)} />
                    <View style={{ width: Spacing.md }} />
                    <BalanceOverviewCard label="Available Credit" masked={!showBalance} amount="₹0" />
                </View>

                {/* Bank Accounts */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="business" size={16} color="#2196F3" />
                        <Text style={styles.sectionTitle}>Bank Accounts</Text>
                    </View>
                    <AccountCard name="Slice" masked={!showBalance} balance={formatCurrency(sliceBalance)} />
                </View>

                {/* Wallets */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="wallet" size={16} color="#2196F3" />
                        <Text style={styles.sectionTitle}>Wallets</Text>
                    </View>
                    <AccountCard name="Bank Account" masked={!showBalance} balance={formatCurrency(bankBalance)} />
                </View>

                {/* Cash */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Ionicons name="cash" size={16} color="#4CAF50" />
                        <Text style={styles.sectionTitle}>Cash</Text>
                    </View>
                    <AccountCard name="Cash" masked={!showBalance} balance={formatCurrency(cashBalance)} />
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DarkTheme.bg,
    },
    // Sticky Header
    stickyHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: DarkTheme.bg,
        borderBottomWidth: 2,
        borderBottomColor: DarkTheme.neoBorder,
        zIndex: 10,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    // Scroll
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
    },
    // Balance Toggle
    balanceToggle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    balanceNote: {
        fontSize: FontSize.xs,
        color: DarkTheme.textMuted,
        flex: 1,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    toggleLabel: {
        fontSize: FontSize.xs,
        color: DarkTheme.textSecondary,
        fontWeight: '600',
    },
    toggle: {
        width: 40,
        height: 22,
        borderRadius: 4,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        justifyContent: 'center',
        paddingHorizontal: 2,
    },
    toggleActive: {
        backgroundColor: DarkTheme.income,
        borderColor: DarkTheme.income,
    },
    toggleDot: {
        width: 16,
        height: 16,
        borderRadius: 3,
        backgroundColor: DarkTheme.textMuted,
    },
    toggleDotActive: {
        alignSelf: 'flex-end',
        backgroundColor: '#FFFFFF',
    },
    // Overview Cards
    overviewRow: {
        flexDirection: 'row',
        marginBottom: Spacing.xxl,
    },
    // Sections
    section: {
        marginBottom: Spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});
