import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';

type TransactionItemProps = {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor?: string;
    iconBgColor?: string;
    title: string;
    description?: string;
    amount: string;
    date: string;
    type: 'expense' | 'income';
    accountIcon?: keyof typeof Ionicons.glyphMap;
    onPress?: () => void;
};

export default function TransactionItem({
    icon,
    iconColor = DarkTheme.accentSecondary,
    iconBgColor = '#2D2517',
    title,
    description,
    amount,
    date,
    type,
    accountIcon = 'business-outline',
    onPress,
}: TransactionItemProps) {
    const isExpense = type === 'expense';

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                <Ionicons name={icon} size={18} color={iconColor} />
            </View>

            <View style={styles.details}>
                <Text style={styles.amount} numberOfLines={1}>
                    {isExpense ? '' : '+'}₹{amount}
                </Text>
                <Text style={styles.title} numberOfLines={1}>
                    {title}
                    {description ? ` ${description}` : ''}
                </Text>
            </View>

            <View style={styles.rightSection}>
                <Text style={styles.date}>{date}</Text>
                <Ionicons name={accountIcon} size={16} color={DarkTheme.textMuted} />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    iconCircle: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    details: {
        flex: 1,
    },
    amount: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    title: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        marginTop: 2,
    },
    rightSection: {
        alignItems: 'flex-end',
        gap: Spacing.xs,
    },
    date: {
        fontSize: FontSize.xs,
        color: DarkTheme.textSecondary,
        fontWeight: '600',
    },
});
