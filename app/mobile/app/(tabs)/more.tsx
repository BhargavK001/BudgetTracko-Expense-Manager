import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, Switch, TextInput, Modal, Platform, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import api, { API_BASE_URL } from '@/services/api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Animated, {
  FadeInDown, FadeIn, SlideInLeft, BounceIn,
  useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming,
  Easing,
} from 'react-native-reanimated';

// ── Pulsing Badge ────────────────────────────────────────────
const PulsingBadge = React.memo(({ text }: { text: string }) => {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
      ), -1, true
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  return (
    <Animated.View style={[s.badge, animStyle]}>
      <Text style={s.badgeText}>{text}</Text>
    </Animated.View>
  );
});

// ── Glowing Premium Icon ─────────────────────────────────────
const GlowingIcon = React.memo(() => {
  const glow = useSharedValue(0.15);
  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.15, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ), -1, true
    );
  }, []);
  const animStyle = useAnimatedStyle(() => ({
    shadowOpacity: glow.value, shadowColor: '#F59E0B', shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
  }));
  return (
    <Animated.View style={[s.premiumIconWrap, animStyle]}>
      <Ionicons name="diamond" size={20} color="#F59E0B" />
    </Animated.View>
  );
});

// ── Types ────────────────────────────────────────────────────
type MenuItem = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  subtitle?: string;
  color: string;
  route?: string;
  badge?: string;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
};

type MenuGroup = { title: string; items: MenuItem[]; delay: number };

