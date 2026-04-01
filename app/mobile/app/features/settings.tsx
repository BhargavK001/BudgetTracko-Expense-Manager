import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, BorderRadius } from '@/constants/Theme';
import { requestNotificationPermissions } from '@/services/notificationService';
import { useSettings, CurrencySymbol } from '@/context/SettingsContext';
import { Modal } from 'react-native';
import * as Haptics from 'expo-haptics';

function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const { currency, setCurrency, hapticEnabled, setHapticEnabled, triggerHaptic } = useSettings();
    const [isCurrencyModalVisible, setIsCurrencyModalVisible] = useState(false);

    // Placeholder local state for settings until connected to context
    const [soundsEnabled, setSoundsEnabled] = useState(true);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [hiddenBalance, setHiddenBalance] = useState(false);

    const renderSettingRow = (
        icon: any,
        title: string,
        subtitle: string,
        rightElement: React.ReactNode,
        isLast = false
    ) => (
        <View style={[styles.settingRow, !isLast && styles.borderBottom]}>
            <View style={styles.iconWrap}>
                <Ionicons name={icon} size={20} color="#111" />
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
        await setCurrency(symbol);
        setIsCurrencyModalVisible(false);
    };

    const CURRENCIES: { symbol: CurrencySymbol; label: string }[] = [
        { symbol: '₹', label: 'Indian Rupee (INR)' },
        { symbol: '$', label: 'US Dollar (USD)' },
        { symbol: '€', label: 'Euro (EUR)' },
        { symbol: '£', label: 'British Pound (GBP)' },
        { symbol: '¥', label: 'Japanese Yen (JPY)' },
    ];

    return (
        <View style={[styles.root, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={24} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>App Settings</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Text style={styles.sectionTitle}>General</Text>
                <View style={styles.card}>
                    {renderSettingRow('cash-outline', 'Default Currency', 'Set your primary currency symbol',
                        <TouchableOpacity
                            style={styles.valueChip}
                            activeOpacity={0.7}
                            onPress={() => setIsCurrencyModalVisible(true)}
                        >
                            <Text style={styles.valueTxt}>{currency}</Text>
                            <Ionicons name="chevron-down" size={14} color="#8E8E93" />
                        </TouchableOpacity>
                    )}
                    {renderSettingRow('eye-off-outline', 'Hide Balances', 'Hide totals & balances on home screen',
                        <Switch
                            value={hiddenBalance}
                            onValueChange={(val) => {
                                setHiddenBalance(val);
                                triggerHaptic(Haptics.ImpactFeedbackStyle.Light);
                            }}
                            trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
                            thumbColor="#fff"
                        />,
                        true
                    )}
                </View>

                <Text style={styles.sectionTitle}>Experience & Alerts</Text>
                <View style={styles.card}>
                    {renderSettingRow('notifications-outline', 'Push Notifications', 'Get bill reminders & alerts',
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={toggleNotifications}
                            trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
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
                            trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
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
                            trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
                            thumbColor="#fff"
                        />,
                        true
                    )}
                </View>

                <Text style={styles.sectionTitle}>Data Management</Text>
                <View style={styles.card}>
                    {renderSettingRow('cloud-download-outline', 'Export Data', 'Download all backup as CSV',
                        <Ionicons name="chevron-forward" size={18} color="#8E8E93" />,
                        false
                    )}
                    {renderSettingRow('trash-bin-outline', 'Clear Cache', 'Free up temporary local storage',
                        <Text style={{ fontSize: 13, color: '#F43F5E', fontWeight: '600' }}>Clear</Text>,
                        true
                    )}
                </View>

                {/* Currency Selection Modal */}
                <Modal
                    visible={isCurrencyModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setIsCurrencyModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setIsCurrencyModalVisible(false)}
                    >
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Currency</Text>
                            {CURRENCIES.map((item) => (
                                <TouchableOpacity
                                    key={item.symbol}
                                    style={[styles.currencyOption, currency === item.symbol && styles.currencyOptionActive]}
                                    onPress={() => handleCurrencySelect(item.symbol)}
                                >
                                    <Text style={[styles.currencySymbol, currency === item.symbol && styles.currencySymbolActive]}>
                                        {item.symbol}
                                    </Text>
                                    <Text style={[styles.currencyLabel, currency === item.symbol && styles.currencyLabelActive]}>
                                        {item.label}
                                    </Text>
                                    {currency === item.symbol && (
                                        <Ionicons name="checkmark" size={20} color="#6366F1" />
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
    root: { flex: 1, backgroundColor: '#fff' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg, paddingVertical: 14,
        borderBottomWidth: 1, borderBottomColor: '#F2F2F7',
        backgroundColor: '#fff', zIndex: 10,
    },
    backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
    headerTitle: { fontSize: 17, fontWeight: '800', color: '#111' },

    scrollContent: { padding: Spacing.xl, paddingBottom: 60 },

    sectionTitle: {
        fontSize: 12, fontWeight: '700', color: '#8E8E93',
        textTransform: 'uppercase', letterSpacing: 1.2,
        marginBottom: 8, paddingHorizontal: 4, marginTop: 10,
    },
    card: {
        backgroundColor: '#fff', borderRadius: BorderRadius.lg,
        borderWidth: 1, borderColor: '#E5E5EA',
        marginBottom: Spacing.xl, overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14,
    },
    borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
    iconWrap: {
        width: 38, height: 38, borderRadius: 12,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center', alignItems: 'center',
    },
    textWrap: { flex: 1 },
    settingTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
    settingSub: { fontSize: 11, fontWeight: '500', color: '#8E8E93' },
    rightContent: { alignItems: 'flex-end', minWidth: 40 },

    valueChip: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 8, borderWidth: 1, borderColor: '#E5E5EA',
    },
    valueTxt: { fontSize: 14, fontWeight: '700', color: '#111' },
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center', padding: 20,
    },
    modalContent: {
        width: '100%', maxWidth: 320, backgroundColor: '#fff',
        borderRadius: 24, padding: 24, gap: 12,
    },
    modalTitle: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 8 },
    currencyOption: {
        flexDirection: 'row', alignItems: 'center', padding: 14,
        borderRadius: 16, backgroundColor: '#F9F9FB', gap: 12,
    },
    currencyOptionActive: { backgroundColor: '#111' },
    currencySymbol: { fontSize: 20, fontWeight: '700', color: '#111', width: 30 },
    currencySymbolActive: { color: '#fff' },
    currencyLabel: { flex: 1, fontSize: 14, fontWeight: '600', color: '#8E8E93' },
    currencyLabelActive: { color: '#fff' },
});

export default SettingsScreen;
