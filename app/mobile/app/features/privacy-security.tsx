import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, BorderRadius } from '@/constants/Theme';
import { useSecurity } from '@/context/SecurityContext';

export default function PrivacySecurityScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isAppLockEnabled, setAppLockEnabled } = useSecurity();

    const renderSettingRow = (
        icon: any,
        title: string,
        subtitle: string,
        rightElement: React.ReactNode,
        isLast = false
    ) => (
        <View style={[styles.settingRow, !isLast && styles.borderBottom]}>
            <View style={styles.iconWrap}>
                <Ionicons name={icon} size={20} color={DarkTheme.textPrimary} />
            </View>
            <View style={styles.textWrap}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingSub}>{subtitle}</Text>
            </View>
            <View style={styles.rightContent}>
                {rightElement}
            </View>
        </View>
    );

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <Text style={styles.sectionTitle}>App Protection</Text>
                <View style={styles.card}>
                    {renderSettingRow(
                        'finger-print-outline',
                        'App Lock',
                        'Require Face ID / Touch ID to open the app',
                        <Switch
                            value={isAppLockEnabled}
                            onValueChange={setAppLockEnabled}
                            trackColor={{ false: '#E5E5EA', true: '#06B6D4' }}
                            thumbColor="#fff"
                        />,
                        true
                    )}
                </View>

                <Text style={styles.sectionTitle}>Data Privacy</Text>
                <View style={styles.card}>
                    {renderSettingRow(
                        'share-social-outline',
                        'Analytics Sharing',
                        'Share anonymous usage data to help us improve.',
                        <Switch
                            value={false}
                            onValueChange={() => { }}
                            trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
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
                            trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
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
    root: { flex: 1, backgroundColor: DarkTheme.bg },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: DarkTheme.separator,
        backgroundColor: DarkTheme.bg, zIndex: 10,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: DarkTheme.textPrimary },

    scrollContent: { padding: Spacing.xl, paddingBottom: 60 },

    sectionTitle: {
        fontSize: 12, fontWeight: '700', color: DarkTheme.textMuted,
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 8, paddingHorizontal: 4, marginTop: 10,
    },
    card: {
        backgroundColor: DarkTheme.cardBg, borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: DarkTheme.border,
        marginBottom: Spacing.xl, overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
    },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: DarkTheme.separator },
    iconWrap: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: DarkTheme.bg,
        justifyContent: 'center', alignItems: 'center',
    },
    textWrap: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '700', color: DarkTheme.textPrimary, marginBottom: 2 },
    settingSub: { fontSize: 11, fontWeight: '500', color: DarkTheme.textMuted },
    rightContent: { alignItems: 'flex-end', minWidth: 40 },
});