// ══════════════════════════════════════════════════════════════
export default function MoreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [recurringCount, setRecurringCount] = useState<string | undefined>(undefined);

  // Fetch recurring bills count
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/recurring');
        if (res.data?.length > 0) setRecurringCount(String(res.data.length));
      } catch (e) { /* ignore */ }
    })();
  }, []);

  const userPlan = user?.subscription?.status === 'active' || user?.subscription?.status === 'authenticated'
    ? (user?.subscription?.plan || 'Pro') : 'Free';

  // ── Handlers ────────────────────────────────────────────
  const handleMenuPress = useCallback((item: MenuItem) => {
    if (item.onPress) return item.onPress();
    if (item.route) router.push(item.route as any);
  }, [router]);

  const handleExportCSV = useCallback(async () => {
    Alert.alert('Export CSV', 'Your transactions will be exported as a CSV spreadsheet.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Export', onPress: async () => {
          try {
            const token = (await import('@react-native-async-storage/async-storage')).default;
            const storedToken = await token.getItem('token');
            const fileUri = FileSystem.documentDirectory + `budgettracko_export_${new Date().toISOString().split('T')[0]}.csv`;
            const downloadResult = await FileSystem.downloadAsync(
              `${API_BASE_URL}/api/user/export/csv`,
              fileUri,
              { headers: { Authorization: `Bearer ${storedToken}` } }
            );
            if (downloadResult.status === 200) {
              const canShare = await Sharing.isAvailableAsync();
              if (canShare) {
                await Sharing.shareAsync(downloadResult.uri, { mimeType: 'text/csv', dialogTitle: 'Export Transactions' });
              } else {
                Alert.alert('Success', `CSV saved to ${downloadResult.uri}`);
              }
            } else {
              Alert.alert('Error', 'Failed to download CSV.');
            }
          } catch (e: any) {
            Alert.alert('Error', e.message || 'Export failed.');
          }
        }
      },
    ]);
  }, []);

  const handleClearData = useCallback(() => {
    Alert.alert(
      '⚠️ Clear All Data',
      'This will permanently delete ALL your transactions, accounts, categories, and budgets. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear Everything', style: 'destructive', onPress: async () => {
            try {
              const res = await api.delete('/api/user/data');
              if (res.data?.success) {
                const d = res.data.deleted;
                Alert.alert('Done', `Cleared ${d.transactions} transactions, ${d.accounts} accounts, ${d.categories} categories, ${d.budgets} budgets.`);
              } else {
                Alert.alert('Error', 'Failed to clear data.');
              }
            } catch (e: any) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to clear data.');
            }
          }
        },
      ]
    );
  }, []);

  const handleDeleteAccount = useCallback(() => { setDeleteInput(''); setDeleteModalVisible(true); }, []);

  const confirmDeleteAccount = useCallback(async () => {
    if (deleteInput !== 'DELETE') { Alert.alert('Error', 'Please type DELETE to confirm.'); return; }
    setDeleteModalVisible(false);
    try {
      await api.delete('/api/user/account');
      await logout(); router.replace('/(auth)/login');
    } catch (e: any) { Alert.alert('Error', e.response?.data?.message || 'Failed to delete account.'); }
  }, [deleteInput, logout, router]);

  const handleLogout = useCallback(() => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out', style: 'destructive',
        onPress: async () => {
          try { await logout(); router.replace('/(auth)/login'); }
          catch (e) { console.error('Logout failed', e); }
        },
      },
    ]);
  }, [logout, router]);

  const closeDeleteModal = useCallback(() => setDeleteModalVisible(false), []);

  // ── Menu Data (memoized) ───────────────────────────────
  const MENU_GROUPS: MenuGroup[] = useMemo(() => [
    {
      title: 'Account', delay: 100,
      items: [
        { icon: 'person-outline', label: 'Profile', subtitle: 'Edit your info', color: '#6366F1', route: '/profile' },
        { icon: 'settings-outline', label: 'Settings', subtitle: 'App preferences', color: '#8E8E93', route: '/settings' },
        { icon: 'shield-checkmark-outline', label: 'Privacy & Security', subtitle: 'Keep your data safe', color: '#8B5CF6', route: '/privacy-security' },
      ],
    },
    {
      title: 'Preferences', delay: 200,
      items: [
        {
          icon: darkModeEnabled ? 'moon-outline' : 'sunny-outline',
          label: 'Appearance',
          subtitle: darkModeEnabled ? 'Dark Mode' : 'Light Mode',
          color: '#6366F1', toggle: true, toggleValue: darkModeEnabled,
          onToggle: (v) => setDarkModeEnabled(v),
        },
        {
          icon: 'notifications-outline', label: 'Notifications',
          subtitle: notificationsEnabled ? 'Enabled' : 'Disabled',
          color: '#F59E0B', toggle: true, toggleValue: notificationsEnabled,
          onToggle: async (v) => {
            setNotificationsEnabled(v);
            try {
              await api.put('/api/user/preferences', { notifications: v });
            } catch (e) {
              // Revert on failure
              setNotificationsEnabled(!v);
            }
          },
        },
        { icon: 'grid-outline', label: 'Categories', subtitle: 'Manage expense & income categories', color: '#06B6D4', route: '/features/categories' },
      ],
    },
    {
      title: 'Finance', delay: 300,
      items: [
        { icon: 'pie-chart-outline', label: 'Budgets', subtitle: 'Track spending limits', color: '#10B981', route: '/features/budgets' },
        { icon: 'calendar-outline', label: 'Recurring Bills', subtitle: 'Subscriptions & more', color: '#EC4899', route: '/features/recurring-bills', badge: recurringCount },
      ],
    },
    {
      title: 'Data', delay: 400,
      items: [
        { icon: 'document-text-outline', label: 'Export CSV', subtitle: 'Spreadsheet compatible', color: '#06B6D4', onPress: handleExportCSV },
        { icon: 'trash-outline', label: 'Clear All Data', subtitle: 'Delete all transactions & budgets', color: '#F43F5E', danger: true, onPress: handleClearData },
      ],
    },
    {
      title: 'App', delay: 500,
      items: [
        { icon: 'help-circle-outline', label: 'Help & Support', subtitle: 'FAQs & contact', color: '#06B6D4', route: '/help-support' },
        { icon: 'star-outline', label: 'Rate Us', subtitle: 'Share your feedback', color: '#FBBF24', onPress: () => { const url = Platform.OS === 'ios' ? 'https://apps.apple.com/app/budgettracko/id000000' : 'https://play.google.com/store/apps/details?id=com.budgettracko.app'; Linking.openURL(url); } },
        { icon: 'share-social-outline', label: 'Share App', subtitle: 'Invite friends', color: '#EC4899', route: '/share-app' },
      ],
    },
    {
      title: 'Danger Zone', delay: 600,
      items: [
        { icon: 'person-remove-outline', label: 'Delete Account', subtitle: 'Permanently delete your account & data', color: '#EF4444', danger: true, onPress: handleDeleteAccount },
      ],
    },
  ], [darkModeEnabled, notificationsEnabled, handleExportCSV, handleClearData, handleDeleteAccount]);

  return (
    <View style={[s.root, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <Animated.View entering={FadeIn.delay(50).duration(300)} style={s.header}>
        <View>
          <Text style={s.headerTitle}>More</Text>
          <View style={s.headerAccent} />
        </View>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ─── User Card ─── */}
        <Animated.View entering={FadeInDown.delay(80).duration(500).springify()}>
          <TouchableOpacity style={s.userCard} activeOpacity={0.8} onPress={() => router.push('/profile' as any)}>
            <View style={s.avatarWrap}>
              <Ionicons name="person" size={22} color="#6366F1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.userName}>{user?.displayName || 'BudgetTracko User'}</Text>
              <Text style={s.userEmail} numberOfLines={1}>{user?.email || 'Authenticated mode'}</Text>
            </View>
            <View style={[s.planChip, userPlan !== 'Free' && { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
              <Text style={[s.planText, userPlan !== 'Free' && { color: '#F59E0B' }]}>{userPlan}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
          </TouchableOpacity>
        </Animated.View>

        {/* ─── Premium Banner ─── */}
        <Animated.View entering={SlideInLeft.delay(150).duration(500).springify()}>
          <LinearGradient
            colors={['#1A1C20', '#0F1014']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.premiumBanner}
          >
            <TouchableOpacity style={s.premiumInner} activeOpacity={0.8} onPress={() => router.push('/premium' as any)}>
              <GlowingIcon />
              <View style={{ flex: 1 }}>
                <Text style={s.premiumTitle}>Upgrade to Premium</Text>
                <Text style={s.premiumDesc}>Unlock analytics, budgets & more</Text>
              </View>
              <View style={s.premiumArrow}>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* ─── Menu Groups ─── */}
        {MENU_GROUPS.map((group) => (
          <Animated.View key={group.title} entering={FadeInDown.delay(group.delay).duration(400).springify()} style={s.menuGroup}>
            <Text style={s.menuGroupTitle}>{group.title}</Text>
            <View style={[s.menuCard, group.title === 'Danger Zone' && s.dangerCard]}>
              {group.items.map((item, idx) => (
                <Animated.View key={idx} entering={FadeInDown.delay(group.delay + (idx + 1) * 50).duration(300)}>
                  <TouchableOpacity
                    style={[s.menuItem, idx < group.items.length - 1 && s.menuItemBorder]}
                    onPress={() => handleMenuPress(item)}
                    activeOpacity={0.6}
                  >
                    <View style={[s.menuIconWrap, { backgroundColor: item.danger ? 'rgba(244,63,94,0.08)' : item.color + '14' }]}>
                      <Ionicons name={item.icon} size={18} color={item.danger ? '#F43F5E' : item.color} />
                    </View>
                    <View style={s.menuLabels}>
                      <Text style={[s.menuLabel, item.danger && { color: '#F43F5E' }]}>{item.label}</Text>
                      {item.subtitle && <Text style={s.menuSub}>{item.subtitle}</Text>}
                    </View>
                    {item.badge && <PulsingBadge text={item.badge} />}
                    {item.toggle ? (
                      <Switch
                        value={item.toggleValue}
                        onValueChange={item.onToggle}
                        trackColor={{ false: '#E5E5EA', true: '#2DCA72' }}
                        thumbColor="#fff"
                        ios_backgroundColor="#E5E5EA"
                      />
                    ) : (
                      !item.badge && <Ionicons name="chevron-forward" size={15} color="#C7C7CC" />
                    )}
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        ))}

        {/* ─── Logout ─── */}
        <Animated.View entering={BounceIn.delay(700).duration(500)}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color="#F43F5E" />
            <Text style={s.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text entering={FadeIn.delay(800).duration(500)} style={s.version}>
          BudgetTracko v1.0.0 · Made with ❤️
        </Animated.Text>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ─── Delete Account Modal ─── */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            <View style={s.modalHeader}>
              <View style={s.modalDangerIcon}>
                <Ionicons name="warning" size={28} color="#EF4444" />
              </View>
              <Text style={s.modalTitle}>Delete Account?</Text>
            </View>
            <Text style={s.modalMsg}>
              This will <Text style={{ fontWeight: '900', color: '#EF4444' }}>permanently delete</Text>{' '}your account and all data. This action cannot be undone.
            </Text>
            <Text style={s.modalHint}>Type <Text style={{ fontWeight: '900', color: '#EF4444' }}>DELETE</Text>{' '}to confirm:</Text>
            <TextInput
              style={s.modalInput}
              placeholder="Type DELETE"
              placeholderTextColor="#C7C7CC"
              value={deleteInput}
              onChangeText={setDeleteInput}
              autoCapitalize="characters"
            />
            <View style={s.modalBtns}>
              <TouchableOpacity style={s.modalCancelBtn} onPress={closeDeleteModal}>
                <Text style={s.modalCancelTxt}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalDeleteBtn, deleteInput !== 'DELETE' && { opacity: 0.35 }]}
                disabled={deleteInput !== 'DELETE'}
                onPress={confirmDeleteAccount}
              >
                <Ionicons name="trash" size={14} color="#fff" />
                <Text style={s.modalDeleteTxt}>Delete Forever</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },

  // Header
  header: { paddingHorizontal: 24, paddingVertical: 14 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111' },
  headerAccent: { width: 40, height: 3, backgroundColor: '#2DCA72', borderRadius: 2, marginTop: 6 },

  scroll: { paddingHorizontal: 24, paddingTop: 8 },

  // User Card
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 18, padding: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#F2F2F7',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  avatarWrap: {
    width: 48, height: 48, borderRadius: 16,
    backgroundColor: 'rgba(99,102,241,0.08)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(99,102,241,0.15)',
  },
  userName: { fontSize: 14, fontWeight: '800', color: '#111', marginBottom: 2 },
  userEmail: { fontSize: 10, color: '#8E8E93', fontWeight: '500' },
  planChip: {
    paddingHorizontal: 8, paddingVertical: 4,
    backgroundColor: '#F5F5F5', borderRadius: 20,
    borderWidth: 1, borderColor: '#F2F2F7',
  },
  planText: { fontSize: 10, fontWeight: '700', color: '#8E8E93', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Premium Banner (stays dark — intentional contrast)
  premiumBanner: {
    borderRadius: 20, marginBottom: 20, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  premiumInner: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  premiumIconWrap: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: 'rgba(245,158,11,0.15)',
    justifyContent: 'center', alignItems: 'center',
  },
  premiumTitle: { fontSize: 14, fontWeight: '800', color: '#fff', marginBottom: 2 },
  premiumDesc: { fontSize: 10, color: 'rgba(255,255,255,0.55)', fontWeight: '500' },
  premiumArrow: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
  },

  // Menu Groups
  menuGroup: { marginBottom: 20 },
  menuGroupTitle: {
    fontSize: 10, fontWeight: '700', color: '#8E8E93',
    textTransform: 'uppercase', letterSpacing: 1.2,
    marginBottom: 8, paddingHorizontal: 4,
  },
  menuCard: {
    backgroundColor: '#fff', borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: '#F2F2F7',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8 }, android: { elevation: 2 } }),
  },
  dangerCard: { borderColor: 'rgba(239,68,68,0.15)' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F2F2F7' },
  menuIconWrap: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  menuLabels: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 1 },
  menuSub: { fontSize: 10, color: '#8E8E93', fontWeight: '500' },
  badge: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#F43F5E', borderRadius: 20 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#fff' },

  // Logout
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 16,
    backgroundColor: 'rgba(244,63,94,0.06)', borderRadius: 16,
    marginBottom: 16, borderWidth: 1, borderColor: 'rgba(244,63,94,0.12)',
  },
  logoutText: { fontSize: 14, fontWeight: '800', color: '#F43F5E' },
  version: { fontSize: 10, color: '#C7C7CC', textAlign: 'center', marginBottom: 16, fontWeight: '500' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: {
    width: '100%', backgroundColor: '#fff', borderRadius: 24, padding: 24,
    borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)',
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 24 }, android: { elevation: 8 } }),
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  modalDangerIcon: {
    width: 46, height: 46, borderRadius: 14,
    backgroundColor: 'rgba(239,68,68,0.08)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111' },
  modalMsg: { fontSize: 13, fontWeight: '500', color: '#8E8E93', lineHeight: 20, marginBottom: 16 },
  modalHint: { fontSize: 12, fontWeight: '600', color: '#8E8E93', marginBottom: 8 },
  modalInput: {
    backgroundColor: '#F5F5F5', borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, fontWeight: '800', color: '#111', letterSpacing: 3,
    borderWidth: 1, borderColor: '#F2F2F7', marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalCancelBtn: {
    flex: 1, alignItems: 'center', paddingVertical: 14,
    borderRadius: 14, backgroundColor: '#F5F5F5',
  },
  modalCancelTxt: { fontSize: 14, fontWeight: '800', color: '#3A3A3C' },
  modalDeleteBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 14, borderRadius: 14, backgroundColor: '#EF4444',
  },
  modalDeleteTxt: { fontSize: 13, fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.5 },
});
