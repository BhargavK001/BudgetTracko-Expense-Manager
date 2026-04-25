import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
} from 'react-native-reanimated';

// ── Base Skeleton Bar ────────────────────────────────────────
type SkeletonProps = {
    width?: number | string;
    height?: number;
    borderRadius?: number;
    style?: ViewStyle;
};

export function Skeleton({ width = '100%', height = 16, borderRadius = 8, style }: SkeletonProps) {
    const shimmer = useSharedValue(0);

    useEffect(() => {
        shimmer.value = withRepeat(
            withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.7, 0.3]),
    }));

    return (
        <Animated.View
            style={[
                {
                    width: width as any,
                    height,
                    borderRadius,
                    backgroundColor: '#E5E5EA',
                },
                animatedStyle,
                style,
            ]}
        />
    );
}

// ── Dashboard Skeleton ───────────────────────────────────────
export function DashboardSkeleton() {
    return (
        <View style={ds.container}>
            {/* Header area */}
            <View style={ds.header}>
                <View style={{ gap: 6 }}>
                    <Skeleton width={120} height={12} />
                    <Skeleton width={180} height={20} />
                </View>
                <Skeleton width={44} height={44} borderRadius={22} />
            </View>

            {/* Balance card */}
            <View style={ds.balanceCard}>
                <Skeleton width={100} height={10} style={{ marginBottom: 8 }} />
                <Skeleton width={180} height={32} style={{ marginBottom: 16 }} />
                <View style={ds.statRow}>
                    <View style={{ flex: 1, gap: 6 }}>
                        <Skeleton width={60} height={10} />
                        <Skeleton width={100} height={18} />
                    </View>
                    <View style={{ flex: 1, gap: 6, alignItems: 'flex-end' }}>
                        <Skeleton width={60} height={10} />
                        <Skeleton width={100} height={18} />
                    </View>
                </View>
            </View>

            {/* Section title */}
            <View style={ds.sectionHeader}>
                <Skeleton width={140} height={14} />
                <Skeleton width={60} height={12} />
            </View>

            {/* Transaction rows */}
            {[1, 2, 3, 4].map(i => (
                <View key={i} style={ds.txRow}>
                    <Skeleton width={44} height={44} borderRadius={14} />
                    <View style={{ flex: 1, gap: 6, marginLeft: 14 }}>
                        <Skeleton width={`${60 + i * 8}%`} height={14} />
                        <Skeleton width={80} height={10} />
                    </View>
                    <Skeleton width={70} height={16} />
                </View>
            ))}
        </View>
    );
}

const ds = StyleSheet.create({
    container: {
        padding: 24,
        gap: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    balanceCard: {
        backgroundColor: '#F5F5F5',
        borderRadius: 24,
        padding: 24,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    txRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F9F9FB',
        borderRadius: 16,
    },
});

// ── Card Skeleton ────────────────────────────────────────────
export function CardSkeleton() {
    return (
        <View style={cs.card}>
            <View style={cs.row}>
                <Skeleton width={40} height={40} borderRadius={12} />
                <View style={{ flex: 1, gap: 6, marginLeft: 12 }}>
                    <Skeleton width="70%" height={14} />
                    <Skeleton width="40%" height={10} />
                </View>
            </View>
        </View>
    );
}

const cs = StyleSheet.create({
    card: {
        backgroundColor: '#F9F9FB',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
