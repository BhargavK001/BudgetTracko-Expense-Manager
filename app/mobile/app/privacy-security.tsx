import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

export default function PrivacySecurityScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const sections = [
        {
            title: 'Data Collection',
            content: 'BudgetTracko is designed with privacy as a core value. In Local Mode, all your financial data, transactions, and account information are stored exclusively on your device.',
            icon: 'eye-off-outline',
            color: '#4CAF50'
        },
        {
            title: 'Storage & Encryption',
            content: 'All data is stored using encrypted local storage. We do not have access to your data, and we do not sell or share it with any third parties.',
            icon: 'lock-closed-outline',
            color: '#2196F3'
        },
        {
            title: 'Permissions',
            content: 'We only request permissions that are essential for the app to function, such as notifications for reminders or file access for data export.',
            icon: 'key-outline',
            color: '#FF9800'
        },
        {
            title: 'Your Rights',
            content: 'You have full control over your data. You can delete all your data at any time through the "Log Out" option in the More tab, which clears all local storage.',
            icon: 'shield-outline',
            color: '#7C4DFF'
        }
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Intro Icon */}
                <View style={styles.introContainer}>
                    <View style={styles.introIcon}>
                        <Ionicons name="shield-checkmark" size={48} color={DarkTheme.brandYellow} />
                    </View>
                    <Text style={styles.introTitle}>Your Privacy Matters</Text>
                    <Text style={styles.introDesc}>
                        We believe that your financial business is your business alone.
                        Here is how we protect your data.
                    </Text>
                </View>

                {/* Privacy Sections */}
                {sections.map((section, index) => (
                    <View key={index} style={styles.sectionCard}>
                        <View style={styles.sectionHeader}>
                            <View style={[styles.sectionIcon, { backgroundColor: section.color + '22' }]}>
                                <Ionicons name={section.icon as any} size={20} color={section.color} />
                            </View>
                            <Text style={styles.sectionTitle}>{section.title}</Text>
                        </View>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                    </View>
                ))}

                {/* Footer Info */}
                <View style={styles.footerCard}>
                    <Ionicons name="information-circle-outline" size={20} color={DarkTheme.textSecondary} />
                    <Text style={styles.footerText}>
                        Last updated: February 21, 2026. For more detailed information, please visit our website.
                    </Text>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DarkTheme.bg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 2,
        borderBottomColor: DarkTheme.neoBorder,
    },
    backBtn: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    scrollView: { flex: 1 },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    // Intro
    introContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    introIcon: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.md,
        backgroundColor: DarkTheme.cardBgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
        borderWidth: 2,
        borderColor: DarkTheme.brandYellow,
        ...NeoShadowSm,
    },
    introTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: Spacing.xs,
    },
    introDesc: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: Spacing.xl,
    },
    // Sections
    sectionCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        marginBottom: Spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        marginBottom: Spacing.sm,
    },
    sectionIcon: {
        width: 36,
        height: 36,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    sectionContent: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        lineHeight: 22,
    },
    // Footer
    footerCard: {
        flexDirection: 'row',
        gap: Spacing.md,
        padding: Spacing.lg,
        backgroundColor: DarkTheme.cardBgAlt,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
    },
    footerText: {
        flex: 1,
        fontSize: 12,
        color: DarkTheme.textMuted,
        lineHeight: 18,
    },
});
