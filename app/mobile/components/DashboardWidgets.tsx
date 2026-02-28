import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming, useSharedValue, withDelay } from 'react-native-reanimated';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularGauge: React.FC<{ percent: number; label: string; size?: number }> = ({
  percent,
  label,
  size = 88,
}) => {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, percent));
  const fill = useSharedValue(0);

  React.useEffect(() => {
    fill.value = withDelay(400, withTiming(clamped, { duration: 1400 }));
  }, [clamped, fill]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - (fill.value / 100) * circumference,
  }));

  const color = clamped < 10 ? DarkTheme.spending : clamped < 25 ? DarkTheme.warning : DarkTheme.income;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={DarkTheme.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={`${circumference} ${circumference}`}
            animatedProps={animatedProps}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={[styles.gaugePercent, { color }]}>{clamped.toFixed(0)}%</Text>
        <Text style={styles.gaugeLabel}>{label}</Text>
      </View>
    </View>
  );
};

export const FinancialHealthWidget = ({ savingsRate }: { savingsRate: number }) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const statusColor =
    savingsRate >= 25 ? DarkTheme.income : savingsRate >= 10 ? DarkTheme.warning : DarkTheme.spending;
  const statusText =
    savingsRate >= 25 ? 'Great savings rate!' : savingsRate >= 10 ? 'Can improve' : 'Needs attention';
  const statusIcon = savingsRate >= 25 ? 'trending-up' : savingsRate >= 10 ? 'analytics' : 'trending-down';

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(244,63,94,0.15)' }]}>
          <Ionicons name="pulse" size={16} color={DarkTheme.spending} />
        </View>
        <Text style={styles.cardTitle}>Financial Health</Text>
      </View>

      <View style={[styles.healthRow, isCompact && styles.healthRowCompact]}>
        <CircularGauge percent={savingsRate} label="Savings" size={isCompact ? 78 : 88} />
        <View style={styles.healthInfo}>
          <View style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={statusIcon as any} size={12} color={statusColor} />
            <Text style={[styles.statusChipText, { color: statusColor }]}>{statusText}</Text>
          </View>
          <Text style={styles.healthDesc}>
            You saved{' '}
            <Text style={{ color: DarkTheme.income, fontWeight: '800' }}>{savingsRate.toFixed(1)}%</Text> of your
            income this month.
          </Text>
        </View>
      </View>
    </View>
  );
};

export const SpendingVelocityWidget = ({
  percent,
  projected,
  target,
}: {
  percent: number;
  projected: number;
  target: number;
}) => {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const over = percent > 100;
  const fill = Math.min(percent, 100);
  const paceColor = over ? DarkTheme.spending : DarkTheme.income;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
          <Ionicons name="speedometer-outline" size={16} color={DarkTheme.brandYellow} />
        </View>
        <Text style={styles.cardTitle}>Spending Pace</Text>
        <View style={[styles.statusChip, { backgroundColor: paceColor + '20', marginLeft: 'auto' }]}>
          <Ionicons name={over ? 'warning' : 'checkmark-circle'} size={12} color={paceColor} />
          <Text style={[styles.statusChipText, { color: paceColor }]}>{over ? 'Over pace' : 'On track'}</Text>
        </View>
      </View>

      <View style={styles.progTrack}>
        <View style={[styles.progFill, { width: `${fill}%` as const, backgroundColor: paceColor }]} />
      </View>

      <View style={[styles.velRow, isCompact && styles.velRowCompact]}>
        <Text style={styles.velLabel}>
          Projected:{' '}
          <Text style={{ color: DarkTheme.textPrimary, fontWeight: '800' }}>
            ₹{Math.round(projected).toLocaleString('en-IN')}
          </Text>
        </Text>
        <Text style={styles.velLabel}>
          Target: <Text style={{ color: DarkTheme.textSecondary }}>₹{target.toLocaleString('en-IN')}</Text>
        </Text>
      </View>
    </View>
  );
};

export const UpcomingBillsWidget = () => {
  const { width } = useWindowDimensions();
  const isCompact = width < 360;

  const bills = [
    { name: 'Netflix', date: 'Feb 15', amount: 649, icon: 'film-outline', color: '#E50914' },
    { name: 'Rent', date: 'Mar 01', amount: 15000, icon: 'home-outline', color: '#6366F1' },
    { name: 'Gym', date: 'Mar 05', amount: 2000, icon: 'fitness-outline', color: '#10B981' },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIconWrap, { backgroundColor: 'rgba(99,102,241,0.15)' }]}>
          <Ionicons name="calendar-outline" size={16} color={DarkTheme.accent} />
        </View>
        <Text style={styles.cardTitle}>Upcoming Bills</Text>
      </View>

      {bills.map((bill, index) => (
        <View
          key={bill.name}
          style={[styles.billRow, isCompact && styles.billRowCompact, index < bills.length - 1 && styles.billBorder]}
        >
          <View style={[styles.billIcon, { backgroundColor: bill.color + '22' }]}>
            <Ionicons name={bill.icon as any} size={16} color={bill.color} />
          </View>
          <View style={styles.billInfo}>
            <Text style={styles.billName}>{bill.name}</Text>
            <Text style={styles.billDate}>{bill.date}</Text>
          </View>
          <Text style={styles.billAmount}>₹{bill.amount.toLocaleString('en-IN')}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  cardIconWrap: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusChipText: {
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xl,
  },
  healthRowCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  healthInfo: {
    flex: 1,
    gap: Spacing.sm,
  },
  healthDesc: {
    fontSize: FontSize.xs,
    color: DarkTheme.textSecondary,
    lineHeight: 17,
  },
  gaugePercent: {
    fontSize: FontSize.md,
    fontWeight: '900',
  },
  gaugeLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: DarkTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progTrack: {
    height: 6,
    backgroundColor: DarkTheme.separator,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  velRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  velRowCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  velLabel: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
  },
  billRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  billRowCompact: {
    alignItems: 'flex-start',
  },
  billBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DarkTheme.separator,
  },
  billIcon: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  billInfo: {
    flex: 1,
  },
  billName: {
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: DarkTheme.textPrimary,
    marginBottom: 2,
  },
  billDate: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '600',
  },
  billAmount: {
    fontSize: FontSize.sm,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
  },
});
