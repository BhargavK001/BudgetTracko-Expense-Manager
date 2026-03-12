import { Stack } from 'expo-router';

export default function SettingsLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: '#fff' },
        }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="reminders" />
        </Stack>
    );
}
