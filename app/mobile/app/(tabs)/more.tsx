import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MenuItem = {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    color: string;
    route?: string;
};

const MENU_ITEMS: MenuItem[] = [
    { icon: 'person-outline', label: 'Profile', color: '#2196F3', route: '/profile' },
    { icon: 'settings-outline', label: 'Settings', color: '#9E9E9E', route: '/settings' },
    { icon: 'notifications-outline', label: 'Reminders', color: '#FF9800', route: '/settings/reminders' },
    { icon: 'download-outline', label: 'Export Data', color: '#4CAF50' },
    { icon: 'shield-checkmark-outline', label: 'Privacy & Security', color: '#7C4DFF', route: '/privacy-security' },
    { icon: 'help-circle-outline', label: 'Help & Support', color: '#00BCD4', route: '/help-support' },
    { icon: 'star-outline', label: 'Rate Us', color: '#FFD700' },
    { icon: 'share-social-outline', label: 'Share App', color: '#E91E63', route: '/share-app' },
];

export default function MoreScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();

    const handleMenuPress = (item: MenuItem) => {
        if (item.route) {
            router.push(item.route as any);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Log Out',
            'Are you sure you want to log out? Your locally saved data will be cleared.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Log Out',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.clear();
                            router.replace('/welcome');
                        } catch (e) {
                            console.error('Logout failed', e);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Sticky Header ─── */}
            <View style={styles.stickyHeader}>
                <Text style={styles.title}>More</Text>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* User Card */}
                <View style={styles.userCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={24} color={DarkTheme.brandYellow} />
                    </View>
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>BudgetTracko User</Text>
                        <Text style={styles.userEmail}>Local Mode</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={DarkTheme.chevron} />
                </View>

                {/* Premium Banner */}
                <TouchableOpacity
                    style={styles.premiumBanner}
                    onPress={() => router.push('/premium' as any)}
                    activeOpacity={0.8}
                >
                    <View style={styles.premiumLeft}>
                        <View style={styles.premiumIcon}>
                            <Ionicons name="diamond" size={20} color={DarkTheme.brandYellow} />
                        </View>
                        <View>
                            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
                            <Text style={styles.premiumDesc}>Unlock all features & analytics</Text>
                        </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={DarkTheme.brandYellow} />
                </TouchableOpacity>

                {/* Menu Items */}
                <View style={styles.menuContainer}>
                    {MENU_ITEMS.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.menuItem}
                            activeOpacity={0.7}
                            onPress={() => handleMenuPress(item)}
                        >
                            <View style={[styles.menuIcon, { backgroundColor: item.color + '22' }]}>
                                <Ionicons name={item.icon} size={18} color={item.color} />
                            </View>
                            <Text style={styles.menuLabel}>{item.label}</Text>
                            <Ionicons name="chevron-forward" size={16} color={DarkTheme.chevron} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Logout */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
                    <Ionicons name="log-out-outline" size={18} color={DarkTheme.spending} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>BudgetTracko v1.0.0</Text>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DarkTheme.bg,
    },
    // Sticky Header
    stickyHeader: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        backgroundColor: DarkTheme.bg,
        borderBottomWidth: 2,
        borderBottomColor: DarkTheme.neoBorder,
        zIndex: 10,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
    },
    // User Card
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBgElevated,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
        borderWidth: 2,
        borderColor: DarkTheme.brandYellow,
        ...NeoShadowSm,
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: FontSize.lg,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
    userEmail: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        marginTop: 2,
    },
    // Premium Banner
    premiumBanner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1A1708',
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        marginBottom: Spacing.xxl,
        borderWidth: 2,
        borderColor: DarkTheme.brandYellow + '44',
    },
    premiumLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    premiumIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.brandYellow + '22',
        justifyContent: 'center',
        alignItems: 'center',
    },
    premiumTitle: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: DarkTheme.brandYellow,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    premiumDesc: {
        fontSize: FontSize.xs,
        color: DarkTheme.textSecondary,
        marginTop: 2,
    },
    // Menu
    menuContainer: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        overflow: 'hidden',
        marginBottom: Spacing.xxl,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: DarkTheme.separator,
    },
    menuIcon: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    menuLabel: {
        flex: 1,
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '600',
    },
    // Logout
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        padding: Spacing.lg,
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        borderWidth: 2,
        borderColor: DarkTheme.spending + '44',
    },
    logoutText: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.spending,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // Version
    version: {
        fontSize: FontSize.xs,
        color: DarkTheme.textMuted,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        fontWeight: '600',
    },
});
