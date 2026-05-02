import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
  InteractionManager,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';
import {
  BarChart2,
  DollarSign,
  Download,
  HelpCircle,
  Lock,
  RefreshCw,
  Settings,
  Sparkles,
  Star,
  Sun,
  Tag,
  Users,
  Clock,
  HandCoins,
  AlertCircle,
  Moon,
  LogOut,
} from 'lucide-react-native';
import { useAuth } from '@/context/AuthContext';
import { useDebts } from '@/context/DebtContext';
import { useSettings } from '@/context/SettingsContext';
import api from '@/services/api';
import {
  BentoTile,
  BodySurface,
  DangerZoneRow,
  FooterLinks,
  HeroProfileCard,
  MiniTile,
  ProBanner,
  SectionHeader,
  WideRow,
  useThemeStyles,
} from '@/components/more/DesignSystem';

const IOS_STORE_URL = 'https://apps.apple.com/app/id000000';
const ANDROID_STORE_URL = 'market://details?id=com.budgettracko.app';
const ANDROID_WEB_STORE_URL = 'https://play.google.com/store/apps/details?id=com.budgettracko.app';

function compactINR(value: number) {
  if (value >= 100000) return `Rs ${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `Rs ${(value / 1000).toFixed(1)}k`;
  return `Rs ${Math.round(value)}`;
}

export default function MoreScreen() {
  const isFocused = useIsFocused();
  // Immediate render for better performance




  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { appTheme, setAppTheme } = useSettings();
  const { tokens, isDarkMode } = useThemeStyles();

  const currentThemeLabel = useMemo(() => appTheme === 'system'
    ? 'System'
    : (appTheme === 'dark' ? 'Dark mode' : 'Light mode'), [appTheme]);

  const { debts } = useDebts();
  const [billsDue, setBillsDue] = useState('0');
  const [overBudget, setOverBudget] = useState('0');

  const owedToYouTotal = useMemo(
    () =>
      debts
        .filter((debt: any) => debt.type === 'lend' && debt.status === 'active')
        .reduce((sum: number, debt: any) => sum + Number(debt.amount || 0), 0),
    [debts]
  );

  const initials = useMemo(() => {
    const raw = user?.displayName || 'BT';
    return raw
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'BT';
  }, [user?.displayName]);

  const handleToggleAppearance = useCallback(async () => {
    if (appTheme === 'system') {
      await setAppTheme(isDarkMode ? 'light' : 'dark');
    } else if (appTheme === 'dark') {
      await setAppTheme('light');
    } else {
      await setAppTheme('system');
    }
  }, [appTheme, isDarkMode, setAppTheme]);

  const appVersion = useMemo(() => Constants.expoConfig?.version || '2.0.0', []);
  const planLabel = useMemo(() => user?.subscription?.plan
    ? `${String(user.subscription.plan).toUpperCase()} PLAN`
    : 'FREE PLAN', [user?.subscription?.plan]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const recurringRes = await api.get('/api/recurring');
        const recurringList = Array.isArray(recurringRes.data)
          ? recurringRes.data
          : Array.isArray(recurringRes.data?.data)
            ? recurringRes.data.data
            : [];
        setBillsDue(String(recurringList.length));
      } catch {
        setBillsDue('0');
      }

      try {
        const budgetRes = await api.get('/api/budgets');
        const budgets = Array.isArray(budgetRes.data)
          ? budgetRes.data
          : Array.isArray(budgetRes.data?.data)
            ? budgetRes.data.data
            : [];

        const overBudgetCount = budgets.filter((budget: any) => {
          const spent = Number(budget?.spent || budget?.currentSpent || 0);
          const limit = Number(budget?.limit || budget?.amount || 0);
          return limit > 0 && spent > limit;
        }).length;
        setOverBudget(String(overBudgetCount));
      } catch {
        setOverBudget('0');
      }
    };

    if (isFocused) {
      loadStats();
    }
  }, [isFocused]);

  const openStoreReview = useCallback(async () => {
    const target = Platform.OS === 'ios' ? IOS_STORE_URL : ANDROID_STORE_URL;
    const fallback = Platform.OS === 'ios' ? IOS_STORE_URL : ANDROID_WEB_STORE_URL;

    try {
      const supported = await Linking.canOpenURL(target);
      await Linking.openURL(supported ? target : fallback);
    } catch {
      await Linking.openURL(fallback);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/(auth)/login');
  }, [logout, router]);




  return (
    <View style={[styles.root, { backgroundColor: tokens.bgPrimary }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={tokens.bgPrimary} />

      <ScrollView
        style={[styles.scroll, { backgroundColor: tokens.bgPrimary }]}
        contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 70 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroProfileCard
          initials={initials}
          name={user?.displayName || 'BudgetTracko User'}
          email={user?.email || 'Authenticated mode'}
          planLabel={planLabel}
          syncLabel="Synced"
          avatarUrl={user?.avatar || (user as any)?.photoURL || null}
          onPress={() => router.push('/features/edit-profile')}
          onAvatarPress={() => router.push('/features/edit-profile')}
          stats={[
            { value: billsDue, label: 'Bills due', tone: 'warning', Icon: Clock },
            { value: compactINR(owedToYouTotal), label: 'Owed to you', tone: 'positive', Icon: HandCoins },
            { value: overBudget, label: 'Over budget', tone: 'neutral', Icon: AlertCircle },
          ]}
        />

        <ProBanner onPress={() => router.push('/premium')} />

        <BodySurface>
          <SectionHeader title="Smart tools" />
          <View style={styles.gridRow}>
            <BentoTile
              title="Ask Tracko AI"
              subtitle="Smart finance assistant"
              color={tokens.purple}
              Icon={Sparkles}
              onPress={() => router.push('/features/pulse-ai')}
              showProBadge
            />
            <BentoTile
              title="Budgets"
              subtitle="Limit and monitor"
              color={tokens.teal}
              Icon={BarChart2}
              onPress={() => router.push('/features/budgets')}
            />
          </View>
          <View style={styles.gridRow}>
            <BentoTile
              title="Recurring bills"
              subtitle="Never miss due dates"
              color={tokens.amber}
              Icon={RefreshCw}
              onPress={() => router.push('/features/recurring-bills')}
            />
            <BentoTile
              title="Debts"
              subtitle="Loans and settlements"
              color={tokens.coral}
              Icon={DollarSign}
              onPress={() => router.push('/features/debts')}
            />
          </View>

          <SectionHeader title="Configuration" />
          <WideRow
            title="App settings"
            subtitle="Currency, alerts, and haptics"
            color={tokens.blue}
            Icon={Settings}
            onPress={() => router.push('/features/settings')}
          />
          <WideRow
            title="Privacy & security"
            subtitle="Lock and permissions"
            color={tokens.green}
            Icon={Lock}
            onPress={() => router.push('/features/security')}
          />
          <WideRow
            title="Categories"
            subtitle="Edit spending labels"
            color={tokens.pink}
            Icon={Tag}
            onPress={() => router.push('/features/categories')}
          />

          <SectionHeader title="Appearance & data" />
          <View style={styles.gridRow}>
            <MiniTile
              title="Appearance"
              subtitle="Light mode"
              color={tokens.gray}
              Icon={isDarkMode ? Moon : Sun}
              onPress={handleToggleAppearance}
            />
            <MiniTile
              title="Export data"
              subtitle="CSV and PDF"
              color={tokens.teal}
              Icon={Download}
              onPress={() => router.push('/features/export')}
            />
          </View>

          <SectionHeader title="Community" />
          <WideRow
            title="Invite friends"
            subtitle="Share BudgetTracko"
            color={tokens.purple}
            Icon={Users}
            onPress={() => router.push('/features/share-app')}
          />
          <WideRow
            title="Rate Tracko"
            subtitle="Support with a store review"
            color={tokens.amber}
            Icon={Star}
            onPress={openStoreReview}
          />
          <WideRow
            title="Help & support"
            subtitle="FAQ and assistance"
            color={tokens.gray}
            Icon={HelpCircle}
            onPress={() => router.push('/features/help-support')}
          />

          <WideRow 
            title="Log out" 
            subtitle="End your session securely" 
            color={tokens.red} 
            Icon={LogOut} 
            onPress={async () => {
              await logout();
              router.replace('/(auth)/login');
            }} 
          />

          <FooterLinks
            version={`v${appVersion}`}
            onPrivacy={() => router.push('/features/privacy-security')}
            onTerms={() => Linking.openURL('https://budgettracko.app/terms')}
          />
        </BodySurface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0E0E12',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#0E0E12',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
});
