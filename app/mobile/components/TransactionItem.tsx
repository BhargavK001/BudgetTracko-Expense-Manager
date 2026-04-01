import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';
import AnimatedPressable from './AnimatedPressable';
import { useSettings } from '@/context/SettingsContext';

type TransactionItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  description?: string;
  amount: string;
  date: string;
  type: 'expense' | 'income';
  onPress?: () => void;
};

function TransactionItem({
  icon,
  iconColor = DarkTheme.accent,
  iconBgColor,
  title,
  description,
  amount,
  date,
  type,
  onPress,
}: TransactionItemProps) {
  const { width } = useWindowDimensions();
  const { currency } = useSettings();
  const isCompact = width < 360;

  const isExpense = type === 'expense';
  const amtColor = isExpense ? DarkTheme.spending : DarkTheme.income;
  const bg = iconBgColor ?? (iconColor + '22');

  const iconBgStyle = useMemo(() => ({ backgroundColor: bg }), [bg]);
  const amtStyle = useMemo(() => ({ color: amtColor }), [amtColor]);

  return (
    <AnimatedPressable
      style={[styles.container, isCompact && styles.containerCompact]}
      onPress={onPress}
      scaleDown={0.97}
    >
      <View style={[styles.iconWrap, isCompact && styles.iconWrapCompact, iconBgStyle]}>
        <Ionicons name={icon} size={isCompact ? 17 : 19} color={iconColor} />
      </View>

      <View style={styles.details}>
        <Text style={[styles.title, isCompact && styles.titleCompact]} numberOfLines={1}>{title}</Text>
        {description ? <Text style={styles.desc} numberOfLines={1}>{description}</Text> : null}
      </View>

      <View style={[styles.right, isCompact && styles.rightCompact]}>
        <Text style={[styles.amount, isCompact && styles.amountCompact, amtStyle]} numberOfLines={1}>
          {isExpense ? '-' : '+'}{currency}{amount}
        </Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </AnimatedPressable>
  );
}

export default React.memo(TransactionItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  containerCompact: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  iconWrapCompact: {
    width: 40,
    height: 40,
    marginRight: Spacing.sm,
  },
  details: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: DarkTheme.textPrimary,
    marginBottom: 2,
  },
  titleCompact: {
    fontSize: FontSize.sm,
  },
  desc: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
    marginLeft: Spacing.sm,
    minWidth: 92,
  },
  rightCompact: {
    minWidth: 82,
  },
  amount: {
    fontSize: FontSize.md,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  amountCompact: {
    fontSize: FontSize.sm,
  },
  date: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
  },
});
