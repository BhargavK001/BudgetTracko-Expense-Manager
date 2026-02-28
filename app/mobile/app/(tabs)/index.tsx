import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadow } from '@/constants/Theme';
import TransactionItem from '@/components/TransactionItem';
import { useTransactions, CATEGORY_ICONS, CATEGORY_COLORS } from '@/context/TransactionContext';
import { useAuth } from '@/context/AuthContext';
import { SpendingVelocityWidget, UpcomingBillsWidget } from '@/components/DashboardWidgets';

function formatCurrency(n: number): string {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
function formatDate(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}
function getDateLabel(): string {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

const RANGE_OPTIONS = ['Month', 'Year', 'All'] as const;
type Range = typeof RANGE_OPTIONS[number];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { transactions, getTotalIncome, getTotalExpense, getBalance } = useTransactions();
  const { user } = useAuth();
  const [range, setRange] = useState<Range>('Month');
  const [balanceHidden, setBalanceHidden] = useState(false);

  const isCompact = width < 360;
  const isTablet = width >= 768;
  const horizontalPadding = isTablet ? Spacing.xxxl : isCompact ? Spacing.md : Spacing.lg;
  const heroPadding = isTablet ? Spacing.xxxl : isCompact ? Spacing.lg : Spacing.xxl;
  const heroBalanceSize = isTablet ? 42 : isCompact ? 30 : 36;
  const bottomInsetPadding = insets.bottom + 112;

  const now         = new Date();
  const currentMonth = now.getMonth();
  const currentYear  = now.getFullYear();

  const monthlyIncome   = useMemo(() => getTotalIncome(currentMonth, currentYear),  [getTotalIncome,   currentMonth, currentYear]);
  const monthlyExpense  = useMemo(() => getTotalExpense(currentMonth, currentYear), [getTotalExpense,  currentMonth, currentYear]);
  const balance         = useMemo(() => getBalance(),                                [getBalance]);

  const savingsRate = useMemo(() => {
    if (monthlyIncome <= 0) return 0;
    return Math.max(0, ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100);
  }, [monthlyIncome, monthlyExpense]);

  const velocityData = useMemo(() => {
    const dayOfMonth = now.getDate();
    const projected  = (monthlyExpense / dayOfMonth) * 30;
    const target     = 30000;
    const percent    = target > 0 ? (projected / target) * 100 : 0;
    return { projected, target, percent };
  }, [monthlyExpense]);

  const recentTxs = useMemo(() => transactions.slice(0, 8), [transactions]);

  const netChange = monthlyIncome - monthlyExpense;
  const netPositive = netChange >= 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ─── Header ─── */}
      <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
        <View>
          <Text style={styles.dateLabel}>{getDateLabel()}</Text>
          <Text style={styles.greeting}>
            {getGreeting()},{' '}
            <Text style={styles.greetingName}>{user?.displayName?.split(' ')[0] || 'Friend'} 👋</Text>
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={DarkTheme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.avatarBtn}>
            <Ionicons name="person" size={18} color={DarkTheme.textAccent} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: horizontalPadding,
            paddingBottom: bottomInsetPadding,
          },
        ]}
      >
        <View style={[styles.contentInner, isTablet && styles.contentInnerTablet]}>
        {/* ─── Hero Balance Card ─── */}
        <LinearGradient
          colors={['#1E2D6B', '#0D1630', '#060D1F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { padding: heroPadding }]}
        >
          {/* decorative blobs */}
          <View style={styles.blobTL} />
          <View style={styles.blobBR} />

          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>Total Balance</Text>
              <Text style={styles.heroBalance}>
                <Text style={{ fontSize: heroBalanceSize }}>
                  {balanceHidden ? '₹ ••••••' : formatCurrency(balance)}
                </Text>
              </Text>
              <View style={[styles.netBadge, netPositive ? styles.netBadgeGreen : styles.netBadgeRed]}>
                <Ionicons
                  name={netPositive ? 'trending-up' : 'trending-down'}
                  size={12}
                  color={netPositive ? DarkTheme.income : DarkTheme.spending}
                />
                <Text style={[styles.netBadgeText, { color: netPositive ? DarkTheme.income : DarkTheme.spending }]}>
                  {netPositive ? '+' : '-'}{formatCurrency(Math.abs(netChange))} this month
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setBalanceHidden(!balanceHidden)} style={styles.eyeBtn}>
              <Ionicons
                name={balanceHidden ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={DarkTheme.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {/* ── Income / Expense row ── */}
          <View style={[styles.heroStats, isCompact && styles.heroStatsCompact]}>
            <View style={[styles.heroStatItem, isCompact && styles.heroStatItemCompact]}>
              <View style={[styles.heroStatIcon, { backgroundColor: 'rgba(16,185,129,0.18)' }]}>
                <Ionicons name="arrow-down" size={14} color={DarkTheme.income} />
              </View>
              <View>
                <Text style={styles.heroStatLabel}>Income</Text>
                <Text style={styles.heroStatValue}>{formatCurrency(monthlyIncome)}</Text>
              </View>
            </View>
            {!isCompact && <View style={styles.heroStatDivider} />}
            <View style={[styles.heroStatItem, isCompact && styles.heroStatItemCompact]}>
              <View style={[styles.heroStatIcon, { backgroundColor: 'rgba(244,63,94,0.18)' }]}>
                <Ionicons name="arrow-up" size={14} color={DarkTheme.spending} />
              </View>
              <View>
                <Text style={styles.heroStatLabel}>Expense</Text>
                <Text style={styles.heroStatValue}>{formatCurrency(monthlyExpense)}</Text>
              </View>
            </View>
            {!isCompact && <View style={styles.heroStatDivider} />}
            <View style={[styles.heroStatItem, isCompact && styles.heroStatItemCompact]}>
              <View style={[styles.heroStatIcon, { backgroundColor: 'rgba(99,102,241,0.18)' }]}>
                <Ionicons name="wallet" size={14} color={DarkTheme.accent} />
              </View>
              <View>
                <Text style={styles.heroStatLabel}>Savings</Text>
                <Text style={styles.heroStatValue}>{savingsRate.toFixed(0)}%</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ─── Date Range Selector ─── */}
        <View style={styles.rangeRow}>
          {RANGE_OPTIONS.map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.rangeBtn, range === r && styles.rangeBtnActive]}
              onPress={() => setRange(r)}
              activeOpacity={0.7}
            >
              <Text style={[styles.rangeBtnText, range === r && styles.rangeBtnTextActive]}>{r}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Quick Actions ─── */}
        <View style={styles.quickActions}>
          {[
            { icon: 'arrow-up-circle-outline',   label: 'Send',     color: '#6366F1' },
            { icon: 'arrow-down-circle-outline', label: 'Receive',  color: '#10B981' },
            { icon: 'repeat-outline',            label: 'Transfer', color: '#F59E0B' },
            { icon: 'scan-outline',              label: 'Scan',     color: '#EC4899' },
          ].map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.quickActionItem}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.quickActionIcon,
                  { backgroundColor: a.color + '22', width: isCompact ? 52 : 56, height: isCompact ? 52 : 56 },
                ]}
              >
                <Ionicons name={a.icon as any} size={isCompact ? 20 : 22} color={a.color} />
              </View>
              <Text style={styles.quickActionLabel} numberOfLines={1}>
                {a.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Spending Pace ─── */}
        <SpendingVelocityWidget
          percent={velocityData.percent}
          projected={velocityData.projected}
          target={velocityData.target}
        />

        {/* ─── Upcoming Bills ─── */}
        <UpcomingBillsWidget />

        {/* ─── Recent Transactions ─── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.sectionLink}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentTxs.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={32} color={DarkTheme.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptyDesc}>Tap + to add your first transaction</Text>
          </View>
        ) : (
          recentTxs.map((tx) => (
            <TransactionItem
              key={tx.id}
              icon={(CATEGORY_ICONS[tx.category] || 'ellipsis-horizontal-circle-outline') as any}
              iconColor={CATEGORY_COLORS[tx.category] || DarkTheme.accentSecondary}
              iconBgColor={(CATEGORY_COLORS[tx.category] || DarkTheme.accent) + '22'}
              title={tx.title}
              amount={tx.amount.toLocaleString('en-IN')}
              date={formatDate(tx.date)}
              type={tx.type}
            />
          ))
        )}

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DarkTheme.bg,
  },
  // ─── Header ───
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  dateLabel: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  greeting: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: DarkTheme.textSecondary,
  },
  greetingName: {
    color: DarkTheme.textPrimary,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: DarkTheme.cardBg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  avatarBtn: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
  },
  scrollContent: {
    paddingTop: 2,
  },
  contentInner: {
    width: '100%',
  },
  contentInnerTablet: {
    maxWidth: 760,
    alignSelf: 'center',
  },
  // ─── Hero Card ───
  heroCard: {
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
    top: -40,
    left: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99,102,241,0.12)',
  },
  blobBR: {
    position: 'absolute',
    bottom: -50,
    right: -30,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(139,92,246,0.08)',
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xxl,
  },
  heroLabel: {
    fontSize: FontSize.xs,
    color: 'rgba(148,163,184,0.9)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.xs,
  },
  heroBalance: {
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: Spacing.sm,
  },
  netBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  netBadgeGreen: { backgroundColor: 'rgba(16,185,129,0.15)' },
  netBadgeRed:   { backgroundColor: 'rgba(244,63,94,0.15)' },
  netBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  eyeBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroStatsCompact: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: Spacing.sm,
  },
  heroStatItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  heroStatItemCompact: {
    flex: 0,
  },
  heroStatIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroStatLabel: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
    marginBottom: 2,
  },
  heroStatValue: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
  },
  heroStatDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: Spacing.sm,
  },
  // ─── Range Selector ───
  rangeRow: {
    flexDirection: 'row',
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.md,
    padding: 4,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  rangeBtnActive: {
    backgroundColor: DarkTheme.accent,
  },
  rangeBtnText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: DarkTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rangeBtnTextActive: {
    color: '#FFFFFF',
  },
  // ─── Quick Actions ───
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  quickActionItem: {
    width: '25%',
    flexShrink: 1,
    alignItems: 'center',
    paddingHorizontal: 2,
    gap: Spacing.xs,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  quickActionLabel: {
    fontSize: FontSize.xs,
    color: DarkTheme.textSecondary,
    fontWeight: '600',
  },
  // ─── Section Header ───
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
  },
  sectionLink: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: DarkTheme.textAccent,
  },
  // ─── Empty State ───
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl + 12,
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: DarkTheme.border,
    gap: Spacing.sm,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    backgroundColor: DarkTheme.cardBgElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
  },
  emptyDesc: {
    fontSize: FontSize.sm,
    color: DarkTheme.textMuted,
    textAlign: 'center',
  },
});