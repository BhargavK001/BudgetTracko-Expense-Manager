import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, G } from 'react-native-svg';
import Animated, { useAnimatedProps, withTiming, useSharedValue, withDelay } from 'react-native-reanimated';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularGaugeProps {
    percent: number;
    label: string;
    size?: number;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({ percent, label, size = 100 }) => {
    const strokeWidth = 10;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedPercent = Math.max(0, Math.min(100, percent));
    const fillValue = useSharedValue(0);

    React.useEffect(() => {
        fillValue.value = withDelay(500, withTiming(clampedPercent, { duration: 1500 }));
    }, [clampedPercent]);

    const animatedProps = useAnimatedProps(() => {
        const offset = circumference - (fillValue.value / 100) * circumference;
        return {
            strokeDashoffset: offset,
        };
    });

    const color = clampedPercent < 10 ? '#EF4444' : clampedPercent < 25 ? '#FFBB28' : '#10B981';

    return (
        <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={DarkTheme.separator}
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
            <View style={styles.gaugeCenter}>
                <Text style={[styles.gaugePercent, { color }]}>{clampedPercent.toFixed(0)}%</Text>
                <Text style={styles.gaugeLabel}>{label}</Text>
            </View>
        </View>
    );
};

export const FinancialHealthWidget = ({ savingsRate }: { savingsRate: number }) => {
    return (
        <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
                <Ionicons name="pulse" size={18} color={DarkTheme.spending} />
                <Text style={styles.widgetTitle}>Financial Health</Text>
            </View>
            <View style={styles.gaugeContainer}>
                <CircularGauge percent={savingsRate} label="Savings" />
                <View style={styles.healthInfo}>
                    <Text style={styles.healthStatus}>
                        {savingsRate >= 25 ? '● Great savings rate!' : savingsRate >= 10 ? '● Can improve' : '● Needs attention'}
                    </Text>
                    <Text style={styles.healthDesc}>
                        You saved {savingsRate.toFixed(1)}% of your income this month.
                    </Text>
                </View>
            </View>
        </View>
    );
};

export const SpendingVelocityWidget = ({ percent, projected, target }: { percent: number, projected: number, target: number }) => {
    const isOverPace = percent > 100;

    return (
        <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
                <Ionicons name="speedometer-outline" size={18} color={DarkTheme.brandYellow} />
                <Text style={styles.widgetTitle}>Spending Pace</Text>
            </View>
            <View style={styles.velocityContent}>
                <View style={styles.velocityRow}>
                    <Text style={styles.velocityLabel}>Projected: ₹{projected.toLocaleString()}</Text>
                    <View style={styles.statusBadge}>
                        <Ionicons name={isOverPace ? "warning" : "checkmark-circle"} size={12} color={isOverPace ? DarkTheme.spending : DarkTheme.income} />
                        <Text style={[styles.statusText, { color: isOverPace ? DarkTheme.spending : DarkTheme.income }]}>
                            {isOverPace ? 'Over pace' : 'On track'}
                        </Text>
                    </View>
                </View>

                <View style={styles.progressBarBg}>
                    <View style={[
                        styles.progressBarFill,
                        { width: `${Math.min(percent, 100)}%`, backgroundColor: isOverPace ? DarkTheme.spending : DarkTheme.income }
                    ]} />
                    <View style={styles.targetLine} />
                </View>

                <Text style={styles.velocityTarget}>Target: ₹{target.toLocaleString()}/month</Text>
            </View>
        </View>
    );
};

export const UpcomingBillsWidget = () => {
    // Mock data for mobile
    const bills = [
        { name: 'Netflix', date: 'Feb 15', amount: 649 },
        { name: 'Rent', date: 'Mar 01', amount: 15000 },
        { name: 'Gym', date: 'Mar 05', amount: 2000 },
    ];

    return (
        <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
                <Ionicons name="calendar-outline" size={18} color="#2196F3" />
                <Text style={styles.widgetTitle}>Upcoming Bills</Text>
            </View>
            <View style={styles.billsList}>
                {bills.map((bill, i) => (
                    <View key={i} style={[styles.billItem, i === bills.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={styles.billMain}>
                            <Text style={styles.billName}>{bill.name}</Text>
                            <Text style={styles.billDate}>{bill.date}</Text>
                        </View>
                        <Text style={styles.billAmount}>₹{bill.amount.toLocaleString()}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    widgetCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: DarkTheme.neoBorder,
        ...NeoShadowSm,
    },
    widgetHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: Spacing.lg,
    },
    widgetTitle: {
        fontSize: FontSize.sm,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    gaugeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xl,
    },
    gaugeCenter: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    gaugePercent: {
        fontSize: FontSize.lg,
        fontWeight: '900',
    },
    gaugeLabel: {
        fontSize: 8,
        fontWeight: '700',
        color: DarkTheme.textMuted,
        textTransform: 'uppercase',
    },
    healthInfo: {
        flex: 1,
    },
    healthStatus: {
        fontSize: 10,
        fontWeight: '800',
        marginBottom: 4,
    },
    healthDesc: {
        fontSize: FontSize.xs,
        color: DarkTheme.textSecondary,
        lineHeight: 16,
    },
    velocityContent: {
        gap: 12,
    },
    velocityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    velocityLabel: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        textTransform: 'uppercase',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: DarkTheme.bg,
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: DarkTheme.neoBorder,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    targetLine: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 2,
        backgroundColor: DarkTheme.brandYellow,
        opacity: 0.5,
    },
    velocityTarget: {
        fontSize: 10,
        color: DarkTheme.textMuted,
        fontWeight: '600',
    },
    billsList: {
        marginTop: -8,
    },
    billItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: DarkTheme.separator,
    },
    billMain: {
        gap: 2,
    },
    billName: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    billDate: {
        fontSize: 10,
        fontWeight: '600',
        color: DarkTheme.textMuted,
    },
    billAmount: {
        fontSize: FontSize.sm,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
    },
});
