import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

const FAQ_ITEMS = [
    {
        question: 'How do I add a transaction?',
        answer: 'Tap the yellow + button at the bottom of the screen. Choose expense or income, enter the amount, title, category, and account, then tap Save.',
    },
    {
        question: 'Is my data stored securely?',
        answer: 'All data is stored locally on your device using encrypted storage. No data is sent to any server in offline mode.',
    },
    {
        question: 'Can I export my transaction data?',
        answer: 'Export functionality is coming soon in a future update. Stay tuned!',
    },
    {
        question: 'How do I delete a transaction?',
        answer: 'Swipe left on any transaction in the list to reveal the delete option. This feature is coming soon.',
    },
    {
        question: 'What categories are available?',
        answer: 'We have 8 expense categories (Food, Transport, Shopping, Entertainment, Bills, Health, Education, Other) and 5 income categories (Salary, Freelance, Investment, Gift, Other).',
    },
];

export default function HelpSupportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleEmail = () => {
        Linking.openURL('mailto:support@budgettracko.com?subject=BudgetTracko%20Support');
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Contact Card */}
                <View style={styles.contactCard}>
                    <View style={styles.contactIcon}>
                        <Ionicons name="mail" size={24} color={DarkTheme.brandYellow} />
                    </View>
                    <Text style={styles.contactTitle}>Need help?</Text>
                    <Text style={styles.contactDesc}>
                        Reach out to us and we'll get back to you within 24 hours.
                    </Text>
                    <TouchableOpacity style={styles.contactBtn} onPress={handleEmail}>
                        <Ionicons name="mail-outline" size={16} color={DarkTheme.brandBlack} />
                        <Text style={styles.contactBtnText}>Email Support</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ Section */}
                <Text style={styles.sectionTitle}>FAQ</Text>
                <View style={styles.faqContainer}>
                    {FAQ_ITEMS.map((item, index) => (
                        <View
                            key={index}
                            style={[
                                styles.faqItem,
                                index < FAQ_ITEMS.length - 1 && styles.faqItemBorder,
                            ]}
                        >
                            <View style={styles.faqQuestion}>
                                <Ionicons name="help-circle" size={18} color={DarkTheme.brandYellow} />
                                <Text style={styles.faqQuestionText}>{item.question}</Text>
                            </View>
                            <Text style={styles.faqAnswer}>{item.answer}</Text>
                        </View>
                    ))}
                </View>

                {/* App Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>App Version</Text>
                    <Text style={styles.infoValue}>1.0.0</Text>
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
    // Contact Card
    contactCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.xxl,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    contactIcon: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.md,
        backgroundColor: DarkTheme.brandYellow + '22',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    contactTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: Spacing.sm,
    },
    contactDesc: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    contactBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        backgroundColor: DarkTheme.brandYellow,
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.sm,
        borderWidth: 2,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadowSm,
    },
    contactBtnText: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.brandBlack,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // FAQ
    sectionTitle: {
        fontSize: FontSize.xl,
        fontWeight: '800',
        color: DarkTheme.brandYellow,
        marginBottom: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    faqContainer: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        marginBottom: Spacing.xxl,
    },
    faqItem: {
        padding: Spacing.lg,
    },
    faqItemBorder: {
        borderBottomWidth: 1,
        borderBottomColor: DarkTheme.separator,
    },
    faqQuestion: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    faqQuestionText: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: DarkTheme.textPrimary,
        flex: 1,
    },
    faqAnswer: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        lineHeight: 20,
        paddingLeft: 26,
    },
    // Info
    infoCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    infoLabel: {
        fontSize: FontSize.md,
        color: DarkTheme.textSecondary,
        fontWeight: '600',
    },
    infoValue: {
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '700',
    },
});
