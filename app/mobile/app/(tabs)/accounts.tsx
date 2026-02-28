import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadow } from '@/constants/Theme';
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

  const accountBalances = useMemo(() => {
    const map = new Map<string, number>();
    transactions.forEach((tx) => {
      const current = map.get(tx.account) || 0;
      map.set(tx.account, current + (tx.type === 'income' ? tx.amount : -tx.amount));
    });
    return map;
  }, [transactions]);

  const cashBalance  = accountBalances.get('Cash')          || 0;
  const bankBalance  = accountBalances.get('Bank Account')  || 0;
  const sliceBalance = accountBalances.get('Slice')         || 0;

  const sections = [
    {
      title: 'Bank Accounts',
      icon:  'business-outline' as const,
      color: '#6366F1',
      accounts: [{ name: 'Slice', balance: formatCurrency(sliceBalance) }],
    },
    {
      title: 'Wallets',
      icon:  'wallet-outline' as const,
      color: '#10B981',
      accounts: [{ name: 'Bank Account', balance: formatCurrency(bankBalance) }],
    },
    {
      title: 'Cash',
      icon:  'cash-outline' as const,
      color: '#F59E0B',
      accounts: [{ name: 'Cash', balance: formatCurrency(cashBalance) }],
    },
  ];

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Overview</Text>
          <Text style={styles.headerTitle}>My Accounts</Text>
        </View>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="add" size={22} color={DarkTheme.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Net Worth Hero Card ─── */}
        <LinearGradient
          colors={['#1A2550', '#0D1630', '#060D1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.netWorthCard}
        >
          <View style={styles.blobTL} />
          <View style={styles.netWorthRow}>
            <View>
              <Text style={styles.netWorthLabel}>Net Worth</Text>
              <Text style={styles.netWorthValue}>
                {showBalance ? formatCurrency(balance) : '₹ ••••••'}
              </Text>
              <Text style={styles.netWorthSub}>Across all accounts</Text>
            </View>
            <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowBalance(!showBalance)}>
              <Ionicons
                name={showBalance ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={DarkTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* mini overview pills */}
          <View style={styles.overviewPills}>
            <View style={styles.overviewPill}>
              <Ionicons name="trending-up" size={12} color={DarkTheme.income} />
              <Text style={styles.overviewPillText}>Assets</Text>
              <Text style={styles.overviewPillVal}>
                {showBalance ? formatCurrency(Math.max(balance, 0)) : '••••'}
              </Text>
            </View>
            <View style={styles.pillDivider} />
            <View style={styles.overviewPill}>
              <Ionicons name="trending-down" size={12} color={DarkTheme.spending} />
              <Text style={styles.overviewPillText}>Liabilities</Text>
              <Text style={styles.overviewPillVal}>
                {showBalance ? formatCurrency(Math.abs(Math.min(balance, 0))) : '••••'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ─── Balance Overview ─── */}
        <View style={styles.overviewRow}>
          <BalanceOverviewCard
            label="Available Balance"
            masked={!showBalance}
            amount={formatCurrency(balance)}
            accentColor={DarkTheme.accent}
          />
          <View style={{ width: Spacing.md }} />
          <BalanceOverviewCard
            label="Available Credit"
            masked={!showBalance}
            amount="₹0"
            accentColor={DarkTheme.success}
          />
        </View>

        {/* ─── Account Sections ─── */}
        {sections.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconWrap, { backgroundColor: sec.color + '22' }]}>
                <Ionicons name={sec.icon} size={14} color={sec.color} />
              </View>
              <Text style={styles.sectionTitle}>{sec.title}</Text>
            </View>
            {sec.accounts.map((acc) => (
              <AccountCard
                key={acc.name}
                name={acc.name}
                masked={!showBalance}
                balance={acc.balance}
              />
            ))}
          </View>
        ))}

        {/* Add Account CTA */}
        <TouchableOpacity style={styles.addAccountBtn} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={20} color={DarkTheme.accent} />
          <Text style={styles.addAccountText}>Add New Account</Text>
        </TouchableOpacity>

        <Text style={styles.bottomNote}>
          Balances are calculated from your transactions and may differ from actual amounts.
        </Text>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DarkTheme.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerSub: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.35)',
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  // Net Worth Card
  netWorthCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: DarkTheme.borderLight,
    ...NeoShadow,
  },
  blobTL: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  netWorthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  netWorthLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(148,163,184,0.85)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  netWorthValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  netWorthSub: {
    fontSize: FontSize.xs,
    color: 'rgba(148,163,184,0.7)',
    fontWeight: '600',
  },
  eyeBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewPills: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  overviewPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  pillDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: Spacing.md,
  },
  overviewPillText: {
    fontSize: FontSize.xs,
    color: 'rgba(148,163,184,0.7)',
    flex: 1,
  },
  overviewPillVal: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Overview Row
  overviewRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xl,
  },
  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: DarkTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  // Add Account
  addAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: DarkTheme.border,
    borderStyle: 'dashed',
    marginBottom: Spacing.lg,
  },
  addAccountText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: DarkTheme.accent,
  },
  bottomNote: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
});
