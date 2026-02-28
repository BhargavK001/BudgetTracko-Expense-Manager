import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DarkTheme, Spacing, FontSize, BorderRadius } from '@/constants/Theme';
import { useAuth } from '@/context/AuthContext';

type MenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle?: string;
  color: string;
  route?: string;
  badge?: string;
};

const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Account',
    items: [
      { icon: 'person-outline',          label: 'Profile',           subtitle: 'Edit your info',         color: '#6366F1', route: '/profile' },
      { icon: 'settings-outline',        label: 'Settings',          subtitle: 'App preferences',        color: '#94A3B8', route: '/settings' },
      { icon: 'notifications-outline',   label: 'Reminders',         subtitle: 'Manage alerts',          color: '#F59E0B', route: '/settings/reminders' },
      { icon: 'shield-checkmark-outline',label: 'Privacy & Security', subtitle: 'Keep your data safe',   color: '#8B5CF6', route: '/privacy-security' },
    ],
  },
  {
    title: 'Finance',
    items: [
      { icon: 'pie-chart-outline',    label: 'Budgets',        subtitle: 'Track spending limits',  color: '#10B981', route: '/features/budgets' },
      { icon: 'calendar-outline',     label: 'Recurring Bills', subtitle: 'Subscriptions & more',  color: '#EC4899', route: '/features/recurring-bills', badge: '3' },
      { icon: 'download-outline',     label: 'Export Data',    subtitle: 'CSV & PDF reports',      color: '#06B6D4' },
    ],
  },
  {
    title: 'App',
    items: [
      { icon: 'help-circle-outline',  label: 'Help & Support', subtitle: 'FAQs & contact',         color: '#06B6D4', route: '/help-support' },
      { icon: 'star-outline',         label: 'Rate Us',        subtitle: 'Share your feedback',    color: '#FBBF24' },
      { icon: 'share-social-outline', label: 'Share App',      subtitle: 'Invite friends',         color: '#EC4899', route: '/share-app' },
    ],
  },
];

export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleMenuPress = (item: MenuItem) => {
    if (item.route) router.push(item.route as any);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try { await logout(); router.replace('/(auth)/login'); }
            catch (e) { console.error('Logout failed', e); }
          },
        },
      ]
    );
  };

  const plan = 'Free';

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" />

      {/* ─── Header ─── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>More</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── User Card ─── */}
        <TouchableOpacity style={styles.userCard} activeOpacity={0.8} onPress={() => router.push('/profile' as any)}>
          <View style={styles.avatarWrap}>
            <Ionicons name="person" size={22} color={DarkTheme.textAccent} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.displayName || 'BudgetTracko User'}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user?.email || 'Authenticated mode'}</Text>
          </View>
          <View style={styles.planChip}>
            <Text style={styles.planText}>{plan}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={DarkTheme.chevron} />
        </TouchableOpacity>

        {/* ─── Premium Banner ─── */}
        <LinearGradient
          colors={['#1E1B4B', '#312E81']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.premiumBanner}
        >
          <TouchableOpacity
            style={styles.premiumInner}
            activeOpacity={0.8}
            onPress={() => router.push('/premium' as any)}
          >
            <View style={styles.premiumIconWrap}>
              <Ionicons name="diamond" size={20} color={DarkTheme.brandYellow} />
            </View>
            <View style={styles.premiumText}>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumDesc}>Unlock analytics, budgets & more</Text>
            </View>
            <View style={styles.premiumArrow}>
              <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </LinearGradient>

        {/* ─── Menu Groups ─── */}
        {MENU_GROUPS.map((group) => (
          <View key={group.title} style={styles.menuGroup}>
            <Text style={styles.menuGroupTitle}>{group.title}</Text>
            <View style={styles.menuCard}>
              {group.items.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.menuItem, idx < group.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => handleMenuPress(item)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.menuIconWrap, { backgroundColor: item.color + '22' }]}>
                    <Ionicons name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={styles.menuLabels}>
                    <Text style={styles.menuLabel}>{item.label}</Text>
                    {item.subtitle ? <Text style={styles.menuSub}>{item.subtitle}</Text> : null}
                  </View>
                  {item.badge ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                  <Ionicons name="chevron-forward" size={15} color={DarkTheme.chevron} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ─── Logout ─── */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color={DarkTheme.spending} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>BudgetTracko v1.0.0 · Made with ❤️</Text>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DarkTheme.bg,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  // User Card
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: DarkTheme.border,
    gap: Spacing.md,
  },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(99,102,241,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.3)',
  },
  userInfo: { flex: 1 },
  userName: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: DarkTheme.textPrimary,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '500',
  },
  planChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: DarkTheme.cardBgElevated,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  planText: {
    fontSize: 10,
    fontWeight: '700',
    color: DarkTheme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Premium Banner
  premiumBanner: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.4)',
  },
  premiumInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  premiumIconWrap: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(251,191,36,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumText: { flex: 1 },
  premiumTitle: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  premiumDesc: {
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
  },
  premiumArrow: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Menu Groups
  menuGroup: {
    marginBottom: Spacing.xl,
  },
  menuGroupTitle: {
    fontSize: FontSize.xs,
    fontWeight: '700',
    color: DarkTheme.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  menuCard: {
    backgroundColor: DarkTheme.cardBg,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: DarkTheme.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: DarkTheme.separator,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabels: { flex: 1 },
  menuLabel: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: DarkTheme.textPrimary,
    marginBottom: 1,
  },
  menuSub: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    fontWeight: '500',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: DarkTheme.accent,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: 'rgba(244,63,94,0.1)',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(244,63,94,0.25)',
  },
  logoutText: {
    fontSize: FontSize.md,
    fontWeight: '800',
    color: DarkTheme.spending,
  },
  version: {
    fontSize: FontSize.xs,
    color: DarkTheme.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    fontWeight: '500',
  },
});
