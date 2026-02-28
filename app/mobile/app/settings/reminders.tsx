import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius, NeoShadowSm } from '@/constants/Theme';

export default function RemindersScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const [dailyReminder, setDailyReminder] = React.useState(true);
    const [weeklyReport, setWeeklyReport] = React.useState(false);
    const [budgetAlerts, setBudgetAlerts] = React.useState(true);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* ─── Header ─── */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={20} color={DarkTheme.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Reminders</Text>
                <View style={{ width: 34 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Daily Reminders */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: '#FF980022' }]}>
                            <Ionicons name="notifications-outline" size={24} color="#FF9800" />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.cardTitle}>Daily Reminders</Text>
                            <Text style={styles.cardDesc}>Get notified to add your transactions every day.</Text>
                        </View>
                        <Switch
                            value={dailyReminder}
                            onValueChange={setDailyReminder}
                            trackColor={{ false: '#333', true: DarkTheme.brandYellow }}
                            thumbColor={dailyReminder ? '#fff' : '#f4f3f4'}
                        />
                    </View>

                    {dailyReminder && (
                        <TouchableOpacity style={styles.timePicker}>
                            <Text style={styles.timeLabel}>Reminder Time</Text>
                            <View style={styles.timeValue}>
                                <Text style={styles.timeText}>08:00 PM</Text>
                                <Ionicons name="chevron-forward" size={16} color={DarkTheme.chevron} />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Budget Alerts */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: '#E8584F22' }]}>
                            <Ionicons name="alert-circle-outline" size={24} color="#E8584F" />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.cardTitle}>Budget Alerts</Text>
                            <Text style={styles.cardDesc}>Get notified when you exceed 80% of your budget.</Text>
                        </View>
                        <Switch
                            value={budgetAlerts}
                            onValueChange={setBudgetAlerts}
                            trackColor={{ false: '#333', true: DarkTheme.brandYellow }}
                            thumbColor={budgetAlerts ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Weekly Reports */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <View style={[styles.iconContainer, { backgroundColor: '#4CAF5022' }]}>
                            <Ionicons name="stats-chart-outline" size={24} color="#4CAF50" />
                        </View>
                        <View style={styles.headerText}>
                            <Text style={styles.cardTitle}>Weekly Reports</Text>
                            <Text style={styles.cardDesc}>Get a summary of your weekly spending habits.</Text>
                        </View>
                        <Switch
                            value={weeklyReport}
                            onValueChange={setWeeklyReport}
                            trackColor={{ false: '#333', true: DarkTheme.brandYellow }}
                            thumbColor={weeklyReport ? '#fff' : '#f4f3f4'}
                        />
                    </View>
                </View>

                {/* Test Notification */}
                <TouchableOpacity style={styles.testBtn}>
                    <Text style={styles.testBtnText}>Send Test Notification</Text>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
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
    card: {
        backgroundColor: DarkTheme.cardBg,
        borderRadius: BorderRadius.md,
        padding: Spacing.lg,
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        marginBottom: Spacing.lg,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.md,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 12,
        color: DarkTheme.textSecondary,
        lineHeight: 16,
    },
    timePicker: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: Spacing.lg,
        marginTop: Spacing.lg,
        borderTopWidth: 1,
        borderTopColor: DarkTheme.separator,
    },
    timeLabel: {
        fontSize: FontSize.md,
        color: DarkTheme.textPrimary,
        fontWeight: '600',
    },
    timeValue: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    timeText: {
        fontSize: FontSize.md,
        color: DarkTheme.brandYellow,
        fontWeight: '700',
    },
    testBtn: {
        backgroundColor: DarkTheme.cardBgElevated,
        padding: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: DarkTheme.neoBorder,
        marginTop: Spacing.md,
        ...NeoShadowSm,
    },
    testBtnText: {
        fontSize: FontSize.md,
        fontWeight: '800',
        color: DarkTheme.textPrimary,
    },
});
