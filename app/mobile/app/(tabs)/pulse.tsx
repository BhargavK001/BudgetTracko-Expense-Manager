import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadow } from '@/constants/Theme';

export default function PulseHubScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View style={styles.iconBadge}>
                    <Ionicons name="flash" size={24} color={DarkTheme.brandBlack} />
                </View>
                <View>
                    <Text style={styles.title}>Tracko Pulse</Text>
                    <Text style={styles.subtitle}>AI Financial Coach</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.heroSection}>
                    <Text style={styles.heroTitle}>Choose Your Vibe</Text>
                    <Text style={styles.heroDesc}>
                        Do you want to chat directly with Tracko about a specific purchase, or get a brutally honest breakdown of your entire month?
                    </Text>
                </View>

                <View style={styles.grid}>
                    {/* Chat Card */}
                    <TouchableOpacity
                        style={[styles.card, styles.chatCard]}
                        activeOpacity={0.8}
                        onPress={() => router.push('/features/ask-tracko')}
                    >
                        <View style={styles.cardAccent} />
                        <View style={[styles.cardIconBox, { backgroundColor: '#E3F2FD', borderColor: '#2196F3' }]}>
                            <Ionicons name="chatbubbles" size={32} color="#2196F3" />
                        </View>
                        <Text style={styles.cardTitle}>Chat with Bot</Text>
                        <Text style={styles.cardDesc}>
                            Ask if you can afford that Zomato order or stream advice on your remaining budget.
                        </Text>
                        <View style={styles.cardFooter}>
                            <Text style={[styles.footerText, { color: '#2196F3' }]}>Enter Chat</Text>
                            <Ionicons name="arrow-forward-circle" size={20} color="#2196F3" />
                        </View>
                    </TouchableOpacity>

                    {/* Analysis Card */}
                    <TouchableOpacity
                        style={[styles.card, styles.pulseCard]}
                        activeOpacity={0.8}
                        onPress={() => router.push('/features/analysis')}
                    >
                        <View style={[styles.cardAccent, { backgroundColor: DarkTheme.brandYellow }]} />
                        <View style={[styles.cardIconBox, { backgroundColor: '#FFF9C4', borderColor: DarkTheme.brandYellow }]}>
                            <Ionicons name="bar-chart" size={32} color={DarkTheme.brandYellow} />
                        </View>
                        <Text style={styles.cardTitle}>Monthly Deep-Dive</Text>
                        <Text style={styles.cardDesc}>
                            Get roasted, praised, and find a side-hustle. A full breakdown of this month's finances.
                        </Text>
                        <View style={styles.cardFooter}>
                            <Text style={styles.footerText}>Generate AI Pulse</Text>
                            <Ionicons name="arrow-forward-circle" size={20} color={DarkTheme.brandYellow} />
                        </View>
                    </TouchableOpacity>
                </View>
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
        alignItems: 'center',
        gap: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.lg,
        borderBottomWidth: 2,
        borderBottomColor: DarkTheme.neoBorder,
    },
    iconBadge: {
        width: 44,
        height: 44,
        backgroundColor: DarkTheme.brandYellow,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadow,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: DarkTheme.textMuted,
        textTransform: 'uppercase',
    },
    scrollContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
    },
    heroSection: {
        alignItems: 'center',
        marginVertical: Spacing.xl,
        paddingHorizontal: Spacing.md,
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        textTransform: 'uppercase',
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    heroDesc: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
    },
    grid: {
        gap: Spacing.xl,
    },
    card: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.xl,
        borderWidth: 4,
        borderColor: DarkTheme.brandBlack,
        ...NeoShadow,
        position: 'relative',
        overflow: 'hidden',
    },
    chatCard: {
        // blue theme
    },
    pulseCard: {
        // yellow theme
    },
    cardAccent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        backgroundColor: '#42A5F5',
    },
    cardIconBox: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        marginBottom: Spacing.md,
        alignSelf: 'center',
    },
    cardTitle: {
        fontSize: FontSize.xl,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        textTransform: 'uppercase',
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    cardDesc: {
        fontSize: FontSize.sm,
        fontWeight: '700',
        color: DarkTheme.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: Spacing.lg,
    },
    cardFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    footerText: {
        fontSize: FontSize.md,
        fontWeight: '900',
        textTransform: 'uppercase',
        color: DarkTheme.brandYellow,
    },
});
