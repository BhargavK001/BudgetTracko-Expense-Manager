import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadow, NeoShadowSm } from '@/constants/Theme';
import StatCard from '@/components/StatCard';
import TransactionItem from '@/components/TransactionItem';

// Dummy data for demonstration
const DUMMY_TRANSACTIONS = [
  {
    id: '1',
    icon: 'restaurant-outline' as const,
    title: 'Tea',
    amount: '12.0',
    date: '16 Feb 26',
    type: 'expense' as const,
  },
  {
    id: '2',
    icon: 'restaurant-outline' as const,
    title: 'Amul dark chocolate smooth',
    amount: '25.0',
    date: '16 Feb 26',
    type: 'expense' as const,
  },
  {
    id: '3',
    icon: 'restaurant-outline' as const,
    title: 'Dosa',
    amount: '40.0',
    date: '16 Feb 26',
    type: 'expense' as const,
  },
  {
    id: '4',
    icon: 'restaurant-outline' as const,
    title: 'Aape',
    amount: '45.0',
    date: '16 Feb 26',
    type: 'expense' as const,
  },
  {
    id: '5',
    icon: 'briefcase-outline' as const,
    title: 'Salary',
    amount: '10,000',
    date: '01 Feb 26',
    type: 'income' as const,
    iconColor: '#4CAF50',
    iconBgColor: '#1F2D1F',
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ─── Sticky Header ─── */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.greetingSmall}>Good Evening</Text>
          <Text style={styles.greetingName}>Bhargav Karande</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.premiumBadge}>
            <Ionicons name="diamond" size={16} color={DarkTheme.brandYellow} />
          </View>
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
          <TouchableOpacity style={styles.searchBtn}>
            <Ionicons name="search" size={20} color={DarkTheme.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <StatCard label="Spending" amount="₹2,670" type="spending" />
          <StatCard label="Income" amount="₹10,000" type="income" />
        </View>

        {/* Available Balance */}
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>Available Balance: ₹16,728</Text>
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent transactions</Text>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        {DUMMY_TRANSACTIONS.map((tx) => (
          <TransactionItem
            key={tx.id}
            icon={tx.icon}
            iconColor={tx.iconColor || DarkTheme.accentSecondary}
            iconBgColor={tx.iconBgColor || '#2D2517'}
            title={tx.title}
            amount={tx.amount}
            date={tx.date}
            type={tx.type}
          />
        ))}

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
  premiumBadge: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: DarkTheme.cardBg,
    borderWidth: 2,
    borderColor: DarkTheme.brandYellow + '55',
    justifyContent: 'center',
    alignItems: 'center',
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
  searchBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    backgroundColor: DarkTheme.cardBg,
    borderWidth: 1.5,
    borderColor: DarkTheme.neoBorder,
    justifyContent: 'center',
    alignItems: 'center',
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
  seeAllBtn: {
    backgroundColor: DarkTheme.cardBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
    borderColor: DarkTheme.neoBorder,
  },
  seeAll: {
    fontSize: FontSize.sm,
    color: DarkTheme.textSecondary,
    fontWeight: '700',
  },
});