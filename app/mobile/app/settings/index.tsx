import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, useWindowDimensions, StatusBar, Alert, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useThemeStyles } from '@/components/more/DesignSystem';

export default function SettingsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();
    const { isBiometricSupported, hasBiometricKey, enableBiometricLogin, disableBiometricLogin } = useAuth();
    const { isDarkMode, appTheme, setAppTheme } = useSettings();
    const { tokens } = useThemeStyles();
    
    const isCompact = width < 360;
    const isTablet = width >= 768;
    const horizontalPadding = isTablet ? 32 : isCompact ? 16 : 24;

    // Persisted general settings
    const CURRENCIES = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'JPY (¥)', 'AUD (A$)', 'CAD (C$)'];
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const LANGUAGES = ['English', 'Hindi', 'Spanish', 'French', 'German', 'Japanese', 'Chinese'];

    const [currency, setCurrency] = useState('INR (₹)');
    const [firstDay, setFirstDay] = useState('Monday');
    const [language, setLanguage] = useState('English');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [pickerTitle, setPickerTitle] = useState('');
    const [pickerOptions, setPickerOptions] = useState<string[]>([]);
    const [pickerOnSelect, setPickerOnSelect] = useState<(v: string) => void>(() => () => { });

    useEffect(() => {
        (async () => {
            const c = await AsyncStorage.getItem('setting_currency');
            const d = await AsyncStorage.getItem('setting_firstDay');
            const l = await AsyncStorage.getItem('setting_language');
            if (c) setCurrency(c);
            if (d) setFirstDay(d);
            if (l) setLanguage(l);
        })();
    }, []);

    const openPicker = (title: string, options: string[], onSelect: (v: string) => void) => {
        setPickerTitle(title);
        setPickerOptions(options);
        setPickerOnSelect(() => onSelect);
        setPickerVisible(true);
    };

    const handleClearData = () => {
        Alert.alert('⚠️ Clear All Data', 'This will permanently delete ALL your transactions, accounts, categories, and budgets.', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Clear Everything', style: 'destructive', onPress: async () => {
                    try {
                        const res = await api.delete('/api/user/data');
                        if (res.data?.success) {
                            const d = res.data.deleted;
                            Alert.alert('Done', `Cleared ${d.transactions} transactions, ${d.accounts} accounts, ${d.categories} categories, ${d.budgets} budgets.`);
                        }
                    } catch (e: any) {
                        Alert.alert('Error', e.response?.data?.message || 'Failed to clear data.');
                    }
                }
            },
        ]);
    };

    const generalSettings = [
        { icon: 'cash-outline', label: 'Currency', value: currency, onPress: () => openPicker('Currency', CURRENCIES, async (v) => { setCurrency(v); await AsyncStorage.setItem('setting_currency', v); }) },
        { icon: 'calendar-outline', label: 'First Day of Week', value: firstDay, onPress: () => openPicker('First Day of Week', DAYS, async (v) => { setFirstDay(v); await AsyncStorage.setItem('setting_firstDay', v); }) },
        { icon: 'language-outline', label: 'Language', value: language, onPress: () => openPicker('Language', LANGUAGES, async (v) => { setLanguage(v); await AsyncStorage.setItem('setting_language', v); }) },
    ];

    const dataSettings = [
        { icon: 'trash-outline', label: 'Clear All Data', color: '#F43F5E', onPress: handleClearData },
    ];

    return (
        <View style={[styles.container, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
            <Animated.View entering={FadeIn.delay(50).duration(300)} style={[styles.header, { paddingHorizontal: horizontalPadding }]}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Settings</Text>
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
                            colors={isDarkMode ? ['#1C1C1E', '#0E0E12'] : ['#111', '#1A1C20']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={[styles.topCard, isCompact && styles.topCardCompact, { borderColor: tokens.borderSubtle }]}
                        >
                            <View style={[styles.topCardIconWrap, { backgroundColor: isDarkMode ? 'rgba(45,202,114,0.1)' : 'rgba(45,202,114,0.15)' }]}>
                                <Ionicons name="settings-outline" size={18} color="#2DCA72" />
                            </View>
                            <View style={styles.topCardTextWrap}>
                                <Text style={styles.topCardTitle}>Preferences & Security</Text>
                                <Text style={[styles.topCardDesc, { color: 'rgba(255,255,255,0.6)' }]}>Manage app behavior, reminders, and data controls.</Text>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>General</Text>
                        <View style={[styles.settingsGroup, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                            {generalSettings.map((item, index) => (
                                <SettingItem
                                    key={item.label}
                                    icon={item.icon}
                                    label={item.label}
                                    value={item.value}
                                    onPress={item.onPress}
                                    isLast={index === generalSettings.length - 1}
                                    tokens={tokens}
                                />
                            ))}
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>Preferences</Text>
                        <View style={[styles.settingsGroup, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                            <ToggleSettingRow
                                icon="moon-outline"
                                iconColor="#8B5CF6"
                                iconTint="rgba(139,92,246,0.12)"
                                label="Dark Mode"
                                value={isDarkMode}
                                onValueChange={async (v) => {
                                    await setAppTheme(v ? 'dark' : 'light');
                                }}
                                tokens={tokens}
                                isDarkMode={isDarkMode}
                            />
                            <ToggleSettingRow
                                icon="finger-print-outline"
                                iconColor="#2DCA72"
                                iconTint="rgba(45,202,114,0.12)"
                                label="Biometric Lock"
                                value={hasBiometricKey}
                                onValueChange={async (v) => {
                                    if (!isBiometricSupported) {
                                        Alert.alert('Not Available', 'Your device does not support biometric authentication.');
                                        return;
                                    }
                                    if (v) {
                                        const success = await enableBiometricLogin();
                                        if (!success) {
                                            Alert.alert('Failed', 'Could not enable biometric lock. Please try again.');
                                        }
                                    } else {
                                        await disableBiometricLogin();
                                    }
                                }}
                                tokens={tokens}
                                isDarkMode={isDarkMode}
                                isLast
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(250).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>Notifications</Text>
                        <View style={[styles.settingsGroup, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                            <SettingItem
                                icon="notifications-outline"
                                iconColor="#F59E0B"
                                iconTint="rgba(245,158,11,0.12)"
                                label="Reminders"
                                onPress={() => router.push('/settings/reminders' as any)}
                                isLast
                                tokens={tokens}
                            />
                        </View>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                        <Text style={[styles.sectionTitle, { color: tokens.textMuted }]}>Data Management</Text>
                        <View style={[styles.settingsGroup, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                            {dataSettings.map((item, index) => (
                                <SettingItem
                                    key={item.label}
                                    icon={item.icon}
                                    label={item.label}
                                    color={item.color}
                                    onPress={item.onPress}
                                    isLast={index === dataSettings.length - 1}
                                    tokens={tokens}
                                />
                            ))}
                        </View>
                    </Animated.View>
                </View>
            </ScrollView>

            {/* Picker Modal */}
            <Modal visible={pickerVisible} transparent animationType="fade">
                <TouchableOpacity style={[styles.modalOverlay, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }]} activeOpacity={1} onPress={() => setPickerVisible(false)}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#1C1C1E' : '#fff' }]}>
                        <Text style={[styles.modalTitle, { color: tokens.textPrimary }]}>{pickerTitle}</Text>
                        <FlatList
                            data={pickerOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => {
                                const isSelected = (
                                    pickerTitle === 'Currency' ? currency :
                                        pickerTitle === 'First Day of Week' ? firstDay : language
                                ) === item;
                                return (
                                    <TouchableOpacity
                                        style={[styles.pickerItem, isSelected && { backgroundColor: isDarkMode ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)' }, { borderBottomColor: tokens.borderSubtle }]}
                                        onPress={() => { pickerOnSelect(item); setPickerVisible(false); }}
                                    >
                                        <Text style={[styles.pickerItemText, { color: tokens.textPrimary }, isSelected && { color: '#6366F1', fontWeight: '800' }]}>{item}</Text>
                                        {isSelected && <Ionicons name="checkmark-circle" size={20} color="#6366F1" />}
                                    </TouchableOpacity>
                                );
                            }}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

function SettingItem({ icon, iconColor, iconTint, label, value, onPress, color, isLast, tokens }: {
    icon: string;
    iconColor?: string;
    iconTint?: string;
    label: string;
    value?: string;
    onPress: () => void;
    color?: string;
    isLast?: boolean;
    tokens: any;
}) {
    const finalIconColor = color || iconColor || tokens.textSecondary;
    const finalBgColor = color ? color + '15' : iconTint || tokens.bgTertiary;

    return (
        <TouchableOpacity style={[styles.settingRow, { borderBottomColor: tokens.borderSubtle }, isLast && styles.settingRowLast]} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: finalBgColor }]}>
                    <Ionicons name={icon as any} size={18} color={finalIconColor} />
                </View>
                <Text style={[styles.settingLabel, { color: tokens.textPrimary }, color ? { color } : {}]}>{label}</Text>
            </View>
            <View style={styles.settingRight}>
                {value && <Text style={[styles.settingValue, { color: tokens.textSecondary }]}>{value}</Text>}
                <Ionicons name="chevron-forward" size={16} color={tokens.textMuted} />
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
    tokens,
    isDarkMode
}: {
    icon: string;
    iconColor: string;
    iconTint: string;
    label: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    isLast?: boolean;
    tokens: any;
    isDarkMode: boolean;
}) {
    return (
        <View style={[styles.settingRow, { borderBottomColor: tokens.borderSubtle }, isLast && styles.settingRowLast]}>
            <View style={styles.settingLeft}>
                <View style={[styles.settingIcon, { backgroundColor: iconTint }]}>
                    <Ionicons name={icon as any} size={18} color={iconColor} />
                </View>
                <Text style={[styles.settingLabel, { color: tokens.textPrimary }]}>{label}</Text>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA', true: '#2DCA72' }}
                thumbColor="#fff"
                ios_backgroundColor={isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
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
        fontWeight: '500',
        lineHeight: 18,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '800',
        marginBottom: 8,
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 1.2,
        paddingHorizontal: 8,
    },
    settingsGroup: {
        borderRadius: 20,
        borderWidth: 1,
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
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28, padding: 24,
        maxHeight: '60%',
    },
    modalTitle: {
        fontSize: 18, fontWeight: '900',
        marginBottom: 16, textAlign: 'center',
    },
    pickerItem: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingVertical: 16,
        paddingHorizontal: 8, borderBottomWidth: 1,
    },
    pickerItemActive: {
        borderRadius: 12,
    },
    pickerItemText: {
        fontSize: 16, fontWeight: '600',
    },
});
