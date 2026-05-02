import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Image, Alert, FlatList, InteractionManager, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTransactions, CATEGORY_ICONS, CATEGORY_COLORS, Category, mapCategoryIcon } from '@/context/TransactionContext';
import { LucideCategoryIcon } from '@/app/features/categories';
import { useAuth } from '@/context/AuthContext';
import { useQuickAction } from '@/context/QuickActionContext';
import { useSettings } from '@/context/SettingsContext';
import { useThemeStyles } from '@/components/more/DesignSystem';
import { DashboardSkeleton } from '@/components/SkeletonLoader';
import * as Haptics from 'expo-haptics';
import Animated, {
  FadeInDown, FadeInUp, FadeIn, ZoomIn, FadeInLeft, FadeInRight,
  useSharedValue, useAnimatedStyle,
  withRepeat, withTiming, withSequence, withSpring,
  Easing,
} from 'react-native-reanimated';

// ── Helpers ──────────────────────────────────────────────────
function fmt(n: number, formatCurrency: (n: number) => string): string {
  return formatCurrency(Math.abs(n));
}
function fmtDate(day: number, month: number): string {
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${m[month]}`;
}
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
function todayStr(): string {
  const d = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${m[d.getMonth()]}`;
}

// ── Floating glow ────────────────────────────────────────────
function useFloat() {
  const y = useSharedValue(0);
  useEffect(() => {
    y.value = withRepeat(
      withSequence(
        withTiming(-7, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ), -1, false,
    );
  }, []);
  return useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
}

// ── Bouncy button wrapper ────────────────────────────────────
const BounceButton = React.memo(function BounceButton({ children, onPress, style }: any) {
  const sc = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));
  const press = useCallback(() => {
    sc.value = withSequence(withSpring(0.88, { damping: 12 }), withSpring(1, { damping: 10 }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  }, [onPress]);
  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity onPress={press} activeOpacity={0.9} style={style}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
});

// ─────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const isFocused = useIsFocused();
  // Removed isReady/InteractionManager logic as it conflicts with infinite floating animations




  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tokens } = useThemeStyles();
  const { transactions, getTotalIncome, getTotalExpense, getBalance, getTotalBudget, getCategoryMeta } = useTransactions();
  const { user, loading: authLoading } = useAuth();
  const { openModal } = useQuickAction();
  const { isDarkMode, formatCurrency } = useSettings();
  const [hidden, setHidden] = useState(false);
  const floatStyle = useFloat();

  const now = useMemo(() => new Date(), []);
  const mon = now.getMonth();
  const yr = now.getFullYear();

  const income = useMemo(() => getTotalIncome(mon, yr), [getTotalIncome, mon, yr]);
  const expense = useMemo(() => getTotalExpense(mon, yr), [getTotalExpense, mon, yr]);
  const balance = useMemo(() => getBalance(), [getBalance]);
  const savingsRate = useMemo(() => income <= 0 ? 0 : Math.max(0, ((income - expense) / income) * 100), [income, expense]);

  const dayOfMonth = now.getDate();
  const projectedExpense = dayOfMonth > 0 ? (expense / dayOfMonth) * 30 : 0;
  const spendTarget = useMemo(() => getTotalBudget('monthly') || 30000, [getTotalBudget]);
  const pacePercent = spendTarget > 0 ? Math.min((projectedExpense / spendTarget) * 100, 150) : 0;
  const overPace = pacePercent > 100;

  const recentTxs = useMemo(() => transactions.slice(0, 6), [transactions]);

  const actions = useMemo(() => [
    { icon: 'arrow-top-right', label: 'Send', type: 'expense' as const },
    { icon: 'arrow-bottom-left', label: 'Receive', type: 'income' as const },
    { icon: 'qrcode-scan', label: 'Scan', route: '/features/scan' },
    { icon: 'file-document-outline', label: 'Bills', route: '/features/recurring-bills' },
    { icon: 'bank-transfer', label: 'Transfer', type: 'transfer' as const },
  ], []);

  const toggleHidden = useCallback(() => {
    Haptics.selectionAsync();
    setHidden(h => !h);
  }, []);
  const onNotification = useCallback(() => Alert.alert('Notifications', 'No new notifications'), []);

  const renderTxItem = useCallback(({ item: tx, index: i }: { item: any; index: number }) => {
    const meta = getCategoryMeta(tx.category || 'Other');
    const iconColor = meta.color;
    return (
      <Animated.View entering={FadeIn.delay(i * 20).duration(200)} style={styles.txRow}>

        <View style={[styles.txIconWrap, { backgroundColor: iconColor + '1A' }]}>
          {meta.isLucide ? (
            <LucideCategoryIcon name={meta.icon} size={20} color={iconColor} />
          ) : (
            <Ionicons
              name={mapCategoryIcon(meta.icon) as any}
              size={20}
              color={iconColor}
            />
          )}
        </View>
        <View style={styles.txMid}>
          <Text style={[styles.txTitle, { color: tokens.textPrimary }]} numberOfLines={1}>{tx.title}</Text>
          <View style={styles.txMeta}>
            <Text style={[styles.txCat, { color: tokens.textMuted }]}>{tx.category || 'General'}</Text>
            <Text style={[styles.txDot, { color: tokens.borderSubtle }]}>·</Text>
            <Text style={[styles.txDate, { color: tokens.textMuted }]}>{fmtDate(tx.day, tx.month)}</Text>
          </View>
        </View>
        <Text style={[styles.txAmt, { color: tx.type === 'income' ? '#2DCA72' : tokens.textPrimary }]}>
          {tx.type === 'income' ? '+' : '−'}{formatCurrency(tx.amount)}
        </Text>
      </Animated.View>
    );
  }, [getCategoryMeta, formatCurrency, tokens]);

  const txKeyExtractor = useCallback((item: any) => item.id, []);

  if (authLoading) {
    return (
      <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: tokens.bgPrimary, paddingTop: insets.top }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ═══ 1. HEADER ═══ */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.header}>

          <View style={styles.headerLeft}>
            <View>
              {user?.avatar ? (
                <Image source={{ uri: user.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: tokens.bgSecondary, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: tokens.borderSubtle }]}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: '#6366F1' }}>
                    {user?.displayName ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '?'}
                  </Text>
                </View>
              )}
              <View style={[styles.onlineDot, { borderColor: tokens.bgPrimary }]} />
            </View>
            <View>
              <Text style={[styles.dateText, { color: tokens.textMuted }]}>{todayStr()}</Text>
              <Text style={[styles.greetText, { color: tokens.textSecondary }]}>
                {greeting()}, <Text style={[styles.nameText, { color: tokens.textPrimary }]}>{(user as any)?.displayName?.split(' ')[0] || 'User'}</Text>
              </Text>
            </View>
          </View>
          <BounceButton onPress={onNotification} style={[styles.bellBtn, { backgroundColor: tokens.bgSecondary }]}>
            <MaterialCommunityIcons name="bell-outline" size={22} color={tokens.textPrimary} />
            <View style={[styles.badge, { borderColor: tokens.bgSecondary }]} />
          </BounceButton>
        </Animated.View>

        {/* ═══ 2. BALANCE HERO CARD ═══ */}
        <Animated.View entering={FadeInDown.duration(400)}>

          <LinearGradient
            colors={isDarkMode ? ['#1A1C20', '#0F1014'] : ['#111111', '#2D2D2D']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <Animated.View style={[styles.heroGlow, floatStyle, { backgroundColor: isDarkMode ? 'rgba(45,202,114,0.1)' : 'rgba(45,202,114,0.18)' }]} />

            <View style={styles.heroTop}>
              <View>
                <Text style={styles.heroLabel}>Total Balance</Text>
                <Animated.Text entering={ZoomIn.delay(300).duration(400)} style={styles.heroAmount}>
                  {hidden ? `${formatCurrency(0).charAt(0)} ••••••` : fmt(balance, formatCurrency)}
                </Animated.Text>
              </View>
              <TouchableOpacity onPress={toggleHidden}>
                <MaterialCommunityIcons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={22} color={isDarkMode ? 'rgba(255,255,255,0.4)' : '#8E8E93'} />
              </TouchableOpacity>
            </View>

            <View style={styles.savingsBarOuter}>
              <View style={[styles.savingsBarFill, { width: `${Math.min(savingsRate, 100)}%` as any }]} />
            </View>
            <Text style={styles.savingsLabel}>
              {savingsRate.toFixed(0)}% saved this month
            </Text>

            <Animated.View entering={FadeIn.duration(300)} style={styles.heroPills}>

              <View style={styles.heroPillGreen}>
                <MaterialCommunityIcons name="arrow-down-left" size={14} color="#2DCA72" />
                <Text style={styles.heroPillGreenText}>Income</Text>
                <Text style={styles.heroPillGreenAmt}>{hidden ? '••••' : fmt(income, formatCurrency)}</Text>
              </View>
              <View style={styles.heroPillRed}>
                <MaterialCommunityIcons name="arrow-up-right" size={14} color="#F43F5E" />
                <Text style={styles.heroPillRedText}>Expense</Text>
                <Text style={styles.heroPillRedAmt}>{hidden ? '••••' : fmt(expense, formatCurrency)}</Text>
              </View>
            </Animated.View>
          </LinearGradient>
        </Animated.View>

        {/* ═══ 3. QUICK ACTIONS ═══ */}
        <View style={styles.actionsRow}>
          {actions.map((a: any, i) => (
            <Animated.View key={a.label} entering={FadeIn.delay(i * 30).duration(250)} style={styles.actionItem}>

              <BounceButton
                onPress={() => {
                  if (a.route) router.push(a.route as any);
                  else if (a.type) openModal(a.type);
                }}
                style={[styles.actionCircle, { backgroundColor: tokens.bgSecondary }]}
              >
                <MaterialCommunityIcons name={a.icon as any} size={22} color={tokens.textPrimary} />
              </BounceButton>
              <Text style={[styles.actionLabel, { color: tokens.textSecondary }]}>{a.label}</Text>
            </Animated.View>
          ))}
        </View>

        {/* ═══ 5. SPENDING PACE ═══ */}
        <Animated.View entering={FadeIn.duration(300)} style={[styles.paceCard, { backgroundColor: isDarkMode ? tokens.cardSurface : '#F9F9FB' }]}>

          <View style={styles.paceHeader}>
            <View style={styles.paceLeft}>
              <MaterialCommunityIcons name="speedometer" size={16} color={tokens.textPrimary} />
              <Text style={[styles.paceTitle, { color: tokens.textPrimary }]}>Spending Pace</Text>
            </View>
            <View style={[styles.paceBadge, { backgroundColor: overPace ? 'rgba(244,63,94,0.1)' : 'rgba(45,202,114,0.1)' }]}>
              <Text style={[styles.paceBadgeText, { color: overPace ? '#F43F5E' : '#2DCA72' }]}>
                {overPace ? 'Over pace' : 'On track'}
              </Text>
            </View>
          </View>
          <View style={[styles.paceBarOuter, { backgroundColor: tokens.borderSubtle }]}>
            <View style={[styles.paceBarFill, {
              width: `${Math.min(pacePercent, 100)}%` as any,
              backgroundColor: overPace ? '#F43F5E' : '#2DCA72',
            }]} />
          </View>
          <View style={styles.paceFooter}>
            <Text style={[styles.paceSub, { color: tokens.textMuted }]}>Projected: {fmt(projectedExpense, formatCurrency)}</Text>
            <Text style={[styles.paceSub, { color: tokens.textMuted }]}>Target: {fmt(spendTarget, formatCurrency)}/mo</Text>
          </View>
        </Animated.View>

        {/* ═══ 6. RECENT ACTIVITY ═══ */}
        <Animated.View entering={FadeIn.duration(300)} style={styles.sectionHeader}>

          <Text style={[styles.sectionTitle, { color: tokens.textPrimary }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => router.push('/features/transactions')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.txList}>
          {recentTxs.length === 0 ? (
            <Animated.View entering={FadeIn.duration(300)} style={styles.emptyState}>

              <View style={[styles.emptyIcon, { backgroundColor: tokens.bgSecondary }]}>
                <MaterialCommunityIcons name="receipt" size={32} color={tokens.textMuted} />
              </View>
              <Text style={[styles.emptyH, { color: tokens.textPrimary }]}>No transactions yet</Text>
              <Text style={[styles.emptyP, { color: tokens.textMuted }]}>Tap the + button below to add your first transaction.</Text>
            </Animated.View>
          ) : (
            recentTxs.map((tx, i) => (
              <View key={tx.id || tx._id || i}>
                {renderTxItem({ item: tx, index: i })}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 46, height: 46, borderRadius: 23 },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 10, height: 10, borderRadius: 5, backgroundColor: '#2DCA72', borderWidth: 2 },
  dateText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 2 },
  greetText: { fontSize: 16, fontWeight: '600' },
  nameText: { fontWeight: '800' },
  bellBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 11, right: 11, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F43F5E', borderWidth: 1.5 },
  heroCard: { borderRadius: 24, padding: 24, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  heroGlow: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: -50, right: -40 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  heroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
  heroAmount: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -1 },
  savingsBarOuter: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, marginTop: 10, marginBottom: 6 },
  savingsBarFill: { height: '100%', borderRadius: 2, backgroundColor: '#2DCA72' },
  savingsLabel: { fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 16 },
  heroPills: { flexDirection: 'row', gap: 10 },
  heroPillGreen: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(45,202,114,0.1)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  heroPillGreenText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 },
  heroPillGreenAmt: { fontSize: 13, fontWeight: '700', color: '#2DCA72' },
  heroPillRed: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(244,63,94,0.1)', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12 },
  heroPillRedText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', flex: 1 },
  heroPillRedAmt: { fontSize: 13, fontWeight: '700', color: '#F43F5E' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 4 },
  actionItem: { alignItems: 'center', gap: 7 },
  actionCircle: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '600' },
  overviewRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  overviewCard: { flex: 1, borderRadius: 18, padding: 16, borderWidth: 1 },
  overviewCardGreen: { borderColor: 'rgba(45,202,114,0.2)' },
  overviewCardRed: { borderColor: 'rgba(244,63,94,0.15)' },
  overviewIconWrap: { marginBottom: 10 },
  overviewIconBg: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  overviewLabel: { fontSize: 12, fontWeight: '500', marginBottom: 4 },
  overviewAmt: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },
  overviewTag: { marginTop: 6 },
  overviewTagText: { fontSize: 10, fontWeight: '600' },
  paceCard: { borderRadius: 16, padding: 16, marginBottom: 24 },
  paceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  paceLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  paceTitle: { fontSize: 13, fontWeight: '700' },
  paceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  paceBadgeText: { fontSize: 10, fontWeight: '700' },
  paceBarOuter: { height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 },
  paceBarFill: { height: '100%', borderRadius: 3 },
  paceFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  paceSub: { fontSize: 10, fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontSize: 17, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '600', color: '#2DCA72' },
  txList: { gap: 4 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 14 },
  txIconWrap: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  txMid: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '600', marginBottom: 3 },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  txCat: { fontSize: 11, fontWeight: '500' },
  txDot: { fontSize: 11 },
  txDate: { fontSize: 11 },
  txAmt: { fontSize: 15, fontWeight: '700' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyH: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptyP: { fontSize: 13, textAlign: 'center', lineHeight: 20, maxWidth: 240 },
});