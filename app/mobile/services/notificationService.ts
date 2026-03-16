import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ── Configuration ──
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true
    }),
});

export const requestNotificationPermissions = async () => {
    let { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        status = newStatus;
    }

    return status === 'granted';
};

export const scheduleRecurringBillReminder = async (billName: string, amount: number, dueDate: Date, currencySymbol: string = '₹') => {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return null;

        // Schedule for 3 days before the due date at 10:00 AM
        const triggerDate = new Date(dueDate);
        triggerDate.setDate(triggerDate.getDate() - 3);
        triggerDate.setHours(10, 0, 0, 0);

        // If the trigger date is already passed, schedule it for the next month
        if (triggerDate < new Date()) {
            triggerDate.setMonth(triggerDate.getMonth() + 1);
        }

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Upcoming Bill Reminder 📅',
                body: `Your ${billName} bill of ${currencySymbol}${amount} is due in 3 days. Make sure you have enough balance!`,
                data: { billName, amount, dueDate: dueDate.toISOString() },
            },
            trigger: {
                // @ts-ignore - Expo types changed in SDK 50+ requiring explicit options
                type: Notifications.SchedulableTriggerInputTypes.DATE,
                date: triggerDate
            },
        });

        return id;
    } catch (error) {
        console.error('Failed to schedule notification:', error);
        return null;
    }
};

export const cancelNotification = async (notificationId: string) => {
    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.error('Failed to cancel notification:', error);
    }
};

export const cancelAllNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Failed to cancel all notifications:', error);
    }
};
