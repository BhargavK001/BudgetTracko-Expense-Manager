import { Platform } from 'react-native';
import Constants from 'expo-constants';

type NotificationsModule = typeof import('expo-notifications');

const isExpoGoAndroid = Constants.appOwnership === 'expo' && Platform.OS === 'android';
let notificationsModule: NotificationsModule | null = null;

const getNotificationsModule = async () => {
    if (isExpoGoAndroid) {
        return null;
    }

    if (!notificationsModule) {
        const Notifications = await import('expo-notifications');
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: false,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });
        notificationsModule = Notifications;
    }

    return notificationsModule;
};

export const requestNotificationPermissions = async () => {
    if (isExpoGoAndroid) {
        // Remote push notifications are not supported in Expo Go on Android SDK 53+
        console.warn('Push notifications are not supported in Expo Go on Android. Use a development build.');
        return false;
    }

    const Notifications = await getNotificationsModule();
    if (!Notifications) return false;

    let { status } = await Notifications.getPermissionsAsync();

    if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        status = newStatus;
    }

    return status === 'granted';
};

export const scheduleRecurringBillReminder = async (billName: string, amount: number, dueDate: Date, currencySymbol: string = '₹') => {
    try {
        const Notifications = await getNotificationsModule();
        if (!Notifications) {
            console.warn('Notifications unavailable in this runtime. Skipping reminder scheduling.');
            return null;
        }

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
        const Notifications = await getNotificationsModule();
        if (!Notifications) return;

        await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
        console.error('Failed to cancel notification:', error);
    }
};

export const cancelAllNotifications = async () => {
    try {
        const Notifications = await getNotificationsModule();
        if (!Notifications) return;

        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
        console.error('Failed to cancel all notifications:', error);
    }
};
