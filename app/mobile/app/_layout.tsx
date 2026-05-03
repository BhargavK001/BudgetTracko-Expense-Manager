import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useCallback } from 'react';
import { useColorScheme, View, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import AnimatedSplash from '../components/AnimatedSplash';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TransactionProvider } from '@/context/TransactionContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { QuickActionProvider } from '@/context/QuickActionContext';
import { SecurityProvider } from '@/context/SecurityContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { DebtProvider } from '@/context/DebtContext';
import { SyncProvider } from '@/context/SyncContext';
import { AccountProvider } from '@/context/AccountContext';
import SyncOnLogin from '@/components/SyncOnLogin';
import { AppState, AppStateStatus } from 'react-native';
import NetworkBanner from '@/components/NetworkBanner';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 100);
    }
  }, [loaded]);

  const handleSplashComplete = useCallback(() => {
    setShowAnimatedSplash(false);
  }, []);

  if (!loaded) return null;
  if (showAnimatedSplash) return <AnimatedSplash onComplete={handleSplashComplete} />;

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

function RootLayoutNav() {
  const { isLocked, lockApp, user, hasBiometricKey, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace('/welcome');
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        lockApp();
      }
    });
    return () => subscription.remove();
  }, [lockApp]);

  return (
    <SettingsProvider>
      <AccountProvider>
        <DebtProvider>
          <SyncProvider>
            <TransactionProvider>
              <SyncOnLogin />
              <QuickActionProvider>
              <SafeAreaProvider>
                <ThemeProvider value={isDarkMode ? CustomDarkTheme : DefaultTheme}>
                  <View style={{ flex: 1, backgroundColor: isDarkMode ? '#060D1F' : '#fff' }}>
                    <NetworkBanner />
                    <Stack
                      initialRouteName="index"
                      screenOptions={{
                        animation: 'slide_from_right',
                        gestureEnabled: true,
                        fullScreenGestureEnabled: true,
                        headerShown: false,
                        contentStyle: { backgroundColor: 'transparent' },
                      }}
                    >
                      <Stack.Screen name="index" options={{ headerShown: false }} />
                      <Stack.Screen name="welcome" options={{ headerShown: false }} />
                      <Stack.Screen name="features" options={{ headerShown: false }} />
                      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                      <Stack.Screen name="premium" options={{ headerShown: false }} />
                      <Stack.Screen name="profile" options={{ headerShown: false }} />
                      <Stack.Screen name="settings" options={{ headerShown: false }} />
                    </Stack>
                  </View>
                </ThemeProvider>
              </SafeAreaProvider>
              </QuickActionProvider>
            </TransactionProvider>
          </SyncProvider>
        </DebtProvider>
      </AccountProvider>
    </SettingsProvider>
  );
}
