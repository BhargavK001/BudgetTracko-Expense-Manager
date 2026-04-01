import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, BorderRadius } from '@/constants/Theme';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';

const FAQS = [
    {
        q: 'How do I add a new transaction?',
        a: 'Tap the large "+" button in the middle of the bottom navigation bar. You can add expenses by scanning a bill or entering details manually.',
    },
    {
        q: 'How does the OCR scanner work?',
        a: 'The bill scanner uses Google Vision to automatically detect the merchant name, total amount, date, and individual line items from your receipt photo.',
    },
    {
        q: 'Can I change the currency?',
        a: 'Yes! Go to Settings > General > Default Currency to choose your preferred currency symbol.',
    },
    {
        q: 'Is my financial data safe?',
        a: 'Absolutely. We encrypt all your sensitive data and never sell your information to third parties. You can also enable Biometric App Lock in the Privacy & Security settings.',
    },
    {
        q: 'How do I cancel my Premium subscription?',
        a: 'From the "More" tab, select "My Subscription". You can manage your billing details and cancel at any time there.',
    },
];

export default function HelpSupportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [openId, setOpenId] = useState<number | null>(0); // First one open by default

    const handleEmailSupport = () => {
        const email = 'support@budgettracko.com';
        const subject = 'BudgetTracko App Support';
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
    };

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Contact Card */}
                <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.contactCard}>
                    <View style={styles.contactIconWrap}>
                        <MaterialCommunityIcons name="lifebuoy" size={32} color="#06B6D4" />
                    </View>
                    <Text style={styles.contactTitle}>Need direct help?</Text>
                    <Text style={styles.contactSub}>Our support team usually replies within 24 hours.</Text>

                    <TouchableOpacity style={styles.emailBtn} onPress={handleEmailSupport} activeOpacity={0.8}>
                        <Ionicons name="mail" size={16} color="#fff" />
                        <Text style={styles.emailTxt}>Email Support</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* FAQs */}
                <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                <View style={styles.faqList}>
                    {FAQS.map((faq, idx) => {
                        const isOpen = openId === idx;
                        return (
                            <Animated.View key={idx} layout={Layout.springify().damping(18)}>
                                <Animated.View
                                    entering={FadeInDown.delay(150 + idx * 50).duration(300)}
                                    style={[styles.faqItem, isOpen && styles.faqOpenItem]}
                                >
                                    <TouchableOpacity
                                        style={styles.faqHeader}
                                        activeOpacity={0.6}
                                        onPress={() => setOpenId(isOpen ? null : idx)}
                                    >
                                        <Text style={[styles.faqQ, isOpen && { color: '#06B6D4' }]}>{faq.q}</Text>
                                        <View style={[styles.faqIcon, isOpen && styles.faqIconOpen]}>
                                            <Ionicons
                                                name="chevron-down"
                                                size={16}
                                                color={isOpen ? '#06B6D4' : DarkTheme.textMuted}
                                                style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                                            />
                                        </View>
                                    </TouchableOpacity>

                                    {isOpen && (
                                        <Animated.Text entering={FadeInDown.duration(200)} style={styles.faqA}>
                                            {faq.a}
                                        </Animated.Text>
                                    )}
                                </Animated.View>
                            </Animated.View>
                        );
                    })}
                </View>

                {/* Additional Links */}
                <Text style={styles.sectionTitle}>Legal</Text>
                <View style={styles.legalList}>
                    <TouchableOpacity style={[styles.legalBtn, styles.borderBottom]}>
                        <Text style={styles.legalTxt}>Terms of Service</Text>
                        <Ionicons name="chevron-forward" size={16} color={DarkTheme.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.legalBtn}>
                        <Text style={styles.legalTxt}>Privacy Policy</Text>
                        <Ionicons name="chevron-forward" size={16} color={DarkTheme.textMuted} />
                    </TouchableOpacity>
                </View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: DarkTheme.bg },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: DarkTheme.separator,
        backgroundColor: DarkTheme.bg, zIndex: 10,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: DarkTheme.textPrimary },

    scrollContent: { padding: Spacing.xl },

    contactCard: {
        backgroundColor: 'rgba(6, 182, 212, 0.08)',
        borderRadius: BorderRadius.xl,
        padding: 24, paddingVertical: 32,
        alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(6, 182, 212, 0.15)',
        marginBottom: 32,
    },
    contactIconWrap: {
        width: 64, height: 64, borderRadius: 24,
        backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        shadowColor: '#06B6D4', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15, shadowRadius: 16, elevation: 4,
        marginBottom: 16,
    },
    contactTitle: { fontSize: 18, fontWeight: '900', color: '#111', marginBottom: 6 },
    contactSub: { fontSize: 13, color: '#8E8E93', fontWeight: '500', textAlign: 'center', marginBottom: 20 },
    emailBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#06B6D4', paddingHorizontal: 20, paddingVertical: 14,
        borderRadius: 14, width: '100%', justifyContent: 'center',
    },
    emailTxt: { fontSize: 14, fontWeight: '800', color: '#fff' },

    sectionTitle: {
        fontSize: 12, fontWeight: '700', color: DarkTheme.textMuted,
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 12, paddingHorizontal: 4,
    },

    faqList: { marginBottom: 32 },
    faqItem: {
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1, borderColor: DarkTheme.separator,
        borderRadius: 16, marginBottom: 12, overflow: 'hidden',
    },
    faqOpenItem: {
        borderColor: 'rgba(6, 182, 212, 0.3)',
        backgroundColor: '#fff',
        ...Platform.select({
            ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12 },
            android: { elevation: 2 },
        }),
    },
    faqHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, paddingRight: 12, gap: 12,
    },
    faqQ: { flex: 1, fontSize: 14, fontWeight: '700', color: DarkTheme.textPrimary, lineHeight: 22 },
    faqIcon: {
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center',
    },
    faqIconOpen: { backgroundColor: 'rgba(6, 182, 212, 0.1)' },
    faqA: {
        fontSize: 13, color: DarkTheme.textSecondary, fontWeight: '500',
        paddingHorizontal: 16, paddingBottom: 16, paddingTop: 4,
        lineHeight: 22,
    },

    legalList: {
        backgroundColor: DarkTheme.cardBg, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: DarkTheme.border, overflow: 'hidden',
    },
    legalBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: DarkTheme.separator },
    legalTxt: { fontSize: 14, fontWeight: '600', color: DarkTheme.textPrimary },
});
