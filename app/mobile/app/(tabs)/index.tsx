import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadow, NeoShadowSm } from '@/constants/Theme';
import StatCard from '@/components/StatCard';
import TransactionItem from '@/components/TransactionItem';
import { useTransactions, CATEGORY_ICONS, CATEGORY_COLORS } from '@/context/TransactionContext';
import { FinancialHealthWidget, SpendingVelocityWidget, UpcomingBillsWidget } from '@/components/DashboardWidgets';

function formatCurrency(n: number): string {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate().toString().padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const year = d.getFullYear().toString().slice(-2);
  return `${day} ${months[d.getMonth()]} ${year}`;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}


export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { transactions, getTotalIncome, getTotalExpense, getBalance } = useTransactions();

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const monthlyIncome = useMemo(() => getTotalIncome(currentMonth, currentYear), [getTotalIncome, currentMonth, currentYear]);
  const monthlyExpense = useMemo(() => getTotalExpense(currentMonth, currentYear), [getTotalExpense, currentMonth, currentYear]);
  const balance = useMemo(() => getBalance(), [getBalance]);

  // Calculations for Widgets
  const savingsRate = useMemo(() => {
    if (monthlyIncome <= 0) return 0;
    return Math.max(0, ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100);
  }, [monthlyIncome, monthlyExpense]);

  const velocityData = useMemo(() => {
    const dayOfMonth = now.getDate();
    const projected = (monthlyExpense / dayOfMonth) * 30;
    const target = 30000; // Mock target
    const percent = target > 0 ? (projected / target) * 100 : 0;
    return { projected, target, percent };
  }, [monthlyExpense]);

  // Show up to 10 recent transactions
  const recentTxs = useMemo(() => transactions.slice(0, 10), [transactions]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ─── Sticky Header ─── */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingSmall}>{getGreeting()}</Text>
          <Text style={styles.greetingName}>BudgetTracko</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={20} color={DarkTheme.brandYellow} />
          </View>
        </View>
      </View>

      {/* ─── Scrollable Content ─── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month Selector */}
        <View style={styles.monthSelector}>
          <TouchableOpacity style={styles.monthDropdown}>
            <Text style={styles.monthText}>This month</Text>
            <Ionicons name="chevron-down" size={16} color={DarkTheme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <StatCard label="Spending" amount={formatCurrency(monthlyExpense)} type="spending" />
          <StatCard label="Income" amount={formatCurrency(monthlyIncome)} type="income" />
        </View>

        {/* Advanced Widgets */}
        <FinancialHealthWidget savingsRate={savingsRate} />
        <SpendingVelocityWidget
          percent={velocityData.percent}
          projected={velocityData.projected}
          target={velocityData.target}
        />
        <UpcomingBillsWidget />

        {/* Available Balance */}
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>Available Balance: {formatCurrency(balance)}</Text>
        </View>


        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
        </View>

        {recentTxs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={DarkTheme.textMuted} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyDesc}>Tap the + button to add your first transaction</Text>
          </View>
        ) : (
          recentTxs.map((tx) => (
            <TransactionItem
              key={tx.id}
              icon={(CATEGORY_ICONS[tx.category] || 'ellipsis-horizontal-circle-outline') as any}
              iconColor={CATEGORY_COLORS[tx.category] || DarkTheme.accentSecondary}
              iconBgColor={(CATEGORY_COLORS[tx.category] || '#795548') + '33'}
              title={tx.title}
              amount={tx.amount.toLocaleString('en-IN')}
              date={formatDate(tx.date)}
              type={tx.type}
            />
          ))
        )}

        {/* Bottom spacer for tab bar */}
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
  // ─── Sticky Header ───
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
  headerLeft: {},
  greetingSmall: {
    fontSize: FontSize.xs,
    color: DarkTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
  },
  greetingName: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: DarkTheme.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: DarkTheme.brandYellow,
    ...NeoShadowSm,
  },
  // ─── Scroll Content ───
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  // Month Selector
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  monthDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: DarkTheme.cardBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: DarkTheme.neoBorder,
  },
  monthText: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: DarkTheme.textPrimary,
  },
  // Stats
  statsRow: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  // Balance Pill
  balancePill: {
    alignSelf: 'center',
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: DarkTheme.neoBorder,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  balanceText: {
    fontSize: FontSize.sm,
    color: DarkTheme.textSecondary,
    fontWeight: '600',
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    color: DarkTheme.brandYellow,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxxl + 20,
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: DarkTheme.neoBorder,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
    marginTop: Spacing.sm,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: DarkTheme.textSecondary,
    textAlign: 'center',
    maxWidth: '70%',
  },
});