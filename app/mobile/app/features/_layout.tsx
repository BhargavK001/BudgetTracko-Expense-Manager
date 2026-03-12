import { Stack } from 'expo-router';

export default function FeaturesLayout() {
    return (
        <Stack screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
            gestureEnabled: true,
            fullScreenGestureEnabled: true,
            contentStyle: { backgroundColor: '#fff' },
        }}>
            <Stack.Screen name="track" />
            <Stack.Screen name="trends" />
            <Stack.Screen name="security" />
            <Stack.Screen name="offline" />
            <Stack.Screen name="budgets" />
            <Stack.Screen name="recurring-bills" />
            <Stack.Screen name="ask-tracko" />
            <Stack.Screen name="analysis" />
            <Stack.Screen name="edit-profile" />
            <Stack.Screen name="razorpay-checkout" />
        </Stack>
    );
}
