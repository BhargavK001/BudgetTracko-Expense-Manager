import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { useThemeStyles } from '@/components/more/DesignSystem';
import { useSettings } from '@/context/SettingsContext';

const STORAGE_KEYS = {
    daily: 'reminder_daily',
    weekly: 'reminder_weekly',
    budget: 'reminder_budget',
};

export default function RemindersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { tokens } = useThemeStyles();
    const { isDarkMode } = useSettings();

    const [dailyReminder, setDailyReminder] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(true);
    const [budgetAlerts, setBudgetAlerts] = useState(true);

    useEffect(() => {
        (async () => {
            const d = await AsyncStorage.getItem(STORAGE_KEYS.daily);
            const w = await AsyncStorage.getItem(STORAGE_KEYS.weekly);
            const b = await AsyncStorage.getItem(STORAGE_KEYS.budget);
            if (d !== null) setDailyReminder(d === 'true');
            if (w !== null) setWeeklyReport(w === 'true');
            if (b !== null) setBudgetAlerts(b === 'true');
        })();
    }, []);

    const scheduleNotification = async (key: string, enabled: boolean) => {
        try {
            // Dynamic import to avoid Expo Go crash at module level
            const Notifications = await import('expo-notifications');

            if (enabled) {
                const { status } = await Notifications.requestPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Required', 'Please enable notifications in your device settings.');
                    return false;
                }
            }

            if (key === 'daily') {
                await Notifications.cancelScheduledNotificationAsync('daily-reminder').catch(() => { });
                if (enabled) {
                    await Notifications.scheduleNotificationAsync({
                        identifier: 'daily-reminder',
                        content: {
                            title: '📝 Log Your Expenses',
                            body: "Don't forget to log today's expenses in BudgetTracko!",
                            sound: true,
                        },
                        trigger: {
                            type: Notifications.SchedulableTriggerInputTypes.DAILY,
                            hour: 20,
                            minute: 0,
                        },
                    });
                }
            } else if (key === 'weekly') {
                await Notifications.cancelScheduledNotificationAsync('weekly-report').catch(() => { });
                if (enabled) {
                    await Notifications.scheduleNotificationAsync({
                        identifier: 'weekly-report',
                        content: {
                            title: '📊 Weekly Spending Report',
                            body: 'Your weekly spending summary is ready. Check your analytics!',
                            sound: true,
                        },
                        trigger: {
                            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
                            weekday: 1,
                            hour: 9,
                            minute: 0,
                        },
                    });
                }
            }
            return true;
        } catch (e) {
            console.log('Notification scheduling unavailable (Expo Go). Preference saved locally.');
            return true;
        }
    };

    const toggleDaily = async (v: boolean) => {
        const ok = await scheduleNotification('daily', v);
        if (ok) {
            setDailyReminder(v);
            await AsyncStorage.setItem(STORAGE_KEYS.daily, String(v));
        }
    };

    const toggleWeekly = async (v: boolean) => {
        const ok = await scheduleNotification('weekly', v);
        if (ok) {
            setWeeklyReport(v);
            await AsyncStorage.setItem(STORAGE_KEYS.weekly, String(v));
        }
    };

    const toggleBudget = async (v: boolean) => {
        setBudgetAlerts(v);
        await AsyncStorage.setItem(STORAGE_KEYS.budget, String(v));
    };

    return (
        <View style={[styles.container, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
            <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

            <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color={tokens.textPrimary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: tokens.textPrimary }]}>Reminders</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
                    <Text style={[styles.sectionDesc, { color: tokens.textSecondary }]}>
                        Stay on top of your finances by customizing when and how we notify you.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                    <View style={[styles.settingsGroup, { backgroundColor: tokens.cardSurface, borderColor: tokens.borderSubtle }]}>
                        <ReminderItem
                            icon="today-outline"
                            iconColor="#3B82F6"
                            iconTint="rgba(59,130,246,0.1)"
                            title="Daily Reminder"
                            desc="Reminds you to log daily expenses at 8:00 PM."
                            value={dailyReminder}
                            onValueChange={toggleDaily}
                            tokens={tokens}
                            isDarkMode={isDarkMode}
                        />
                        <ReminderItem
                            icon="stats-chart-outline"
                            iconColor="#10B981"
                            iconTint="rgba(16,185,129,0.1)"
                            title="Weekly Report"
                            desc="Get a summary of your spending every Sunday morning."
                            value={weeklyReport}
                            onValueChange={toggleWeekly}
                            tokens={tokens}
                            isDarkMode={isDarkMode}
                        />
                        <ReminderItem
                            icon="warning-outline"
                            iconColor="#F59E0B"
                            iconTint="rgba(245,158,11,0.1)"
                            title="Budget Alerts"
                            desc="Notifies you when you reach 80% and 100% of any budget."
                            value={budgetAlerts}
                            onValueChange={toggleBudget}
                            tokens={tokens}
                            isDarkMode={isDarkMode}
                            isLast
                        />
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <View style={[styles.infoBox, { backgroundColor: isDarkMode ? tokens.bgSecondary : '#F5F5F5' }]}>
                        <Ionicons name="information-circle-outline" size={20} color={tokens.textMuted} />
                        <Text style={[styles.infoText, { color: tokens.textSecondary }]}>
                            Notification scheduling requires a development build. In Expo Go, your preferences are saved and will activate once you build the app.
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

function ReminderItem({ icon, iconColor, iconTint, title, desc, value, onValueChange, isLast, tokens, isDarkMode }: any) {
    return (
        <View style={[styles.reminderRow, { borderBottomColor: tokens.borderSubtle }, isLast && styles.reminderRowLast]}>
            <View style={[styles.iconWrap, { backgroundColor: iconTint }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.textContent}>
                <Text style={[styles.title, { color: tokens.textPrimary }]}>{title}</Text>
                <Text style={[styles.desc, { color: tokens.textSecondary }]}>{desc}</Text>
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
    container: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between',
        alignItems: 'center', paddingHorizontal: 24, paddingVertical: 14,
    },
    backBtn: {
        width: 40, height: 40, borderRadius: 20,
        justifyContent: 'center', alignItems: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '800' },
    scrollView: { flex: 1 },
    scrollContent: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
    sectionDesc: {
        fontSize: 15, lineHeight: 22,
        marginBottom: 24, paddingHorizontal: 8,
    },
    settingsGroup: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden', marginBottom: 24,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
    },
    reminderRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: 20, borderBottomWidth: 1,
    },
    reminderRowLast: { borderBottomWidth: 0 },
    iconWrap: {
        width: 40, height: 40, borderRadius: 14,
        justifyContent: 'center', alignItems: 'center', marginRight: 16,
    },
    textContent: { flex: 1, marginRight: 16 },
    title: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
    desc: { fontSize: 13, lineHeight: 18 },
    infoBox: {
        flexDirection: 'row', padding: 16,
        borderRadius: 16,
        gap: 12, alignItems: 'center',
    },
    infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
});
