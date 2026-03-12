import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, UIManager, Platform, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

const FAQS = [
    {
        id: '1',
        q: 'How do I reset my data?',
        a: 'You can reset all your data by going to Settings > Data Management > Clear All Data. Please note this action is irreversible.'
    },
    {
        id: '2',
        q: 'Can I export my transactions?',
        a: 'Yes! Navigate to the "More" tab, and under "Data", you can choose to export your transactions as a CSV or JSON file.'
    },
    {
        id: '3',
        q: 'How does the budgeting work?',
        a: 'When you create a budget in the Finance section, the app automatically tracks your expenses against it based on the assigned category.'
    },
    {
        id: '4',
        q: 'Is my financial data secure?',
        a: 'We prioritize your privacy. Your data is stored locally on your device by default. If you use cloud sync, it is end-to-end encrypted.'
    }
];

export default function HelpSupportScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Help & Support</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
                    <View style={styles.contactCard}>
                        <View style={styles.contactIconWrap}>
                            <Ionicons name="mail" size={28} color="#6366F1" />
                        </View>
                        <View style={styles.contactInfo}>
                            <Text style={styles.contactTitle}>Contact Support</Text>
                            <Text style={styles.contactDesc}>We usually respond within 24 hours.</Text>
                            <TouchableOpacity style={styles.emailBtn} activeOpacity={0.8} onPress={() => Linking.openURL('mailto:support@budgettracko.com?subject=Support%20Request')}>
                                <Text style={styles.emailText}>support@budgettracko.com</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                    <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

                    <View style={styles.faqList}>
                        {FAQS.map((faq, index) => {
                            const isExpanded = expandedId === faq.id;
                            return (
                                <Animated.View key={faq.id} entering={FadeInDown.delay(200 + index * 50).duration(400).springify()}>
                                    <TouchableOpacity
                                        style={[styles.faqItem, isExpanded && styles.faqItemActive]}
                                        onPress={() => toggleExpand(faq.id)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.faqHeader}>
                                            <Text style={styles.faqQ}>{faq.q}</Text>
                                            <Ionicons
                                                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                size={20}
                                                color="#8E8E93"
                                            />
                                        </View>
                                        {isExpanded && (
                                            <Text style={styles.faqA}>{faq.a}</Text>
                                        )}
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>
                </Animated.View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },
    contactCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 24,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
        marginBottom: 32,
    },
    contactIconWrap: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: 'rgba(99,102,241,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    contactInfo: {
        flex: 1,
    },
    contactTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: '#111',
        marginBottom: 4,
    },
    contactDesc: {
        fontSize: 14,
        color: '#8E8E93',
        marginBottom: 12,
    },
    emailBtn: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    emailText: {
        fontSize: 13,
        fontWeight: '800',
        color: '#6366F1',
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: '#8E8E93',
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        marginBottom: 16,
        paddingHorizontal: 4,
    },
    faqList: {
        gap: 12,
    },
    faqItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
        elevation: 1,
    },
    faqItemActive: {
        borderColor: 'rgba(99,102,241,0.3)',
    },
    faqHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    faqQ: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111',
        flex: 1,
        paddingRight: 16,
    },
    faqA: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 12,
        lineHeight: 22,
    },
});
