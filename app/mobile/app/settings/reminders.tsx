import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function RemindersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [dailyReminder, setDailyReminder] = React.useState(true);
    const [weeklyReport, setWeeklyReport] = React.useState(true);
    const [budgetAlerts, setBudgetAlerts] = React.useState(true);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StatusBar barStyle="dark-content" />

            <Animated.View entering={FadeIn.delay(50).duration(300)} style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <Ionicons name="arrow-back" size={20} color="#111" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reminders</Text>
                <View style={{ width: 40 }} />
            </Animated.View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInDown.delay(100).duration(400).springify()}>
                    <Text style={styles.sectionDesc}>
                        Stay on top of your finances by customizing when and how we notify you.
                    </Text>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(150).duration(400)}>
                    <View style={styles.settingsGroup}>
                        <ReminderItem
                            icon="today-outline"
                            iconColor="#3B82F6"
                            iconTint="rgba(59,130,246,0.1)"
                            title="Daily Reminder"
                            desc="Reminds you to log daily expenses at 8:00 PM."
                            value={dailyReminder}
                            onValueChange={setDailyReminder}
                        />
                        <ReminderItem
                            icon="stats-chart-outline"
                            iconColor="#10B981"
                            iconTint="rgba(16,185,129,0.1)"
                            title="Weekly Report"
                            desc="Get a summary of your spending every Sunday morning."
                            value={weeklyReport}
                            onValueChange={setWeeklyReport}
                        />
                        <ReminderItem
                            icon="warning-outline"
                            iconColor="#F59E0B"
                            iconTint="rgba(245,158,11,0.1)"
                            title="Budget Alerts"
                            desc="Notifies you when you reach 80% and 100% of any budget."
                            value={budgetAlerts}
                            onValueChange={setBudgetAlerts}
                            isLast
                        />
                    </View>
                </Animated.View>

                {/* Additional Info box */}
                <Animated.View entering={FadeInDown.delay(200).duration(400)}>
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={20} color="#8E8E93" />
                        <Text style={styles.infoText}>
                            System level notifications must be enabled for BudgetTracko to send alerts.
                        </Text>
                    </View>
                </Animated.View>
            </ScrollView>
        </View>
    );
}

function ReminderItem({ icon, iconColor, iconTint, title, desc, value, onValueChange, isLast }: any) {
    return (
        <View style={[styles.reminderRow, isLast && styles.reminderRowLast]}>
            <View style={[styles.iconWrap, { backgroundColor: iconTint }]}>
                <Ionicons name={icon} size={20} color={iconColor} />
            </View>
            <View style={styles.textContent}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.desc}>{desc}</Text>
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
        paddingHorizontal: 24,
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 40,
    },
    sectionDesc: {
        fontSize: 15,
        color: '#8E8E93',
        lineHeight: 22,
        marginBottom: 24,
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
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F2F2F7',
    },
    reminderRowLast: {
        borderBottomWidth: 0,
    },
    iconWrap: {
        width: 40,
        height: 40,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    textContent: {
        flex: 1,
        marginRight: 16,
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#111',
        marginBottom: 4,
    },
    desc: {
        fontSize: 13,
        color: '#8E8E93',
        lineHeight: 18,
    },
    infoBox: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#F5F5F5',
        borderRadius: 16,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: '#8E8E93',
        lineHeight: 18,
    },
});
