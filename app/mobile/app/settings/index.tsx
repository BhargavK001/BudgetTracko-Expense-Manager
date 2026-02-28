import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [darkMode, setDarkMode] = React.useState(true);
    const [biometrics, setBiometrics] = React.useState(false);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* General Settings */}
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.settingsGroup}>
                    <SettingItem
                        icon="cash-outline"
                        label="Currency"
                        value="INR (₹)"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="calendar-outline"
                        label="First Day of Week"
                        value="Monday"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="language-outline"
                        label="Language"
                        value="English"
                        onPress={() => { }}
                    />
                </View>

                {/* Preferences */}
                <Text style={styles.sectionTitle}>Preferences</Text>
                <View style={styles.settingsGroup}>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: '#7C4DFF22' }]}>
                                <Ionicons name="moon-outline" size={18} color="#7C4DFF" />
                            </View>
                            <Text style={styles.settingLabel}>Dark Mode</Text>
                        </View>
                        <Switch
                            value={darkMode}
                            onValueChange={setDarkMode}
                            trackColor={{ false: '#333', true: DarkTheme.brandYellow }}
                            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                    <View style={styles.settingRow}>
                        <View style={styles.settingLeft}>
                            <View style={[styles.settingIcon, { backgroundColor: '#4CAF5022' }]}>
                                <Ionicons name="finger-print-outline" size={18} color="#4CAF50" />
                            </View>
                            <Text style={styles.settingLabel}>Biometric Lock</Text>
                        </View>
                        <Switch
                            value={biometrics}
                            onValueChange={setBiometrics}
                            trackColor={{ false: '#333', true: DarkTheme.brandYellow }}
                            thumbColor={biometrics ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Notifications */}
                <Text style={styles.sectionTitle}>Notifications</Text>
                <View style={styles.settingsGroup}>
                    <SettingItem
                        icon="notifications-outline"
                        label="Reminders"
                        onPress={() => router.push('/settings/reminders')}
                    />
                </View>

                {/* Data */}
                <Text style={styles.sectionTitle}>Data Management</Text>
                <View style={styles.settingsGroup}>
                    <SettingItem
                        icon="cloud-upload-outline"
                        label="Backup Data"
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="trash-outline"
                        label="Clear All Data"
                        color={DarkTheme.spending}
                        onPress={() => { }}
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </View>
    );
}

function SettingItem({ icon, label, value, onPress, color }: {
    icon: string;
    label: string;
    value?: string;
    onPress: () => void;
    color?: string;
}) {
    return (
        <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: (color || DarkTheme.textSecondary) + '22' }]}>
                    <Ionicons name={icon as any} size={18} color={color || DarkTheme.textSecondary} />
                </View>
                <Text style={[styles.settingLabel, color ? { color } : {}]}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color={DarkTheme.chevron} />
            </View>
        </TouchableOpacity>
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
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.brandYellow,
        marginBottom: Spacing.md,
        marginTop: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    settingsGroup: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        overflow: 'hidden',
        marginBottom: Spacing.lg,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: DarkTheme.separator,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    settingIcon: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '600',
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    settingValue: {
        fontSize: FontSize.sm,
        color: DarkTheme.textSecondary,
        fontWeight: '500',
    },
});
