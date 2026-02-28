import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';

type StatCardProps = {
  label: string;
  amount: string;
  type: 'spending' | 'income';
};

export default function StatCard({ label, amount, type }: StatCardProps) {
  const isSpending = type === 'spending';
  const color  = isSpending ? DarkTheme.spending : DarkTheme.income;
  const bgTint = isSpending ? 'rgba(244,63,94,0.12)' : 'rgba(16,185,129,0.12)';
  const border = isSpending ? 'rgba(244,63,94,0.2)'  : 'rgba(16,185,129,0.2)';

  return (
    <View style={[styles.card, { backgroundColor: bgTint, borderColor: border }]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: color + '28' }]}>
          <Ionicons name={isSpending ? 'arrow-up' : 'arrow-down'} size={15} color={color} />
        </View>
        <Text style={[styles.label, { color }]}>{label}</Text>
      </View>
      <Text style={styles.amount}>{amount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  amount: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
    letterSpacing: -0.3,
  },
});
