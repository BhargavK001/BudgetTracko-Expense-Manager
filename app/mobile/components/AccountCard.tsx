import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';

type AccountCardProps = {
    name: string;
    balance?: string;
    masked?: boolean;
    onPress?: () => void;
};

export default function AccountCard({ name, balance, masked = true, onPress }: AccountCardProps) {
    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <Text style={styles.name}>{name}</Text>
            <View style={styles.rightSection}>
                <Text style={styles.balance}>{masked ? '•••••' : balance}</Text>
                <Ionicons name="chevron-forward" size={18} color={DarkTheme.chevron} />
            </View>
        </TouchableOpacity>
    );
}

type BalanceOverviewCardProps = {
    label: string;
    amount?: string;
    masked?: boolean;
};

export function BalanceOverviewCard({ label, amount, masked = true }: BalanceOverviewCardProps) {
    return (
        <View style={styles.overviewCard}>
            <View style={styles.overviewLabelRow}>
                <Text style={styles.overviewLabel}>{label}</Text>
                <Ionicons name="information-circle-outline" size={14} color={DarkTheme.textMuted} />
            </View>
            <Text style={styles.overviewAmount}>{masked ? '•••••' : amount}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        paddingVertical: Spacing.xl,
        marginBottom: Spacing.sm,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    name: {
        fontSize: FontSize.lg,
        fontWeight: '700',
        color: DarkTheme.textPrimary,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    balance: {
        fontSize: FontSize.md,
        color: DarkTheme.textSecondary,
        letterSpacing: 2,
    },
    // Overview card styles
    overviewCard: {
        flex: 1,
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    overviewLabelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    overviewLabel: {
        fontSize: FontSize.xs,
        color: DarkTheme.textSecondary,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    overviewAmount: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        letterSpacing: 2,
    },
});
