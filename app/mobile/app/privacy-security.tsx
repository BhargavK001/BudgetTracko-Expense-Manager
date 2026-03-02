import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function PrivacySecurityScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 24;

    const sections = [
        {
            id: 'data-collection',
            title: 'Data Collection & Usage',
            icon: 'server-outline',
            color: '#3B82F6',
            content: 'We only collect essential data required to provide you with our core services. This includes your transaction history, account details, and app preferences. We never sell your personal data to third parties.'
        },
        {
            id: 'storage',
            title: 'Local & Cloud Storage',
            icon: 'cloud-done-outline',
            color: '#10B981',
            content: 'Your financial data is primarily stored locally on your device for maximum privacy. If you enable Cloud Sync, your data is securely encrypted before being transmitted and stored on our servers.'
        },
        {
            id: 'permissions',
            title: 'App Permissions',
            icon: 'key-outline',
            color: '#F59E0B',
            content: 'BudgetTracko may request access to notifications (for reminders), camera (for receipts), and biometric hardware (for app lock). You can manage these permissions at any time in your device settings.'
        },
        {
            id: 'rights',
            title: 'Your Data Rights',
            icon: 'shield-checkmark-outline',
            color: '#8B5CF6',
            content: 'You have the right to request a copy of all your data (Export Data) or request complete deletion of your account and associated data (Delete Account) at any time from the app settings.'
        }
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <Animated.View entering={FadeIn.delay(50).duration(300)} style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: insets.bottom + 40,
                    }
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.contentInner, isTablet && styles.contentInnerTablet]}>

                    <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
                        <View style={styles.heroSection}>
                            <View style={styles.heroIconWrap}>
                                <Ionicons name="lock-closed" size={32} color="#2DCA72" />
                            </View>
                            <Text style={styles.heroTitle}>Your Privacy Matters</Text>
                            <Text style={styles.heroDesc}>
                                We are committed to protecting your personal information and your right to privacy.
                            </Text>
                        </View>
                    </Animated.View>

                    <Text style={styles.lastUpdated}>Last Updated: October 2023</Text>

                    <View style={styles.sectionsContainer}>
                        {sections.map((section, index) => (
                            <Animated.View
                                key={section.id}
                                entering={FadeInDown.delay(150 + index * 100).duration(400).springify()}
                                style={styles.sectionCard}
                            >
                                <View style={styles.sectionHeader}>
                                    <View style={[styles.iconWrap, { backgroundColor: section.color + '15' }]}>
                                        <Ionicons name={section.icon as any} size={20} color={section.color} />
                                    </View>
                                    <Text style={styles.sectionTitle}>{section.title}</Text>
                                </View>
                                <Text style={styles.sectionContent}>{section.content}</Text>
                            </Animated.View>
                        ))}
                    </View>

                    <Animated.View entering={FadeInDown.delay(600).duration(400)}>
                        <TouchableOpacity style={styles.contactBtn} activeOpacity={0.8}>
                            <Text style={styles.contactBtnText}>Contact Privacy Team</Text>
                        </TouchableOpacity>
                    </Animated.View>

                </View>
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
        paddingTop: 16,
    },
    contentInner: {
        width: '100%',
    },
    contentInnerTablet: {
        maxWidth: 760,
        alignSelf: 'center',
    },
    heroSection: {
        alignItems: 'center',
        marginBottom: 32,
        paddingHorizontal: 16,
    },
    heroIconWrap: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: 'rgba(45,202,114,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(45,202,114,0.2)',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: '#111',
        marginBottom: 8,
        textAlign: 'center',
    },
    heroDesc: {
        fontSize: 15,
        color: '#8E8E93',
        textAlign: 'center',
        lineHeight: 22,
    },
    lastUpdated: {
        fontSize: 13,
        fontWeight: '600',
        color: '#C7C7CC',
        textAlign: 'center',
        marginBottom: 24,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionsContainer: {
        gap: 16,
        marginBottom: 32,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#111',
        flex: 1,
    },
    sectionContent: {
        fontSize: 14,
        color: '#8E8E93',
        lineHeight: 22,
    },
    contactBtn: {
        backgroundColor: '#F5F5F5',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
    },
    contactBtnText: {
        fontSize: 15,
        fontWeight: '800',
        color: '#111',
    },
});
