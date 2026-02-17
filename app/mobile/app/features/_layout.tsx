import { Stack } from 'expo-router';

export default function FeaturesLayout() {
    return (
        <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
            <Stack.Screen name="track" />
            <Stack.Screen name="trends" />
            <Stack.Screen name="security" />
            <Stack.Screen name="offline" />
        </Stack>
    );
}
