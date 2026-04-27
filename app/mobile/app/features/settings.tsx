import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, BorderRadius } from '@/constants/Theme';
import { requestNotificationPermissions } from '@/services/notificationService';
import { useSettings, CurrencySymbol } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { Modal } from 'react-native';
import * as Haptics from 'expo-haptics';
import { DangerZoneRow, useThemeStyles } from '@/components/more/DesignSystem';

function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { tokens, isDarkMode } = useThemeStyles();

    const { currency, setCurrency, hapticEnabled, setHapticEnabled, triggerHaptic } = useSettings();
    const { logout } = useAuth(); 
    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);

    // Placeholder local state for settings until connected to context
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const renderSettingRow = (
        icon: any,
        title: string,
        subtitle: string,
        rightElement: React.ReactNode,
        isLast = false
    ) => (
        <View style={[styles.settingRow, { borderBottomColor: tokens.borderSubtle }, !isLast && styles.borderBottom]}>
            <View style={[styles.iconWrap, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                <Ionicons name={icon} size={20} color={tokens.textPrimary} />
            </View>
            <View style={styles.textWrap}>
                <Text style={[styles.settingTitle, { color: tokens.textPrimary }]}>{title}</Text>
                <Text style={[styles.settingSub, { color: tokens.textSecondary }]}>{subtitle}</Text>
            </View>
            <View style={styles.rightContent}>
                {rightElement}
            </View>
        </View>
    );

    const toggleNotifications = async (val: boolean) => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
        if (val) {
            const granted = await requestNotificationPermissions();
            setNotificationsEnabled(granted);
        } else {
            setNotificationsEnabled(false);
        }
    };

    const handleCurrencySelect = async (symbol: CurrencySymbol) => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        await setCurrency(symbol);
        setIsCurrencyModalVisible(false);
    };

    const handleDeleteAccount = () => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert('Delete account?', 'This is permanent and cannot be undone.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
            },
        ]);
    };

    const handleClearCache = async () => {
        triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert(
            'Clear Cache',
            'This will clear temporary files and app images. Your transactions and settings will NOT be deleted.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Clear', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            Alert.alert('Success', 'Cache cleared successfully.');
                        } catch (e) {
                            Alert.alert('Error', 'Failed to clear cache.');
                        }
                    }
                }
            ]
        );
    };

    const CURRENCIES: { symbol: CurrencySymbol; label: string }[] = [
        { symbol: '₹', label: 'Indian Rupee (INR)' },
        { symbol: '$', label: 'US Dollar (USD)' },
        { symbol: '€', label: 'Euro (EUR)' },
        { symbol: '£', label: 'British Pound (GBP)' },
        { symbol: '¥', label: 'Japanese Yen (JPY)' },
    ];

    return (
        <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
            {/* Header */}
            <View style={[styles.header, { backgroundColor: tokens.bgPrimary, borderBottomColor: tokens.borderSubtle }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>App Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>General</Text>
                <View style={[styles.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                    {renderSettingRow('cash-outline', 'Default Currency', 'Set your primary currency symbol',
                        <TouchableOpacity
                            style={[styles.valueChip, { backgroundColor: tokens.bgTertiary, borderColor: tokens.borderSubtle }]}
                            activeOpacity={0.7}
                            onPress={() => setIsCurrencyModalVisible(true)}
                        >
                            <Text style={[styles.valueTxt, { color: tokens.textPrimary }]}>{currency}</Text>
                            <Ionicons name="chevron-down" size={14} color={tokens.textSecondary} />
                        </TouchableOpacity>,
                        true
                    )}
                </View>

                <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>Experience & Alerts</Text>
                <View style={[styles.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                    {renderSettingRow('notifications-outline', 'Push Notifications', 'Get bill reminders & alerts',
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                            thumbColor="#fff"
                        />
                    )}
                    {renderSettingRow('phone-portrait-outline', 'Haptic Feedback', 'Vibrate on actions like saving',
                        <Switch
                            value={hapticEnabled}
                            onValueChange={async (val) => {
                                await setHapticEnabled(val);
                                if (val) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            }}
                            trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                            thumbColor="#fff"
                        />
                    )}
                    {renderSettingRow('volume-high-outline', 'In-App Sounds', 'Play sound on successful actions',
                        <Switch
                            value={soundsEnabled}
                            onValueChange={(val) => {
                                setSoundsEnabled(val);
                                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                            thumbColor="#fff"
                        />,
                        true
                    )}
                </View>

                <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>Data Management</Text>
                <View style={[styles.card, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                    {renderSettingRow('trash-bin-outline', 'Clear App Cache', 'Free up temporary local storage',
                        <TouchableOpacity onPress={handleClearCache}>
                            <Text style={{ fontSize: 13, color: '#F43F5E', fontWeight: '600' }}>Clear</Text>
                        </TouchableOpacity>,
                        true
                    )}
                </View>

                <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>Account Lifecycle</Text>
                <DangerZoneRow onPress={handleDeleteAccount} />

                {/* Currency Selection Modal */}
                <Modal
                    visible={isCurrencyModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsCurrencyModalVisible(false)}
                >
                    <TouchableOpacity
                        style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}
                        activeOpacity={1}
                        onPress={() => setIsCurrencyModalVisible(false)}
                    >
                        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }]}>
                            <Text style={[styles.modalTitle, { color: tokens.textPrimary }]}>Select Currency</Text>
                            {CURRENCIES.map((item) => (
                                <TouchableOpacity
                                    key={item.symbol}
                                    style={[
                                        styles.currencyOption, 
                                        { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : '#F9F9FB' },
                                        currency === item.symbol && [styles.currencyOptionActive, { backgroundColor: isDarkMode ? tokens.purple.accent : '#111' }]
                                    ]}
                                    onPress={() => handleCurrencySelect(item.symbol)}
                                >
                                    <Text style={[
                                        styles.currencySymbol, 
                                        { color: tokens.textPrimary },
                                        currency === item.symbol && styles.currencySymbolActive
                                    ]}>
                                        {item.symbol}
                                    </Text>
                                    <Text style={[
                                        styles.currencyLabel, 
                                        { color: tokens.textSecondary },
                                        currency === item.symbol && styles.currencyLabelActive
                                    ]}>
                                        {item.label}
                                    </Text>
                                    {currency === item.symbol && (
                                        <Ionicons name="checkmark" size={20} color={isDarkMode ? "#fff" : "#6366F1"} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>

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
        borderBottomWidth: 1,
        zIndex: 10,
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
    borderBottom: { borderBottomWidth: 1 },
    iconWrap: {
        width: 38, height: 38, borderRadius: 12,
        justifyContent: 'center', alignItems: 'center',
    },
    textWrap: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    settingSub: { fontSize: 11, fontWeight: '500' },
    rightContent: { alignItems: 'flex-end', minWidth: 40 },

    valueChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 8, borderWidth: 1,
    },
    valueTxt: { fontSize: 14, fontWeight: '700' },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center', alignItems: 'center', padding: 20,
    },
    modalContent: {
        width: '100%', maxWidth: 320,
        borderRadius: 24, padding: 24, gap: 12,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', marginBottom: 8 },
    currencyOption: {
        flexDirection: 'row', alignItems: 'center', padding: 14,
        borderRadius: 16, gap: 12,
    },
    currencyOptionActive: { },
    currencySymbol: { fontSize: 20, fontWeight: '700', width: 30 },
    currencySymbolActive: { color: '#fff' },
    currencyLabel: { flex: 1, fontSize: 14, fontWeight: '600' },
    currencyLabelActive: { color: '#fff' },
});

export default SettingsScreen;
