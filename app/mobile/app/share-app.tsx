import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

const WEBSITE_URL = 'https://budgettracko.vercel.app';

export default function ShareAppScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Check out BudgetTracko - the best expense manager app! 💰\n\nTrack your expenses, manage budgets, and gain financial insights.\n\nDownload now: ${WEBSITE_URL}`,
                title: 'BudgetTracko - Expense Manager',
            });
        } catch (error) {
            console.error('Share failed', error);
        }
    };

    const handleOpenWebsite = () => {
        Linking.openURL(WEBSITE_URL);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Share App</Text>
                <View style={{ width: 34 }} />
            </View>

            <View style={styles.content}>
                {/* Hero */}
                <View style={styles.heroCard}>
                    <View style={styles.heroIcon}>
                        <Ionicons name="share-social" size={40} color={DarkTheme.brandYellow} />
                    </View>
                    <Text style={styles.heroTitle}>Spread the Word!</Text>
                    <Text style={styles.heroDesc}>
                        Share BudgetTracko with friends and family. Help them take control of their finances too!
                    </Text>
                </View>

                {/* Share Button */}
                <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.8}>
                    <Ionicons name="share-outline" size={20} color={'#FFFFFF'} />
                    <Text style={styles.shareBtnText}>Share with Friends</Text>
                </TouchableOpacity>

                {/* Website Link */}
                <TouchableOpacity style={styles.websiteBtn} onPress={handleOpenWebsite} activeOpacity={0.8}>
                    <Ionicons name="globe-outline" size={20} color={DarkTheme.brandYellow} />
                    <View style={styles.websiteInfo}>
                        <Text style={styles.websiteLabel}>Visit our website</Text>
                        <Text style={styles.websiteUrl}>{WEBSITE_URL}</Text>
                    </View>
                    <Ionicons name="open-outline" size={16} color={DarkTheme.textMuted} />
                </TouchableOpacity>

                {/* Social Row */}
                <Text style={styles.socialLabel}>Follow us</Text>
                <View style={styles.socialRow}>
                    {[
                        { icon: 'logo-whatsapp' as const, color: '#25D366', url: `whatsapp://send?text=${encodeURIComponent('Check out BudgetTracko - the best expense manager app! 💰\nDownload now: ' + WEBSITE_URL)}` },
                        { icon: 'logo-github' as const, color: '#FFFFFF', url: 'https://github.com/BhargavK001/BudgetTracko-Expense-Manager' },
                        { icon: 'logo-twitter' as const, color: '#1DA1F2', url: 'https://twitter.com' },
                        { icon: 'logo-instagram' as const, color: '#E1306C', url: 'https://instagram.com' },
                    ].map((social, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.socialBtn}
                            onPress={() => Linking.openURL(social.url)}
                        >
                            <Ionicons name={social.icon} size={22} color={social.color} />
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
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
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xxl,
    },
    // Hero
    heroCard: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.xxl,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    heroIcon: {
        width: 72,
        height: 72,
        borderRadius: BorderRadius.lg,
        backgroundColor: DarkTheme.brandYellow + '15',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    heroTitle: {
        fontSize: FontSize.xxl,
        fontWeight: '900',
        color: DarkTheme.textPrimary,
        marginBottom: Spacing.sm,
    },
    heroDesc: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    // Share button
    shareBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        backgroundColor: DarkTheme.accent,
        paddingVertical: Spacing.lg,
        borderRadius: BorderRadius.sm,
        borderWidth: 2.5,
        borderColor: 'transparent',
        marginBottom: Spacing.lg,
        ...NeoShadowSm,
    },
    shareBtnText: {
        fontSize: FontSize.md,
        fontWeight: '900',
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    // Website
    websiteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        backgroundColor: DarkTheme.cardBg,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        marginBottom: Spacing.xxl,
    },
    websiteInfo: {
        flex: 1,
    },
    websiteLabel: {
        fontSize: FontSize.md,
        fontWeight: '700',
        color: DarkTheme.textPrimary,
    },
    websiteUrl: {
        fontSize: FontSize.xs,
        color: DarkTheme.brandYellow,
        marginTop: 2,
    },
    // Social
    socialLabel: {
        fontSize: FontSize.xs,
        fontWeight: '800',
        color: DarkTheme.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        textAlign: 'center',
    },
    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.lg,
    },
    socialBtn: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

