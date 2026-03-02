import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useWindowDimensions, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 24;

    const [darkMode, setDarkMode] = React.useState(false);
    const [biometrics, setBiometrics] = React.useState(false);

    const generalSettings = [
        { icon: 'cash-outline', label: 'Currency', value: 'INR (₹)' },
        { icon: 'calendar-outline', label: 'First Day of Week', value: 'Monday' },
        { icon: 'language-outline', label: 'Language', value: 'English' },
    ];

    const dataSettings = [
        { icon: 'cloud-upload-outline', label: 'Backup Data' },
        { icon: 'trash-outline', label: 'Clear All Data', color: '#F43F5E' },
    ];

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />
            <Animated.View entering={FadeIn.delay(50).duration(300)} style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

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
                    <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
                        <LinearGradient
                            colors={['#111', '#1A1C20']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.topCard, isCompact && styles.topCardCompact]}
                        >
                            <View style={styles.topCardIconWrap}>
                                <Ionicons name="settings-outline" size={18} color="#2DCA72" />
                            </View>
                            <View style={styles.topCardTextWrap}>
                                <Text style={styles.topCardTitle}>Preferences & Security</Text>
                                <Text style={styles.topCardDesc}>Manage app behavior, reminders, and data controls.</Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(150).duration(400)}>
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
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <Text style={styles.sectionTitle}>Preferences</Text>
                        <View style={styles.settingsGroup}>
                            <ToggleSettingRow
                                icon="moon-outline"
                                iconColor="#8B5CF6"
                                iconTint="rgba(139,92,246,0.12)"
                                label="Dark Mode"
                                value={darkMode}
                                onValueChange={setDarkMode}
                            />
                            <ToggleSettingRow
                                icon="finger-print-outline"
                                iconColor="#2DCA72"
                                iconTint="rgba(45,202,114,0.12)"
                                label="Biometric Lock"
                                value={biometrics}
                                onValueChange={setBiometrics}
                                isLast
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(250).duration(400)}>
                        <Text style={styles.sectionTitle}>Notifications</Text>
                        <View style={styles.settingsGroup}>
                            <SettingItem
                                icon="notifications-outline"
                                iconColor="#F59E0B"
                                iconTint="rgba(245,158,11,0.12)"
                                label="Reminders"
                                onPress={() => router.push('/settings/reminders' as any)}
                                isLast
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
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
                    </Animated.View>
                </View>
            </ScrollView>
        </View>
    );
}

function SettingItem({ icon, iconColor, iconTint, label, value, onPress, color, isLast }: {
    icon: string;
    iconColor?: string;
    iconTint?: string;
    label: string;
    value?: string;
    onPress: () => void;
    color?: string;
    isLast?: boolean;
}) {
    const finalIconColor = color || iconColor || '#8E8E93';
    const finalBgColor = color ? color + '15' : iconTint || '#F5F5F5';

    return (
        <TouchableOpacity style={[styles.settingRow, isLast && styles.settingRowLast]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: finalBgColor }]}>
                    <Ionicons name={icon as any} size={18} color={finalIconColor} />
                </View>
                <Text style={[styles.settingLabel, color ? { color } : {}]}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={styles.settingValue}>{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
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
                trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
                thumbColor="#fff"
                ios_backgroundColor="#E5E5EA"
            />
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
    scrollView: { flex: 1 },
    scrollContent: {
        paddingTop: 8,
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
        gap: 16,
        borderRadius: 24,
        padding: 24,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 4,
    },
    topCardCompact: {
        padding: 16,
    },
    topCardIconWrap: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(45,202,114,0.15)',
        borderWidth: 1,
        borderColor: 'rgba(45,202,114,0.3)',
    },
    topCardTextWrap: {
        flex: 1,
    },
    topCardTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    topCardDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.6)',
        fontWeight: '500',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        color: '#8E8E93',
        marginBottom: 8,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        paddingHorizontal: 8,
    },
    settingsGroup: {
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#F2F2F7',
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 8,
        elevation: 1,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    settingRowLast: {
        borderBottomWidth: 0,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        flex: 1,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingLabel: {
        fontSize: 15,
        color: '#111',
        fontWeight: '600',
        flexShrink: 1,
    },
    settingRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    settingValue: {
        fontSize: 14,
        color: '#8E8E93',
        fontWeight: '500',
    },
});
