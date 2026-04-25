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
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { QuickActionProvider } from '@/context/QuickActionContext';
import { SecurityProvider } from '@/context/SecurityContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { DebtProvider } from '@/context/DebtContext';
import { AppState, AppStateStatus } from 'react-native';

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

  return (
    <AuthProvider>
      <SecurityProvider>
        <RootLayoutNav />
      </SecurityProvider>
    </AuthProvider>
  );
}

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#060D1F',
    card: '#0D1630',
    text: '#F1F5F9',
    border: '#1E2D4F',
    notification: '#6366F1',
  },
};

import NetworkBanner from '@/components/NetworkBanner';

function RootLayoutNav() {
  const { isLocked, lockApp, user, hasBiometricKey } = useAuth();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        lockApp();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [lockApp]);

  return (
    <SettingsProvider>
      <DebtProvider>
        <TransactionProvider>
          <QuickActionProvider>
          <SafeAreaProvider>
            <ThemeProvider value={CustomDarkTheme}>
              <View style={{ flex: 1, backgroundColor: '#fff' }}>
                <NetworkBanner />
                <Stack
                  initialRouteName="index"
                  screenOptions={{
                    animation: 'slide_from_right',
                    gestureEnabled: true,
                    fullScreenGestureEnabled: true,
                    headerShown: false,
                    contentStyle: { backgroundColor: '#fff' },
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
        </QuickActionProvider>
      </TransactionProvider>
      </DebtProvider>
    </SettingsProvider>
  );
}
import { StyleSheet } from 'react-native';
