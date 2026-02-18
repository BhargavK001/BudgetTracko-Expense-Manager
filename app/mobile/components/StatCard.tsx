import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

type StatCardProps = {
    label: string;
    amount: string;
    type: 'spending' | 'income';
};

export default function StatCard({ label, amount, type }: StatCardProps) {
    const isSpending = type === 'spending';

    return (
        <View style={[styles.card, isSpending ? styles.spendingCard : styles.incomeCard]}>
            <View style={styles.iconRow}>
                <View style={[styles.iconCircle, isSpending ? styles.spendingIcon : styles.incomeIcon]}>
                    <Ionicons
                        name={isSpending ? 'arrow-up' : 'arrow-down'}
                        size={16}
                        color="#FFFFFF"
                    />
                </View>
                <Text style={[styles.label, isSpending ? styles.spendingLabel : styles.incomeLabel]}>
                    {label}
                </Text>
            </View>
            <Text style={styles.amount}>{amount}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flex: 1,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        paddingVertical: Spacing.xl,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    spendingCard: {
        backgroundColor: DarkTheme.spendingBg,
        marginRight: Spacing.sm,
        borderColor: DarkTheme.spending + '44',
    },
    incomeCard: {
        backgroundColor: DarkTheme.incomeBg,
        marginLeft: Spacing.sm,
        borderColor: DarkTheme.income + '44',
    },
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    iconCircle: {
        width: 30,
        height: 30,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.sm,
    },
    spendingIcon: {
        backgroundColor: DarkTheme.spending,
    },
    incomeIcon: {
        backgroundColor: DarkTheme.income,
    },
    label: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    spendingLabel: {
        color: DarkTheme.spending,
    },
    incomeLabel: {
        color: DarkTheme.income,
    },
    amount: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginTop: Spacing.xs,
    },
});
