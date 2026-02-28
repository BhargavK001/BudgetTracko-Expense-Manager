import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback } from 'react';
import { useColorScheme, View } from 'react-native';
import 'react-native-reanimated';
import AnimatedSplash from '../components/AnimatedSplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionProvider } from '@/context/TransactionContext';
import { AuthProvider } from '@/context/AuthContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/ modal` keeps a back button present.
  initialRouteName: 'index',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      // Hide native splash after a tiny delay so animated splash can take over smoothly
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [loaded]);

  const handleSplashComplete = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  if (!loaded) {
    return null;
  }

  if (showAnimatedSplash) {
    return <AnimatedSplash onComplete={handleSplashComplete} />;
  }

  return <RootLayoutNav />;
}

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0A0A0A',
    card: '#0A0A0A',
    text: '#FFFFFF',
    border: '#1A1A1A',
    notification: '#facc15',
  },
};

function RootLayoutNav() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <SafeAreaProvider>
          <ThemeProvider value={CustomDarkTheme}>
            <View style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
              <Stack
                initialRouteName="index"
                screenOptions={{
                  animation: 'slide_from_right',
                  gestureEnabled: true,
                  fullScreenGestureEnabled: true,
                  headerShown: false,
                  contentStyle: { backgroundColor: '#0A0A0A' },
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="welcome" options={{ headerShown: false }} />
                <Stack.Screen name="features" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="help-support" options={{ headerShown: false }} />
                <Stack.Screen name="share-app" options={{ headerShown: false }} />
                <Stack.Screen name="premium" options={{ headerShown: false }} />
                <Stack.Screen name="profile" options={{ headerShown: false }} />
                <Stack.Screen name="privacy-security" options={{ headerShown: false }} />
                <Stack.Screen name="settings" options={{ headerShown: false }} />
              </Stack>
            </View>
          </ThemeProvider>
        </SafeAreaProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}
