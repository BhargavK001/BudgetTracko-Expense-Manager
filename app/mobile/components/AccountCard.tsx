import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';

const ACCOUNT_ICONS: Record<string, { icon: React.ComponentProps<typeof Ionicons>['name']; color: string }> = {
  'Cash':         { icon: 'cash-outline',     color: '#10B981' },
  'Bank Account': { icon: 'business-outline', color: '#6366F1' },
  'Slice':        { icon: 'card-outline',     color: '#F59E0B' },
};

type AccountCardProps = {
  name: string;
  balance?: string;
  masked?: boolean;
  onPress?: () => void;
};

export default function AccountCard({ name, balance, masked = true, onPress }: AccountCardProps) {
  const meta  = ACCOUNT_ICONS[name] ?? { icon: 'wallet-outline' as const, color: DarkTheme.accent };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.iconWrap, { backgroundColor: meta.color + '22' }]}>
        <Ionicons name={meta.icon} size={20} color={meta.color} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.type}>Account</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.balance}>{masked ? '₹ ••••••' : balance}</Text>
        <Ionicons name="chevron-forward" size={16} color={DarkTheme.chevron} />
      </View>
    </TouchableOpacity>
  );
}

type BalanceOverviewCardProps = {
  label: string;
  amount?: string;
  masked?: boolean;
  accentColor?: string;
};

export function BalanceOverviewCard({ label, amount, masked = true, accentColor = DarkTheme.accent }: BalanceOverviewCardProps) {
  return (
    <View style={[styles.overviewCard, { borderColor: accentColor + '30' }]}>
      <View style={[styles.overviewDot, { backgroundColor: accentColor + '28' }]}>
        <Ionicons name="wallet-outline" size={14} color={accentColor} />
      </View>
      <Text style={styles.overviewLabel}>{label}</Text>
      <Text style={[styles.overviewAmount, { color: masked ? DarkTheme.textMuted : DarkTheme.textPrimary }]}>
        {masked ? '₹ ••••••' : amount}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  info: { flex: 1 },
  name: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: DarkTheme.textPrimary,
    marginBottom: 2,
  },
  type: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  balance: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: DarkTheme.textSecondary,
    letterSpacing: 1,
  },
  // Overview
  overviewCard: {
    flex: 1,
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  overviewDot: {
    width: 34,
    height: 34,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  overviewLabel: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  overviewAmount: {
    fontSize: FontSize.xl,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
