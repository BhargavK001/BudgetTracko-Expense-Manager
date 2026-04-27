import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp, ZoomIn, Layout } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useThemeStyles } from '@/components/more/DesignSystem';
import { useSettings } from '@/context/SettingsContext';
import { Spacing, BorderRadius } from '@/constants/Theme';

const FAQS = [
    {
        q: 'How do I add a new transaction?',
        a: 'Tap the large "+" button in the middle of the bottom navigation bar. You can add expenses by scanning a bill or entering details manually.',
    },
    {
        q: 'How does the OCR scanner work?',
        a: 'The bill scanner uses advanced vision tech to automatically detect the merchant name, total amount, date, and individual line items from your receipt photo.',
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
    const { tokens } = useThemeStyles();
    const { isDarkMode } = useSettings();
    const [openId, setOpenId] = useState<number | null>(0); // First one open by default

    const handleEmailSupport = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        const email = 'support@budgettracko.com';
        const subject = 'BudgetTracko App Support';
        Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
    };

    const toggleFaq = (idx: number) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setOpenId(openId === idx ? null : idx);
    };

    return (
        <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            
            {/* Minimal Header */}
            <Animated.View entering={FadeInDown.delay(50).duration(300)} style={[styles.header, { backgroundColor: tokens.bgPrimary }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Help & Support</Text>
                <View style={{ width: 44 }} />
            </Animated.View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Hero / Contact Section */}
                <Animated.View entering={ZoomIn.delay(100).duration(400).springify()}>
                    <LinearGradient
                        colors={isDarkMode ? ['#1A1C20', '#0F1014'] : ['#111111', '#2D2D2D']}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.heroCard}
                    >
                        <View style={styles.contactIconWrap}>
                            <MaterialCommunityIcons name="lifebuoy" size={32} color="#111" />
                        </View>
                        <Text style={styles.heroTitle}>Need Direct Help?</Text>
                        <Text style={styles.heroDesc}>
                            Our support team usually replies within 24 hours. We are here to help you.
                        </Text>
                        <TouchableOpacity style={styles.emailBtn} onPress={handleEmailSupport} activeOpacity={0.8}>
                            <Ionicons name="mail" size={16} color="#111" />
                            <Text style={styles.emailTxt}>Email Support Team</Text>
                        </TouchableOpacity>
                    </LinearGradient>
                </Animated.View>

                {/* FAQs */}
                <Animated.View entering={FadeInUp.delay(200).duration(400)}>
                    <Text style={[styles.sectionLabel, { color: tokens.textMuted }]}>Frequently Asked Questions</Text>
                    <View style={styles.faqList}>
                        {FAQS.map((faq, idx) => {
                            const isOpen = openId === idx;
                            return (
                                <Animated.View key={idx} layout={Layout.springify().damping(18)}>
                                    <View style={[
                                        styles.faqItem, 
                                        { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle },
                                        isOpen && { borderColor: 'rgba(6, 182, 212, 0.3)' }
                                    ]}>
                                        <TouchableOpacity
                                            style={styles.faqHeader}
                                            activeOpacity={0.6}
                                            onPress={() => toggleFaq(idx)}
                                        >
                                            <Text style={[styles.faqQ, { color: tokens.textPrimary }, isOpen && { color: '#06B6D4' }]}>{faq.q}</Text>
                                            <View style={[styles.faqIcon, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F7' }, isOpen && styles.faqIconOpen]}>
                                                <Ionicons
                                                    name="chevron-down"
                                                    size={16}
                                                    color={isOpen ? '#06B6D4' : tokens.textMuted}
                                                    style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}
                                                />
                                            </View>
                                        </TouchableOpacity>

                                        {isOpen && (
                                            <Animated.Text entering={FadeInDown.duration(200)} style={[styles.faqA, { color: tokens.textMuted }]}>
                                                {faq.a}
                                            </Animated.Text>
                                        )}
                                    </View>
                                </Animated.View>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Legal Links */}
                <Animated.View entering={FadeInUp.delay(300).duration(400)}>
                    <Text style={[styles.sectionLabel, { color: tokens.textMuted }]}>Legal</Text>
                    <View style={[styles.legalList, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                        <TouchableOpacity 
                            style={[styles.legalBtn, { borderBottomWidth: 1, borderBottomColor: tokens.borderSubtle }]} 
                            onPress={() => router.push('/privacy-security')} 
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.legalTxt, { color: tokens.textPrimary }]}>Privacy Policy</Text>
                            <Ionicons name="open-outline" size={16} color={tokens.textMuted} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.legalBtn} activeOpacity={0.7}>
                            <Text style={[styles.legalTxt, { color: tokens.textPrimary }]}>Terms & Conditions</Text>
                            <Ionicons name="open-outline" size={16} color={tokens.textMuted} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={{ height: 60 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 16,
        zIndex: 10,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 18, fontWeight: '800' },

    scrollContent: { padding: 24, paddingTop: 10 },

    heroCard: {
        borderRadius: 24, padding: 28, marginBottom: 32,
        shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1, shadowRadius: 24, elevation: 6,
        alignItems: 'center',
    },
    contactIconWrap: {
        width: 64, height: 64, borderRadius: 20, backgroundColor: '#fff',
        justifyContent: 'center', alignItems: 'center',
        marginBottom: 16,
    },
    heroTitle: { fontSize: 20, fontWeight: '900', color: '#fff', marginBottom: 8 },
    heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 20, textAlign: 'center', marginBottom: 24 },
    emailBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 8,
        backgroundColor: '#fff', paddingHorizontal: 20, paddingVertical: 14,
        borderRadius: 16, width: '100%', justifyContent: 'center',
    },
    emailTxt: { fontSize: 14, fontWeight: '800', color: '#111' },

    sectionLabel: {
        fontSize: 12, fontWeight: '800',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 10, marginLeft: 8,
    },

    faqList: { marginBottom: 32 },
    faqItem: {
        borderWidth: 1,
        borderRadius: 20, marginBottom: 16, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    },
    faqHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        padding: 16, gap: 12,
    },
    faqQ: { flex: 1, fontSize: 14, fontWeight: '700', lineHeight: 22 },
    faqIcon: {
        width: 32, height: 32, borderRadius: 16,
        justifyContent: 'center', alignItems: 'center',
    },
    faqIconOpen: { backgroundColor: 'rgba(6, 182, 212, 0.08)' },
    faqA: {
        fontSize: 13, fontWeight: '500',
        paddingHorizontal: 16, paddingBottom: 20, paddingTop: 0,
        lineHeight: 22,
    },

    legalList: {
        borderRadius: 20,
        borderWidth: 1, overflow: 'hidden',
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03, shadowRadius: 8, elevation: 1,
    },
    legalBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
    legalTxt: { fontSize: 14, fontWeight: '700' },
});
