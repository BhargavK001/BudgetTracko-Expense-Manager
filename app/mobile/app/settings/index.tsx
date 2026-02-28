import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? Spacing.xxxl : isCompact ? Spacing.md : Spacing.lg;

    const [darkMode, setDarkMode] = React.useState(true);
    const [biometrics, setBiometrics] = React.useState(false);

    const generalSettings = [
        { icon: 'cash-outline', label: 'Currency', value: 'INR (₹)' },
        { icon: 'calendar-outline', label: 'First Day of Week', value: 'Monday' },
        { icon: 'language-outline', label: 'Language', value: 'English' },
    ];

    const dataSettings = [
        { icon: 'cloud-upload-outline', label: 'Backup Data' },
        { icon: 'trash-outline', label: 'Clear All Data', color: DarkTheme.spending },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: horizontalPadding,
                        paddingBottom: insets.bottom + 36,
                    },
                ]}
                showsVerticalScrollIndicator={false}
            >
                <View style={[styles.contentInner, isTablet && styles.contentInnerTablet]}>
                    <LinearGradient
                        colors={['#1E2D6B', '#0D1630', '#060D1F']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.topCard, isCompact && styles.topCardCompact]}
                    >
                        <View style={styles.topCardIconWrap}>
                            <Ionicons name="settings-outline" size={18} color={DarkTheme.textAccent} />
                        </View>
                        <View style={styles.topCardTextWrap}>
                            <Text style={styles.topCardTitle}>Preferences & Security</Text>
                            <Text style={styles.topCardDesc}>Manage app behavior, reminders, and data controls.</Text>
                        </View>
                    </LinearGradient>

                    <Text style={styles.sectionTitle}>General</Text>
                    <View style={styles.settingsGroup}>
                        {generalSettings.map((item, index) => (
                            <SettingItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                value={item.value}
                                onPress={() => { }}
                                isLast={index === generalSettings.length - 1}
                            />
                        ))}
                    </View>

                    <Text style={styles.sectionTitle}>Preferences</Text>
                    <View style={styles.settingsGroup}>
                        <ToggleSettingRow
                            icon="moon-outline"
                            iconColor="#7C4DFF"
                            iconTint="#7C4DFF22"
                            label="Dark Mode"
                            value={darkMode}
                            onValueChange={setDarkMode}
                        />
                        <ToggleSettingRow
                            icon="finger-print-outline"
                            iconColor="#4CAF50"
                            iconTint="#4CAF5022"
                            label="Biometric Lock"
                            value={biometrics}
                            onValueChange={setBiometrics}
                            isLast
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Notifications</Text>
                    <View style={styles.settingsGroup}>
                        <SettingItem
                            icon="notifications-outline"
                            label="Reminders"
                            onPress={() => router.push('/settings/reminders')}
                            isLast
                        />
                    </View>

                    <Text style={styles.sectionTitle}>Data Management</Text>
                    <View style={styles.settingsGroup}>
                        {dataSettings.map((item, index) => (
                            <SettingItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                color={item.color}
                                onPress={() => { }}
                                isLast={index === dataSettings.length - 1}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

function SettingItem({ icon, label, value, onPress, color, isLast }: {
    icon: string;
    label: string;
    value?: string;
    onPress: () => void;
    color?: string;
    isLast?: boolean;
}) {
    return (
        <TouchableOpacity style={[styles.settingRow, isLast && styles.settingRowLast]} onPress={onPress} activeOpacity={0.7}>
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

function ToggleSettingRow({
    icon,
    iconColor,
    iconTint,
    label,
    value,
    onValueChange,
    isLast,
}: {
    icon: string;
    iconColor: string;
    iconTint: string;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    isLast?: boolean;
}) {
    return (
        <View style={[styles.settingRow, isLast && styles.settingRowLast]}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: iconTint }]}>
                    <Ionicons name={icon as any} size={18} color={iconColor} />
                </View>
                <Text style={styles.settingLabel}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#334155', true: DarkTheme.accent }}
                thumbColor={value ? '#FFFFFF' : '#e2e8f0'}
            />
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
        paddingVertical: Spacing.md,
    },
    backBtn: {
        width: 34,
        height: 34,
        borderRadius: BorderRadius.sm,
        backgroundColor: DarkTheme.cardBg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
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
        paddingTop: Spacing.sm,
    },
    contentInner: {
        width: '100%',
    },
    contentInnerTablet: {
        maxWidth: 760,
        alignSelf: 'center',
    },
    topCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        marginBottom: Spacing.xl,
        borderWidth: 1,
        borderColor: DarkTheme.borderLight,
        ...NeoShadowSm,
    },
    topCardCompact: {
        padding: Spacing.md,
    },
    topCardIconWrap: {
        width: 42,
        height: 42,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(99,102,241,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(165,180,252,0.32)',
    },
    topCardTextWrap: {
        flex: 1,
    },
    topCardTitle: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    topCardDesc: {
        fontSize: FontSize.xs,
        color: DarkTheme.textSecondary,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: '800',
        color: DarkTheme.textMuted,
        marginBottom: Spacing.md,
        marginTop: Spacing.md,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: 2,
    },
    settingsGroup: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: DarkTheme.border,
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
    settingRowLast: {
        borderBottomWidth: 0,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
        flex: 1,
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
        flexShrink: 1,
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
