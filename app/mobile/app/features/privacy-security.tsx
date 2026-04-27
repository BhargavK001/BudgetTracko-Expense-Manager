import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, BorderRadius } from '@/constants/Theme';
import { useSecurity } from '@/context/SecurityContext';
import { useThemeStyles } from '@/components/more/DesignSystem';
import { useSettings } from '@/context/SettingsContext';

export default function PrivacySecurityScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isAppLockEnabled, setAppLockEnabled } = useSecurity();
    const { tokens } = useThemeStyles();
    const { isDarkMode } = useSettings();

    const renderSettingRow = (
        icon: any,
        title: string,
        subtitle: string,
        rightElement: React.ReactNode,
        isLast = false
    ) => (
        <View style={[styles.settingRow, !isLast && { borderBottomWidth: 1, borderBottomColor: tokens.borderSubtle }]}>
            <View style={[styles.iconWrap, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F7' }]}>
                <Ionicons name={icon} size={20} color={tokens.textPrimary} />
            </View>
            <View style={styles.textWrap}>
                <Text style={[styles.settingTitle, { color: tokens.textPrimary }]}>{title}</Text>
                <Text style={[styles.settingSub, { color: tokens.textMuted }]}>{subtitle}</Text>
            </View>
            <View style={styles.rightContent}>
                {rightElement}
            </View>
        </View>
    );

    return (
        <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            {/* Header */}
            <View style={[styles.header, { backgroundColor: tokens.bgPrimary, borderBottomColor: tokens.borderSubtle }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Privacy & Security</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>App Protection</Text>
                <View style={[styles.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                    {renderSettingRow(
                        'finger-print-outline',
                        'App Lock',
                        'Require Face ID / Touch ID to open the app',
                        <Switch
                            value={isAppLockEnabled}
                            onValueChange={setAppLockEnabled}
                            trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#06B6D4' }}
                            thumbColor="#fff"
                        />,
                        true
                    )}
                </View>

                <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>Data Privacy</Text>
                <View style={[styles.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                    {renderSettingRow(
                        'share-social-outline',
                        'Analytics Sharing',
                        'Share anonymous usage data to help us improve.',
                        <Switch
                            value={false}
                            onValueChange={() => { }}
                            trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                            thumbColor="#fff"
                        />,
                        false
                    )}
                    {renderSettingRow(
                        'cloud-offline-outline',
                        'Offline Mode',
                        'Force app to only save data locally.',
                        <Switch
                            value={false}
                            onValueChange={() => { }}
                            trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                            thumbColor="#fff"
                        />,
                        true
                    )}
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: 14,
        borderBottomWidth: 1, zIndex: 10,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 17, fontWeight: '800' },

    scrollContent: { padding: Spacing.xl, paddingBottom: 60 },

    sectionTitle: {
        fontSize: 12, fontWeight: '700',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 8, paddingHorizontal: 4, marginTop: 10,
    },
    card: {
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        marginBottom: Spacing.xl, overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
    },
    iconWrap: {
        width: 38, height: 38, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    textWrap: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    settingSub: { fontSize: 11, fontWeight: '500' },
    rightContent: { alignItems: 'flex-end', minWidth: 40 },
});
